/** Shown instantly while the filtered list renders on the server; matches the page's hero + list layout. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <section className="pb-24 pt-32 sm:pt-36">
        <div className="container-x animate-pulse">
          <div className="h-3 w-28 rounded-full bg-navy-100" />
          <div className="mt-4 h-10 w-2/3 max-w-xl rounded-2xl bg-navy-100" />
          <div className="mt-5 h-4 w-full max-w-2xl rounded-full bg-navy-50" />
          <div className="mt-2 h-4 w-1/2 max-w-md rounded-full bg-navy-50" />
        </div>
      </section>
      <section className="-mt-12 pb-24">
        <div className="container-x animate-pulse space-y-4">
          <div className="card h-28" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card h-36" />
          ))}
        </div>
      </section>
    </div>
  );
}
