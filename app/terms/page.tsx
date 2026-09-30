import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-gold-700 hover:underline dark:text-gold-400">
        Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Terms of Service</h1>
      <p className="mt-4 leading-relaxed text-slate-600">
        By using EchoReceptionist you agree to provide accurate business information,
        keep API credentials secure, and use the platform in compliance with
        applicable telephony and privacy laws. Demo data is for evaluation only.
      </p>
    </div>
  );
}
