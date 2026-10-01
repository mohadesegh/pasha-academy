import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Reveal } from "@/components/ui/motion";

/** Light, accaco-style title band used at the top of every inner public page. */
export function PageHero({
  title,
  lead,
  kicker,
  crumbs,
  children,
}: {
  title: string;
  lead?: string;
  kicker?: string;
  crumbs?: { name: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
      <div className="absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-gold-200/40 blur-3xl dark:bg-gold-500/10" aria-hidden />
      <div className="container-x relative">
        {crumbs && (
          <nav aria-label="breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              <li><Link href="/" className="hover:text-gold-600">خانه</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="font-bold text-gold-600">{c.name}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-gold-600">{c.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {kicker && <p className="kicker mb-3">{kicker}</p>}
        <Reveal>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-navy-950 sm:text-5xl">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{lead}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.2}>{children}</Reveal>}
      </div>
    </section>
  );
}
