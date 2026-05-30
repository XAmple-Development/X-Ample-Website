import { redirect } from "next/navigation";

export default function AdminWaitlistRedirect() {
  redirect("/admin/newsletter");
}
