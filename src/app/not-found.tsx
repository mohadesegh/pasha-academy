import Link from "next/link";
import { Compass } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy-950 px-4 text-center text-white">
      <div className="bg-pattern absolute inset-0" aria-hidden />
      <div className="relative">
        <LogoMark className="mx-auto h-16 w-16" />
        <p className="mt-8 text-8xl font-black text-gold-300">۴۰۴</p>
        <h1 className="mt-4 text-2xl font-black">صفحه مورد نظر پیدا نشد</h1>
        <p className="mt-3 text-white/60">ممکن است آدرس اشتباه باشد یا این صفحه جابه‌جا شده باشد.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">بازگشت به خانه</Link>
          <Link href="/universities" className="btn-ghost-light"><Compass className="h-4 w-4" />دانشگاه‌ها</Link>
        </div>
      </div>
    </main>
  );
}
