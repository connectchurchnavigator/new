import React from "react";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Churches | Interactive Map & Directory",
  description: "Search and explore churches near you on the interactive map with real-time location and filters.",
};

export const revalidate = 0; // Dynamic SSR

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    denomination?: string;
  }>;
}

export default async function ExplorePage(props: ExplorePageProps) {
  const searchParams = await props.searchParams;
  const initialQ = searchParams.q?.trim() || "";
  const initialCity = searchParams.city?.trim() || "";
  const initialDenomination = searchParams.denomination?.trim() || "";

  const supabase = createAdminClient();

  // Fetch all published churches
  const { data: churches } = await supabase
    .from("churches")
    .select("*, church_services(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Fetch all published pastors
  const { data: pastors } = await supabase
    .from("pastors")
    .select("*, church:churches(name, slug, latitude, longitude)")
    .eq("is_published", true)
    .order("is_verified", { ascending: false });

  // Fetch all published events
  const { data: events } = await supabase
    .from("events")
    .select("*, host_church:churches(name, slug)")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  // Fetch all published worship leaders
  const { data: worshipLeaders } = await supabase
    .from("worship_leaders")
    .select("*")
    .eq("is_published", true)
    .order("is_verified", { ascending: false });

  return (
    <ExploreClient
      initialChurches={churches || []}
      initialPastors={pastors || []}
      initialEvents={events || []}
      initialWorshipLeaders={worshipLeaders || []}
      initialSearchQuery={initialQ}
      initialCity={initialCity}
      initialDenom={initialDenomination}
    />
  );
}
