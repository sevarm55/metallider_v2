/**
 * SMS-сервис для отправки SMS через SMS.ru API
 */

/**
 * Нормализация телефонного номера.
 * Убирает пробелы, скобки, дефисы. Заменяет 8 на +7 в начале.
 */
export function formatPhone(phone: string): string {
  // Убираем все кроме цифр и +
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Убираем всё кроме цифр для обработки
  const digitsOnly = cleaned.replace(/[^\d]/g, "");

  // Если начинается с 8 и 11 цифр — российский номер
  if (digitsOnly.startsWith("8") && digitsOnly.length === 11) {
    cleaned = "+7" + digitsOnly.slice(1);
  }
  // Если начинается с 7 и 11 цифр
  else if (digitsOnly.startsWith("7") && digitsOnly.length === 11) {
    cleaned = "+7" + digitsOnly.slice(1);
  }
  // Если 10 цифр (без кода страны)
  else if (digitsOnly.length === 10 && digitsOnly.startsWith("9")) {
    cleaned = "+7" + digitsOnly;
  }

  // Гарантируем что начинается с +7
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  if (!cleaned.startsWith("+7")) {
    cleaned = "+7" + cleaned.replace(/^\+/, "");
  }

  return cleaned;
}

/**
 * Отправка SMS через SMS.ru API.
 * Если SMS_RU_API_KEY не задан — логирует код в консоль (dev-режим).
 */
export async function sendSms(
  phone: string,
  message: string,
): Promise<boolean> {
  const apiKey = process.env.SMS_RU_API_KEY;

  if (!apiKey) {
    console.log(`[SMS DEV] Телефон: ${phone}, Сообщение: ${message}`);
    return true;
  }

  try {
    const params = new URLSearchParams({
      api_id: apiKey,
      to: phone,
      msg: message,
      json: "1",
    });

    const response = await fetch(
      `https://sms.ru/sms/send?${params.toString()}`,
    );

    if (!response.ok) {
      console.error(
        `[SMS] HTTP ошибка: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const result = await response.json();

    // SMS.ru возвращает status_code === 100 при успехе
    if (result.status_code === 100) {
      return true;
    }

    console.error(`[SMS] Ошибка отправки:`, result);
    return false;
  } catch (error) {
    console.error(`[SMS] Исключение при отправке:`, error);
    return false;
  }
}
