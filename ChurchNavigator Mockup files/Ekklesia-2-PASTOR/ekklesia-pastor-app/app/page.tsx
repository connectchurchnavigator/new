import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-purple flex items-center justify-center mx-auto mb-5">
          <i className="ti ti-building-church text-3xl text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-ink mb-2">Ekklesia</h1>
        <p className="text-sm text-gray mb-7">UK Church &amp; Pastor Directory</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/pastors"
            className="bg-purple text-white rounded-full px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
          >
            <i className="ti ti-users text-base" /> Browse pastors
          </Link>
          <Link
            href="/onboarding/pastor"
            className="bg-white border border-border text-ink rounded-full px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
          >
            <i className="ti ti-user-plus text-base" /> Add a pastor profile
          </Link>
        </div>
      </div>
    </div>
  );
}
