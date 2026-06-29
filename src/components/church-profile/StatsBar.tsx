import React from 'react';

export default function StatsBar({
  ministriesCount,
  worshipStylesCount,
  languagesCount,
  servicesCount,
  branchesCount,
  facilitiesCount
}: {
  ministriesCount: number;
  worshipStylesCount: number;
  languagesCount: number;
  servicesCount: number;
  branchesCount: number;
  facilitiesCount: number;
}) {
  const stats = [
    { label: 'Ministries', count: ministriesCount, className: 's-purple', prefix: ministriesCount > 10 ? '+' : '' },
    { label: 'Worship Styles', count: worshipStylesCount, className: 's-teal' },
    { label: 'Languages', count: languagesCount, className: 's-amber' },
    { label: 'Services/Week', count: servicesCount, className: 's-coral' },
    { label: 'Branches', count: branchesCount, className: 's-blue' },
    { label: 'Facilities', count: facilitiesCount, className: 's-green' }
  ].filter(s => s.count > 0);

  if (stats.length === 0) return null;

  return (
    <div className="stats">
      {stats.map((stat, i) => (
        <div key={stat.label} className={`stat ${stat.className}`}>
          <b>{stat.count}{stat.prefix}</b>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
