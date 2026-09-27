import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Reveal } from "@/components/ui/motion";

/** Dark navy hero band used at the top of every inner public page. */
export function PageHero({
  title,
  lead,
  crumbs,
  children,
}: {
  title: string;
  lead?: string;
  crumbs?: { name: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-20 pt-36 text-white">
      <div className="bg-pattern absolute inset-0" aria-hidden />
      <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-crimson-500/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-turquoise-500/20 blur-3xl" aria-hidden />
      <div className="container-x relative">
        {crumbs && (
          <nav aria-label="مسیر صفحه" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60">
              <li><Link href="/" className="hover:text-gold-300">خانه</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-gold-300">{c.name}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-gold-300">{c.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Reveal>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">{lead}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.2}>{children}</Reveal>}
      </div>
    </section>
  );
}
