'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  iconColor?: string;
  badge?: number;
}

interface ProfileTabsProps {
  tabs: Tab[];
  panes: Record<string, React.ReactNode>;
}

/**
 * Renders the sticky tab bar plus whichever pane is active. All
 * panes are defined by the parent (Server Component) and passed in
 * as a map, so the data-fetching stays server-side while only the
 * "which tab is active" interactivity runs on the client.
 */
export function ProfileTabs({ tabs, panes }: ProfileTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <>
      <div className="bg-white border-b-[1.5px] border-border sticky top-14 z-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto px-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-5 py-3.5 text-[13px] font-bold cursor-pointer border-b-[3px] inline-flex items-center gap-1.5 whitespace-nowrap transition-all -mb-px ${
                  active === tab.id ? 'text-purple border-purple' : 'text-gray border-transparent'
                }`}
              >
                <i className={`ti ${tab.icon} text-sm`} style={tab.iconColor ? { color: tab.iconColor } : undefined} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} style={{ display: active === tab.id ? 'block' : 'none' }}>
          {panes[tab.id]}
        </div>
      ))}
    </>
  );
}
