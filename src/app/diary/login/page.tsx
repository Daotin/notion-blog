import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/diary/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/diary");
  return (
    <div className="diary">
      <LoginForm />
    </div>
  );
}
