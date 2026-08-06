"use client";

import React, { useState } from 'react';

type ClientTabsProps = {
  profileContent: React.ReactNode;
  teamContent?: React.ReactNode;
  branchesContent?: React.ReactNode;
  eventsContent?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  counts: {
    team: number;
    branches: number;
    events: number;
  };
};

export default function ClientTabs({ 
  profileContent, 
  teamContent, 
  branchesContent, 
  eventsContent, 
  activeTab: controlledTab,
  onTabChange,
  counts 
}: ClientTabsProps) {
  const [internalTab, setInternalTab] = useState('profile');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const changeTab = (tab: string) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div>
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'on' : ''}`} 
          onClick={() => changeTab('profile')}
        >
          Profile
        </button>
        
        <button 
          className={`tab ${activeTab === 'team' ? 'on' : ''}`} 
          onClick={() => changeTab('team')}
        >
          Our Team {counts.team > 0 && <span className="ct">{counts.team}</span>}
        </button>

        <button 
          className={`tab ${activeTab === 'branches' ? 'on' : ''}`} 
          onClick={() => changeTab('branches')}
        >
          Branches {counts.branches > 0 && <span className="ct">{counts.branches}</span>}
        </button>

        <button 
          className={`tab ${activeTab === 'events' ? 'on' : ''}`} 
          onClick={() => changeTab('events')}
        >
          Events {counts.events > 0 && <span className="ct">{counts.events}</span>}
        </button>
      </div>

      <div>
        {activeTab === 'profile' && profileContent}
        {activeTab === 'team' && (teamContent || <div className="panel"><p>No team members listed yet.</p></div>)}
        {activeTab === 'branches' && (branchesContent || <div className="panel"><p>No branches listed yet.</p></div>)}
        {activeTab === 'events' && (eventsContent || <div className="panel"><p>No events listed yet.</p></div>)}
      </div>
    </div>
  );
}
