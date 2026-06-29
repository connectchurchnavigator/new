"use client";

import React, { useState } from 'react';
import RegisterVisitModal from './RegisterVisitModal';
import type { ChurchService } from '@/lib/types';

export default function VisitorBanner({ churchId, services }: { churchId: string, services: ChurchService[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="visitor">
        <div className="v-icon">
          <i className="ti ti-qrcode" style={{ fontSize: '18px' }}></i>
        </div>
        <div className="visitor-txt">
          <h3>Visiting for the first time?</h3>
          <p>Register your visit and connect with the community — takes 30 seconds</p>
        </div>
        <button 
          className="btn btn-glass" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ti ti-user-plus"></i> Register my visit
        </button>
      </div>

      {isModalOpen && (
        <RegisterVisitModal 
          churchId={churchId}
          services={services} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
