import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/motion";

export function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-navy-950 pb-16 pt-32">
      <div className="bg-pattern absolute inset-0" aria-hidden />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-crimson-500/20 blur-3xl" aria-hidden />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-turquoise-500/20 blur-3xl" aria-hidden />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="hidden text-white lg:block">
          <h1 className="text-4xl font-black leading-tight">{title}</h1>
          <p className="mt-5 max-w-md leading-8 text-white/70">{lead}</p>
          <ul className="mt-8 space-y-3 text-white/80">
            {["ثبت درخواست پذیرش، اقامت و خوابگاه", "آپلود امن مدارک", "پیگیری وضعیت و نتیجه بررسی هر مدرک"].map((t) => (
              <li key={t} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-gold-400" />{t}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="card mx-auto w-full max-w-md p-6 sm:p-8">
          <h1 className="mb-6 text-2xl font-black text-navy-950 lg:hidden">{title}</h1>
          <h2 className="mb-6 hidden text-2xl font-black text-navy-950 lg:block">{title}</h2>
          {children}
        </Reveal>
      </div>
    </section>
  );
}
