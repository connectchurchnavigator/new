export default function PastorNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-purple-light flex items-center justify-center mx-auto mb-5">
          <i className="ti ti-user-question text-3xl text-purple" />
        </div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Pastor not found</h1>
        <p className="text-sm text-gray mb-6">
          This profile doesn&apos;t exist, or it hasn&apos;t been published yet.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-purple text-white rounded-full px-5 py-2.5 text-sm font-bold"
        >
          <i className="ti ti-arrow-left text-base" /> Back to directory
        </a>
      </div>
    </div>
  );
}
