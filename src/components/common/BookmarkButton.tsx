"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

interface BookmarkButtonProps {
  itemType: "church" | "pastor" | "worship_leader" | "event";
  itemId?: string | number;
  itemTitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BookmarkButton({
  itemType,
  itemId,
  itemTitle,
  className,
  style,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const storageKey = `cn_bookmark_${itemType}_${itemId || itemTitle || "unknown"}`;

  useEffect(() => {
    // Check localStorage initial status
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "true") {
        setIsBookmarked(true);
      }
    } catch {}

    // Check supabase if user logged in
    async function checkSupabaseBookmark() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !itemId) return;

        const { data, error } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", String(itemId))
          .maybeSingle();

        if (!error && data) {
          setIsBookmarked(true);
          try {
            localStorage.setItem(storageKey, "true");
          } catch {}
        }
      } catch {}
    }

    checkSupabaseBookmark();
  }, [storageKey, itemId, itemType]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      if (nextState) {
        localStorage.setItem(storageKey, "true");
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {}

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && itemId) {
        if (nextState) {
          await supabase.from("bookmarks").upsert(
            {
              user_id: user.id,
              item_type: itemType,
              item_id: String(itemId),
              title: itemTitle || "",
            },
            { onConflict: "user_id,item_type,item_id" }
          );
        } else {
          await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", user.id)
            .eq("item_type", itemType)
            .eq("item_id", String(itemId));
        }
      }
    } catch (err) {
      console.warn("Bookmark sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={className}
      title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isBookmarked ? "rgba(124, 58, 237, 0.9)" : "rgba(30, 27, 36, 0.6)",
        color: "#ffffff",
        border: `1.5px solid ${isBookmarked ? "rgba(168, 85, 247, 0.6)" : "rgba(255, 255, 255, 0.2)"}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <i
        className={isBookmarked ? "ti ti-bookmark-filled" : "ti ti-bookmark"}
        style={{
          fontSize: "20px",
          color: isBookmarked ? "#fbbf24" : "#ffffff",
          transition: "color 0.2s",
        }}
      />
    </button>
  );
}
