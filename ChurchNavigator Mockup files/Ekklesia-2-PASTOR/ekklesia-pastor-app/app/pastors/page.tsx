import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PastorSearch from './PastorSearch';

export const metadata = {
  title: 'Find a Pastor — Ekklesia',
  description: 'Browse and book pastors, ministers and speakers across the UK and beyond.',
};

const PAGE_SIZE = 12;

// A row as returned by the directory query (pastor + linked church + tags)
type DirectoryPastor = {
  id: string;
  slug: string;
  full_name: string;
  title: string | null;
  initials: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string;
  years_in_ministry: number | null;
  nations_reached: number | null;
  availability_status: 'available' | 'limited' | 'unavailable';
  is_verified: boolean;
  church_name_cache: string | null;
  church: { slug: string; name: string; city: string | null; denomination: string | null } | null;
  tags: { category: string; label: string }[];
};

const AVAIL = {
  available: { label: 'Available', cls: 'text-green-700 bg-green-50 border-green-200' },
  limited: { label: 'Limited', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  unavailable: { label: 'Booked', cls: 'text-gray-500 bg-gray-100 border-gray-200' },
} as const;

const GRADS = ['from-coral to-purple', 'from-purple to-indigo-500', 'from-pink-500 to-purple', 'from-violet-500 to-fuchsia-500'];

export default async function PastorsDirectory({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; specialism?: string; page?: string };
}) {
  const supabase = createServerSupabaseClient();
  const q = searchParams.q?.trim() || '';
  const city = searchParams.city?.trim() || '';
  const specialism = searchParams.specialism?.trim() || '';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // If filtering by specialism, resolve matching pastor ids first.
  let tagIds: string[] | null = null;
  if (specialism) {
    const { data: tagRows } = await supabase
      .from('pastor_tags')
      .select('pastor_id')
      .ilike('label', `%${specialism}%`);
    tagIds = (tagRows ?? []).map((r: { pastor_id: string }) => r.pastor_id);
    if (tagIds.length === 0) tagIds = ['00000000-0000-0000-0000-000000000000'];
  }

  let query = supabase
    .from('pastors')
    .select(
      'id, slug, full_name, title, initials, avatar_url, city, country, years_in_ministry, nations_reached, availability_status, is_verified, church_name_cache, church:churches (slug, name, city, denomination), tags:pastor_tags (category, label)',
      { count: 'exact' },
    )
    .eq('is_published', true)
    .order('is_verified', { ascending: false })
    .order('view_count', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) query = query.ilike('full_name', `%${q}%`);
  if (city) query = query.ilike('city', `%${city}%`);
  if (tagIds) query = query.in('id', tagIds);

  const { data, count, error } = await query;
  const pastors = (data ?? []) as unknown as DirectoryPastor[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (next: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (city) p.set('city', city);
    if (specialism) p.set('specialism', specialism);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, String(v)) : p.delete(k)));
    return `/pastors?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* top bar */}
      <nav className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral to-purple flex items-center justify-center text-white">
              <i className="ti ti-cross text-base" />
            </span>
            Ekklesia
          </Link>
          <div className="flex-1" />
          <Link href="/" className="text-sm font-semibold text-gray hidden sm:block">Churches</Link>
          <Link href="/pastors" className="text-sm font-bold text-purple-dark">Pastors</Link>
          <Link href="/onboarding/pastor" className="bg-purple text-white rounded-full px-4 py-2 text-sm font-bold inline-flex items-center gap-2">
            <i className="ti ti-user-plus text-base" /> Add profile
          </Link>
        </div>
      </nav>

      {/* hero + search */}
      <header className="bg-gradient-to-br from-coral to-purple text-white">
        <div className="max-w-6xl mx-auto px-5 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Find a Pastor</h1>
          <p className="opacity-90 mb-7">Book ministers, preachers and speakers for your church, conference or event.</p>
          <PastorSearch initialQ={q} initialCity={city} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* specialism quick-filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Prophetic preaching', 'Evangelism', 'Church planting', 'Youth ministry', 'Worship', 'Leadership training'].map((s) => (
            <Link
              key={s}
              href={qs({ specialism: specialism === s ? '' : s, page: 1 })}
              className={`text-xs font-bold px-3.5 py-2 rounded-full border ${specialism === s ? 'bg-ink text-white border-transparent' : 'bg-white text-gray border-border'}`}
            >
              {s}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray">
            {error ? 'Could not load pastors.' : `${total} pastor${total === 1 ? '' : 's'}${q || city || specialism ? ' found' : ''}`}
          </p>
        </div>

        {pastors.length === 0 ? (
          <div className="text-center py-20 text-gray">
            <i className="ti ti-user-search text-4xl text-gray-light mb-3 block" />
            No pastors match your search yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastors.map((p, i) => {
              const specialisms = (p.tags || []).filter((t) => t.category === 'preaching').slice(0, 3);
              const avail = AVAIL[p.availability_status] || AVAIL.available;
              return (
                <Link
                  key={p.id}
                  href={`/pastor/${p.slug}`}
                  className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition block"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.full_name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${GRADS[i % GRADS.length]} flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0`}>
                        {p.initials || p.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-ink truncate">{p.full_name}</h3>
                        {p.is_verified && <i className="ti ti-rosette-discount-check-filled text-green-500 text-base" />}
                      </div>
                      {p.title && <p className="text-xs font-semibold text-purple-dark">{p.title}</p>}
                      {p.city && <p className="text-xs text-gray mt-0.5"><i className="ti ti-map-pin text-xs" /> {p.city}, {p.country}</p>}
                    </div>
                  </div>

                  {/* church link — pastors connected to churches */}
                  {(p.church || p.church_name_cache) && (
                    <div className="text-xs text-gray bg-surface rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
                      <i className="ti ti-building-church text-purple text-sm" />
                      {p.church?.slug ? (
                        <span className="font-semibold text-ink">{p.church.name}</span>
                      ) : (
                        <span className="font-semibold text-ink">{p.church_name_cache}</span>
                      )}
                    </div>
                  )}

                  {specialisms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {specialisms.map((t) => (
                        <span key={t.label} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-light text-purple-dark">{t.label}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-gray">{p.years_in_ministry ? `${p.years_in_ministry}+ yrs` : 'Minister'}{p.nations_reached ? ` · ${p.nations_reached}+ nations` : ''}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${avail.cls}`}>{avail.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-semibold">← Previous</Link>}
            <span className="text-sm text-gray">Page {page} of {totalPages}</span>
            {page < totalPages && <Link href={qs({ page: page + 1 })} className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-semibold">Next →</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
