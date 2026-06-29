"use client";

import React, { useState } from "react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title} on Church Navigator!`,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing", error);
      }
    } else {
      // Fallback for desktop/browsers without navigator.share
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.15)', 
        color: copied ? '#10b981' : '#fff', 
        border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`, 
        backdropFilter: 'blur(12px)', 
        padding: '12px 24px', 
        borderRadius: '30px', 
        fontSize: '14px', 
        fontWeight: 800, 
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <i className={copied ? "ti ti-check" : "ti ti-upload"} style={{ fontSize: '18px' }}></i> 
      {copied ? "Copied Link!" : "Share"}
    </button>
  );
}
