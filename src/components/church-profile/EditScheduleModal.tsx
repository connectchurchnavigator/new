"use client";

import React, { useState } from "react";

interface EditScheduleModalProps {
  initialSchedule: any[];
  onClose: () => void;
  onSave: (schedule: any[]) => void;
}

export default function EditScheduleModal({ initialSchedule, onClose, onSave }: EditScheduleModalProps) {
  const [schedule, setSchedule] = useState<any[]>(initialSchedule || []);

  const addService = () => {
    setSchedule([...schedule, { day: "Sunday", name: "Sunday Worship", start_time: "10:00 AM", end_time: "11:30 AM" }]);
  };

  const updateService = (index: number, field: string, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const removeService = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule.splice(index, 1);
    setSchedule(newSchedule);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", maxHeight: "90vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Edit Schedule</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {schedule.map((svc, idx) => (
            <div key={idx} style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
              <button onClick={() => removeService(idx)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "4px" }}>Day</label>
                  <select value={svc.day} onChange={(e) => updateService(idx, "day", e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "14px", background: "#fff" }}>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "4px" }}>Service Name</label>
                  <input value={svc.name} onChange={(e) => updateService(idx, "name", e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "4px" }}>Start Time</label>
                  <input type="time" value={svc.start_time} onChange={(e) => updateService(idx, "start_time", e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "4px" }}>End Time</label>
                  <input type="time" value={svc.end_time} onChange={(e) => updateService(idx, "end_time", e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addService} style={{ padding: "12px", borderRadius: "12px", border: "2px dashed var(--line)", background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>
            + Add another service
          </button>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(schedule)} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}
