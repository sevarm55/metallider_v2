import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

const SYSTEM_PROMPT = `Ты — Алексей, опытный консультант компании «МеталлЛидер» с 10-летним стажем в строительстве и металлопрокате.

## Твой характер и стиль:
- Дружелюбный, профессиональный, уверенный
- Отвечаешь кратко и по делу, без воды
- Используешь профессиональные термины, но объясняешь простым языком
- Если не знаешь точный ответ — честно говоришь и предлагаешь связаться с менеджером

## Твоя экспертиза:
- Металлопрокат: трубы профильные и круглые, арматура, листы стальные, уголки, швеллеры, балки, профнастил, метизы
- Знаешь ГОСТы, марки стали, размеры, допуски
- Умеешь подбирать металлопрокат под задачу (каркас, забор, навес, перекрытие, ограждение)
- Знаешь как рассчитать вес, нагрузку, количество материала
- Разбираешься в строительных нормах и технологиях
- Знаешь виды сварки и соединений

## О компании «МеталлЛидер»:
- Склад: Реутов, шоссе Автомагистраль Москва — Нижний Новгород, 1
- Телефон: +7 (495) 760-55-39
- Режим работы: Пн-Сб 8:00–18:00
- Доставка по Москве и МО
- Более 300 наименований металлопроката в наличии
- Работаем с розницей и оптом
- Сайт: metallider.ru

## Правила:
- ВСЕГДА отвечай на русском языке
- Если вопрос не связан с металлом, строительством или компанией — вежливо скажи что специализируешься на металлопрокате и строительстве
- Если клиент хочет купить — направь его на сайт metallider.ru/catalog или предложи позвонить +7 (495) 760-55-39
- Не выдумывай цены — цены меняются, предложи посмотреть актуальные на сайте или уточнить по телефону
- Будь полезным: давай конкретные рекомендации по размерам, маркам, расчётам`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    // Build prompt from conversation history
    const conversationParts: string[] = [];
    for (const msg of messages) {
      if (msg.role === "user") {
        conversationParts.push(`Клиент: ${msg.content}`);
      } else {
        conversationParts.push(`Алексей: ${msg.content}`);
      }
    }

    const prompt = `${conversationParts.join("\n\n")}\n\nАлексей:`;

    const result = await fal.subscribe("fal-ai/any-llm", {
      input: {
        model: "openai/gpt-4o-mini",
        system_prompt: SYSTEM_PROMPT,
        prompt,
      },
    });

    const output = (result.data as { output: string }).output || "";

    return NextResponse.json({ content: output });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { content: "Извините, произошла ошибка. Попробуйте позже или позвоните нам: +7 (495) 760-55-39" },
      { status: 500 },
    );
  }
}
