'use server'

import { createAdminClient } from '@/lib/supabase-admin';
import { recordView } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function trackProfileView(churchId: string, source: string = 'Unknown') {
  try {
    const sb = createAdminClient();
    await recordView(sb, churchId, { source });
    revalidatePath('/dashboard/insights');
  } catch (err) {
    console.error('Failed to track view:', err);
  }
}
