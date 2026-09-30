import { useState, useEffect } from "react";
import { INITIAL_TAXONOMIES, TaxonomyStore } from "@/lib/taxonomies";

let cachedTaxonomies: TaxonomyStore | null = null;
let fetchPromise: Promise<TaxonomyStore> | null = null;

export async function fetchTaxonomies(): Promise<TaxonomyStore> {
  if (cachedTaxonomies) return cachedTaxonomies;
  if (!fetchPromise) {
    fetchPromise = fetch("/api/admin/taxonomies")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.taxonomies) {
          cachedTaxonomies = {
            denominations: Array.isArray(data.taxonomies.denominations) ? data.taxonomies.denominations : INITIAL_TAXONOMIES.denominations,
            worshipStyles: Array.isArray(data.taxonomies.worshipStyles) ? data.taxonomies.worshipStyles : INITIAL_TAXONOMIES.worshipStyles,
            ministries: Array.isArray(data.taxonomies.ministries) ? data.taxonomies.ministries : INITIAL_TAXONOMIES.ministries,
            facilities: Array.isArray(data.taxonomies.facilities) ? data.taxonomies.facilities : INITIAL_TAXONOMIES.facilities,
            languages: Array.isArray(data.taxonomies.languages) ? data.taxonomies.languages : INITIAL_TAXONOMIES.languages,
            ministryExperience: Array.isArray(data.taxonomies.ministryExperience) ? data.taxonomies.ministryExperience : (INITIAL_TAXONOMIES.ministryExperience || []),
            skills: Array.isArray(data.taxonomies.skills) ? data.taxonomies.skills : (INITIAL_TAXONOMIES.skills || []),
            rolesInterested: Array.isArray(data.taxonomies.rolesInterested) ? data.taxonomies.rolesInterested : (INITIAL_TAXONOMIES.rolesInterested || []),
            training: Array.isArray(data.taxonomies.training) ? data.taxonomies.training : (INITIAL_TAXONOMIES.training || []),

          };
          return cachedTaxonomies;
        }
        return INITIAL_TAXONOMIES;
      })
      .catch(() => INITIAL_TAXONOMIES)
      .finally(() => {
        fetchPromise = null;
      });
  }
  return fetchPromise;
}

export function useTaxonomies() {
  const [taxonomies, setTaxonomies] = useState<TaxonomyStore>(cachedTaxonomies || INITIAL_TAXONOMIES);

  useEffect(() => {
    fetchTaxonomies().then((data) => {
      setTaxonomies(data);
    });
  }, []);

  return taxonomies;
}
