import React from "react";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Churches | Interactive Map & Directory",
  description: "Search and explore churches near you on the interactive map with real-time location and filters.",
};

export const revalidate = 30; // Cache for 30s so repeat visits load instantly without hitting database

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

  // Fetch only published churches with only the columns explore actually renders
  const { data: churches } = await supabase
    .from("churches")
    .select(
      "id, slug, name, city, latitude, longitude, cover_url, logo_url, denomination, is_verified, created_at, address_line, formatted_address, postcode, country, about, languages, worship_styles, ministries, church_services(day, start_time, end_time)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <ExploreClient
      initialChurches={churches || []}
      initialSearchQuery={initialQ}
      initialCity={initialCity}
      initialDenom={initialDenomination}
    />
  );
}
