import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { sendTelegramMessage } from "@/lib/send-telegram";
import { sendEmail, buildOrderConfirmationEmail } from "@/lib/send-email";
import { getUserSession } from "@/lib/get-user-session";

interface OrderItemBody {
  id: string;
  quantity: number;
  // Optional fields from client (fallback)
  name?: string;
  price?: number;
  specialPrice?: number;
  unit?: string;
}

interface OrderBody {
  name: string;
  phone: string;
  email?: string;
  deliveryMethod: "pickup" | "delivery";
  address?: string;
  comment?: string;
  items: OrderItemBody[];
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderBody = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Имя и телефон обязательны" },
        { status: 400 },
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Корзина пуста" },
        { status: 400 },
      );
    }

    // Fetch actual prices and stock from DB
    const productIds = body.items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, specialPrice: true, unit: true, stock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check stock availability
    const outOfStock: string[] = [];
    for (const item of body.items) {
      const product = productMap.get(item.id);
      if (!product) continue;
      if (product.stock < item.quantity) {
        outOfStock.push(`${product.name} (в наличии ${product.stock}, запрошено ${item.quantity})`);
      }
    }
    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: `Недостаточно товара на складе: ${outOfStock.join(", ")}` },
        { status: 400 },
      );
    }

    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.id);
      if (!product) throw new Error(`Товар ${item.id} не найден`);
      const effectivePrice =
        product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price
          ? product.specialPrice
          : product.price;
      return {
        productId: item.id,
        qty: item.quantity,
        price: effectivePrice,
        total: effectivePrice * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.total, 0);

    // Get authenticated user if available
    const session = await getUserSession();

    // Save order to DB
    const order = await prisma.order.create({
      data: {
        token: crypto.randomUUID(),
        userId: session?.id || null,
        fullName: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        comment: body.comment || null,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    // Decrease stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    // Send to Telegram
    const itemsText = body.items
      .map((item, i) => {
        const product = productMap.get(item.id);
        const effectivePrice = orderItems[i].price;
        const total = orderItems[i].total;
        const unitLabels: Record<string, string> = { PCS: "шт", METER: "м", M2: "м²", KG: "кг", PACK: "уп", SET: "компл" };
        const unit = product ? (unitLabels[product.unit] || "шт") : "шт";
        return `${i + 1}. ${product?.name || item.id}\n   ${effectivePrice}₽ × ${item.quantity} ${unit} = ${total.toLocaleString("ru-RU")}₽`;
      })
      .join("\n");

    const message = `
🛒 <b>Новый заказ #${order.orderNumber}</b>

👤 <b>Имя:</b> ${body.name}
📞 <b>Телефон:</b> ${body.phone}
📧 <b>Email:</b> ${body.email || "—"}
🚚 <b>Доставка:</b> ${body.deliveryMethod === "pickup" ? "Самовывоз" : "Доставка"}
🏠 <b>Адрес:</b> ${body.address || "—"}
💬 <b>Комментарий:</b> ${body.comment || "—"}

📦 <b>Товары:</b>
${itemsText}

💰 <b>Итого: ${totalAmount.toLocaleString("ru-RU")}₽</b>
    `.trim();

    try {
      await sendTelegramMessage(message);
    } catch (tgError) {
      console.error("Telegram send failed:", tgError);
    }

    // Send order confirmation email to customer
    if (body.email) {
      try {
        const unitLabelsMap: Record<string, string> = { PCS: "шт", METER: "м", M2: "м²", KG: "кг", PACK: "уп", SET: "компл" };
        const emailData = buildOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          fullName: body.name,
          totalAmount,
          items: body.items.map((item, i) => {
            const product = productMap.get(item.id);
            return {
              name: product?.name || "Товар",
              qty: item.quantity,
              price: orderItems[i].price,
              total: orderItems[i].total,
              unit: product ? (unitLabelsMap[product.unit] || "шт") : "шт",
            };
          }),
        });
        await sendEmail({ to: body.email, ...emailData });
      } catch (emailError) {
        console.error("Order email send failed:", emailError);
      }
    }

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Ошибка при оформлении заказа" },
      { status: 500 },
    );
  }
}
