import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect("/auth/login");
    }

    redirect("/dashboard");
  } catch (error) {
    console.error("Error checking auth state:", error);
    redirect("/auth/login");
  }
}
