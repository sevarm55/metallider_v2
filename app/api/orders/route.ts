import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { sendTelegramMessage } from "@/lib/send-telegram";
import { getUserSession } from "@/lib/get-user-session";

interface OrderItemBody {
  id: string;
  name: string;
  price: number;
  specialPrice?: number;
  quantity: number;
  unit: string;
}

interface OrderBody {
  name: string;
  phone: string;
  email?: string;
  deliveryMethod: "pickup" | "delivery";
  address?: string;
  comment?: string;
  items: OrderItemBody[];
  totalPrice: number;
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

    // Calculate effective prices
    const orderItems = body.items.map((item) => {
      const effectivePrice =
        item.specialPrice && item.specialPrice > 0 && item.specialPrice < item.price
          ? item.specialPrice
          : item.price;
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

    // Send to Telegram
    const itemsText = body.items
      .map((item, i) => {
        const price =
          item.specialPrice && item.specialPrice > 0 && item.specialPrice < item.price
            ? item.specialPrice
            : item.price;
        const total = price * item.quantity;
        return `${i + 1}. ${item.name}\n   ${price}₽ × ${item.quantity} ${item.unit} = ${total.toLocaleString("ru-RU")}₽`;
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
      // Order is saved, Telegram is secondary
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
