"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

interface EditScheduleModalProps {
  initialSchedule: any[];
  onClose: () => void;
  onSave: (schedule: any[]) => void;
}

// Helper to convert any time format ("9:00 AM", "09:00 AM", "9am", "09:00", "09:00:00") into 24-hour HH:mm for <input type="time">
function to24Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const s = timeStr.trim();
  
  // If already "HH:mm" (24h)
  const match24 = s.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (match24) {
    return `${match24[1].padStart(2, "0")}:${match24[2]}`;
  }

  // If 12h format e.g. "9:00 AM", "09:00am", "9 AM"
  const match12 = s.match(/^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? match12[2] : "00";
    const modifier = match12[3]?.toUpperCase();

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  return "";
}

// Helper to convert "HH:mm" from input type="time" into user-friendly "h:mm A" e.g. "9:00 AM"
function to12Hour(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function EditScheduleModal({ initialSchedule, onClose, onSave }: EditScheduleModalProps) {
  // Normalize each service's start_time and end_time to 24h format for the input
  const [schedule, setSchedule] = useState<any[]>(() => {
    return (initialSchedule || []).map(svc => ({
      ...svc,
      day: svc.day || "Sunday",
      name: svc.name || "",
      start_time: to24Hour(svc.start_time || svc.from),
      end_time: to24Hour(svc.end_time || svc.to)
    }));
  });

  const addService = () => {
    setSchedule([
      ...schedule,
      { day: "Sunday", name: "Sunday Worship", start_time: "10:00", end_time: "11:30" }
    ]);
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

  const handleSave = () => {
    // Convert times back to standard 12-hour formatted strings like "9:00 AM"
    const formattedSchedule = schedule.map(svc => ({
      ...svc,
      start_time: svc.start_time ? to12Hour(svc.start_time) : "",
      end_time: svc.end_time ? to12Hour(svc.end_time) : ""
    }));
    onSave(formattedSchedule);
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.85)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
            background: "#fff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "#f3e8ff",
                color: "#7e22ce",
                display: "grid",
                placeItems: "center"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
              Edit Schedule
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              border: "none",
              cursor: "pointer"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Schedule Rows */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {schedule.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "14.5px" }}>
              No service times added yet. Click below to add one.
            </div>
          ) : (
            schedule.map((svc, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative"
                }}
              >
                <button
                  onClick={() => removeService(idx)}
                  title="Delete service"
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "#fee2e2",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>

                <div style={{ display: "flex", gap: "12px", paddingRight: "36px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>
                      Day
                    </label>
                    <select
                      value={svc.day}
                      onChange={(e) => updateService(idx, "day", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                        outline: "none",
                        fontSize: "14px",
                        background: "#fff",
                        fontWeight: 600
                      }}
                    >
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
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>
                      Service Name
                    </label>
                    <input
                      value={svc.name}
                      onChange={(e) => updateService(idx, "name", e.target.value)}
                      placeholder="e.g. Morning Celebration Service"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                        outline: "none",
                        fontSize: "14px",
                        background: "#fff"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={svc.start_time}
                      onChange={(e) => updateService(idx, "start_time", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                        outline: "none",
                        fontSize: "14px",
                        background: "#fff",
                        fontWeight: 600
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={svc.end_time}
                      onChange={(e) => updateService(idx, "end_time", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid var(--line)",
                        outline: "none",
                        fontSize: "14px",
                        background: "#fff",
                        fontWeight: 600
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            onClick={addService}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "2px dashed var(--line)",
              background: "transparent",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              marginTop: "4px"
            }}
          >
            + Add another service
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid var(--line)",
            background: "#fff",
            borderRadius: "0 0 20px 20px"
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              border: "1px solid var(--line)",
              background: "#fff",
              color: "var(--ink)",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              background: "var(--purple)",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
