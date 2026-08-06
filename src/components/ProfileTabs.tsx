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
  sidebar?: React.ReactNode;
}

/**
 * Renders the sticky tab bar plus whichever pane is active. All
 * panes are defined by the parent (Server Component) and passed in
 * as a map, so the data-fetching stays server-side while only the
 * "which tab is active" interactivity runs on the client.
 */
export function ProfileTabs({ tabs, panes, sidebar }: ProfileTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <>
      <div className="pastor-wrap">
        <div className="pastor-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`pastor-tab ${active === tab.id ? 'on' : ''}`}
            >
              <i className={`ti ${tab.icon}`} style={tab.iconColor ? { color: tab.iconColor } : undefined} />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="cnt">
                  {tab.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pastor-wrap">
        {sidebar ? (
          <div className="two-col-grid">
            <div>
              {tabs.map((tab) => (
                <div key={tab.id} style={{ display: active === tab.id ? 'block' : 'none' }}>
                  {panes[tab.id]}
                </div>
              ))}
            </div>
            <div>
              {sidebar}
            </div>
          </div>
        ) : (
          tabs.map((tab) => (
            <div key={tab.id} style={{ display: active === tab.id ? 'block' : 'none' }}>
              {panes[tab.id]}
            </div>
          ))
        )}
      </div>
    </>
  );
}
