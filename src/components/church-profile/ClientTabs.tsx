"use client";

import React, { useState } from 'react';

type ClientTabsProps = {
  profileContent: React.ReactNode;
  teamContent?: React.ReactNode;
  branchesContent?: React.ReactNode;
  eventsContent?: React.ReactNode;
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
  counts 
}: ClientTabsProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'on' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        
        <button 
          className={`tab ${activeTab === 'team' ? 'on' : ''}`} 
          onClick={() => setActiveTab('team')}
        >
          Our Team {counts.team > 0 && <span className="ct">{counts.team}</span>}
        </button>

        <button 
          className={`tab ${activeTab === 'branches' ? 'on' : ''}`} 
          onClick={() => setActiveTab('branches')}
        >
          Branches {counts.branches > 0 && <span className="ct">{counts.branches}</span>}
        </button>

        <button 
          className={`tab ${activeTab === 'events' ? 'on' : ''}`} 
          onClick={() => setActiveTab('events')}
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
