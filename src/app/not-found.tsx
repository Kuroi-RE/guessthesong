import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[62ch] flex-col justify-center px-4">
      <h1 className="text-h1">Halaman ini nggak ada</h1>
      <p className="mt-2 text-muted">
        Mungkin tautannya salah ketik, atau halamannya udah dipindah.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 w-fit items-center rounded-control border border-line-strong px-4 text-ui hover:border-brand hover:text-brand-text"
      >
        Balik ke game
      </Link>
    </main>
  );
}
