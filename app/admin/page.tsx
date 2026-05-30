import Link from "next/link";
import { redirect } from "next/navigation";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";

export default async function AdminHomePage() {
  if (await hasContentAdminAuth()) {
    redirect("/admin/vacancies");
  }
  redirect("/admin/login");
}
