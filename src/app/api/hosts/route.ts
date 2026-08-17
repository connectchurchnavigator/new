import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch churches
    const { data: churches, error: churchError } = await supabase
      .from('churches')
      .select('id, name, city, logo_url')
      .order('name', { ascending: true })
      .limit(100);

    // Fetch pastors
    const { data: pastors, error: pastorError } = await supabase
      .from('pastors')
      .select('id, full_name, title, city, avatar_url')
      .order('full_name', { ascending: true })
      .limit(100);

    if (churchError) console.error('Error fetching churches for hosts:', churchError);
    if (pastorError) console.error('Error fetching pastors for hosts:', pastorError);

    const formattedChurches = (churches || []).map((c) => ({
      id: c.id,
      type: 'church' as const,
      name: c.name,
      subtitle: c.city ? `Church · ${c.city}` : 'Church',
      avatar: c.logo_url
    }));

    const formattedPastors = (pastors || []).map((p) => ({
      id: p.id,
      type: 'pastor' as const,
      name: `${p.title ? p.title + ' ' : ''}${p.full_name}`,
      subtitle: p.city ? `Pastor · ${p.city}` : 'Pastor',
      avatar: p.avatar_url
    }));

    return NextResponse.json({
      hosts: [...formattedChurches, ...formattedPastors]
    });
  } catch (error) {
    console.error('Error in /api/hosts:', error);
    return NextResponse.json({ hosts: [] }, { status: 500 });
  }
}
