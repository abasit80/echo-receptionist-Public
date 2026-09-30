import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-gold-700 hover:underline dark:text-gold-400">
        Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 leading-relaxed text-slate-600">
        EchoReceptionist collects only the account, call, and calendar data needed to
        operate the voice receptionist, qualify leads, and sync your CRM. Call
        recordings and transcripts are stored in your workspace and are not sold
        to third parties.
      </p>
    </div>
  );
}
