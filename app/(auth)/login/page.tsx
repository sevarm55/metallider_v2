import { redirect } from "next/navigation";

// Временно: вход по телефону отключён, перенаправляем на email
export default function LoginPage() {
  redirect("/login/email");
}
