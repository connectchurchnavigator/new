"use client";

import React, { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: "churches" | "pastors" | "events", inserted: any[]) => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [uploadType, setUploadType] = useState<"churches" | "pastors" | "events">("churches");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [uploadResult, setUploadResult] = useState<{ insertedCount: number; errorsCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle File Drag / Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");
    setUploadResult(null);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setParsedData(results.data);
          } else {
            setErrorMsg("No records found in CSV file.");
          }
        },
        error: (err) => {
          setErrorMsg(`Failed to parse CSV: ${err.message}`);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
          if (data && data.length > 0) {
            setParsedData(data);
          } else {
            setErrorMsg("No records found in Excel spreadsheet.");
          }
        } catch (err: any) {
          setErrorMsg(`Failed to parse Excel file: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setErrorMsg("Please upload a .csv or .xlsx / .xls file.");
    }
  };

  // Download Sample Template with EVERY Field
  const downloadSampleTemplate = (fileFormat: "xlsx" | "csv" = "xlsx") => {
    let sampleRows: any[] = [];

    if (uploadType === "churches") {
      sampleRows = [
        {
          name: "Grace Community Church",
          denomination: "Pentecostal",
          about: "A vibrant, Christ-centered family church passionate about modern worship and community transformation.",
          address: "123 High Street",
          area: "Stratford",
          city: "London",
          state: "Greater London",
          postcode: "E12 5LH",
          country: "United Kingdom",
          country_code: "GB",
          phone: "+44 20 7946 0912",
          email: "info@gracechurch.org",
          website: "https://gracechurch.org",
          facebook: "https://facebook.com/gracechurch",
          instagram: "https://instagram.com/gracechurch",
          youtube: "https://youtube.com/@gracechurch",
          twitter: "https://twitter.com/gracechurch",
          tiktok: "https://tiktok.com/@gracechurch",
          telegram: "https://t.me/gracechurch",
          livestream: "https://youtube.com/@gracechurch/live",
          cover_url: "https://images.unsplash.com/photo-1438032005730-c779502df39b",
          logo_url: "https://images.unsplash.com/photo-1544717305-2782549b5136",
          gallery: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4, https://images.unsplash.com/photo-1510590337019-5ef8d3d32116",
          worship_styles: "Contemporary Worship, Charismatic / Spirit-Filled",
          ministries: "Youth Ministry, Children's Church, Worship & Choir, Food Bank & Community Care, Prayer & Intercession",
          facilities: "Free Parking, Wheelchair Accessible / Step-Free, Nursery / Crèche Room, Hearing Loop System",
          languages: "English, French, Spanish",
          service_day: "Sunday",
          service_name: "Morning Celebration Service",
          service_time: "10:30 AM",
          service_end_time: "12:30 PM",
          service_format: "In-Person",
          pastor_name: "Pastor David Adeleke",
          pastor_title: "Senior Pastor",
          pastor_bio: "Serving in gospel ministry for over 15 years with a passion for discipleship and church planting.",
          pastor_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
          verified: "true",
        },
        {
          name: "Bethel Baptist Chapel",
          denomination: "Baptist",
          about: "A historic, loving congregation dedicated to faithful Bible teaching and loving our local community.",
          address: "45 Victoria Road",
          area: "Edgbaston",
          city: "Birmingham",
          state: "West Midlands",
          postcode: "B1 1AA",
          country: "United Kingdom",
          country_code: "GB",
          phone: "+44 121 496 0123",
          email: "contact@bethelbaptist.org",
          website: "https://bethelbaptist.org",
          facebook: "https://facebook.com/bethelbaptist",
          instagram: "https://instagram.com/bethelbaptist",
          youtube: "https://youtube.com/@bethelbaptist",
          twitter: "",
          tiktok: "",
          telegram: "",
          livestream: "https://bethelbaptist.org/live",
          cover_url: "",
          logo_url: "",
          gallery: "",
          worship_styles: "Traditional Hymns, Blended Style",
          ministries: "Children's Church, Men's Fellowship, Women's Fellowship, Seniors Ministry",
          facilities: "Wheelchair Accessible / Step-Free, Accessible Toilets, Community Café / Kitchen",
          languages: "English",
          service_day: "Sunday",
          service_name: "Sunday Morning Worship",
          service_time: "11:00 AM",
          service_end_time: "12:15 PM",
          service_format: "In-Person",
          pastor_name: "Rev. John Miller",
          pastor_title: "Lead Minister",
          pastor_bio: "Committed to community evangelism and pastoral care.",
          pastor_photo: "",
          verified: "false",
        },
      ];
    } else if (uploadType === "pastors") {
      sampleRows = [
        {
          full_name: "Pastor David Adeleke",
          title: "Senior Pastor",
          city: "London",
          country: "United Kingdom",
          church_name: "Grace City Church",
          years_in_ministry: "15",
          email: "pastor.david@example.com",
          phone: "+44 7700 900123",
          verified: "true",
          bio: "Senior Pastor, speaker, and author passionate about kingdom leadership, prophetic preaching, and church planting.",
        },
        {
          full_name: "Rev. Sarah Jenkins",
          title: "Associate Minister & Worship Director",
          city: "Manchester",
          country: "United Kingdom",
          church_name: "King's Church",
          years_in_ministry: "8",
          email: "sarah@kingschurch.org",
          phone: "+44 7700 900456",
          verified: "false",
          bio: "Leading national worship nights, songwriter, and youth conference speaker.",
        },
      ];
    } else if (uploadType === "events") {
      sampleRows = [
        {
          title: "Global Leadership Summit 2026",
          type: "Conference",
          venue_name: "ExCeL London",
          city: "London",
          address: "Royal Victoria Dock, 1 Western Gateway",
          postcode: "E16 1XL",
          starts_at: "2026-10-15T09:00:00Z",
          ends_at: "2026-10-17T17:00:00Z",
          price_label: "£25",
          is_free: "false",
          description: "Equipping pastors, church leaders, and marketplace ministers for global kingdom impact with international keynotes.",
        },
        {
          title: "Night of Worship & Revival",
          type: "Worship Night",
          venue_name: "Central Auditorium",
          city: "Birmingham",
          address: "Broad Street",
          postcode: "B1 2HF",
          starts_at: "2026-11-05T18:30:00Z",
          ends_at: "2026-11-05T21:30:00Z",
          price_label: "Free",
          is_free: "true",
          description: "An evening of unified praise, deep intercession, and community revival open to all denominations.",
        },
      ];
    }

    if (fileFormat === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, `${uploadType}_full_template.xlsx`);
    } else {
      const csv = Papa.unparse(sampleRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${uploadType}_full_template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Submit to Server API
  const handleStartImport = async () => {
    if (parsedData.length === 0) {
      setErrorMsg("Please select a valid CSV or Excel file containing records.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: uploadType,
          records: parsedData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import records");
      }

      setUploadResult({
        insertedCount: data.insertedCount || 0,
        errorsCount: data.errorsCount || 0,
      });

      if (data.insertedRecords && data.insertedRecords.length > 0) {
        onSuccess(uploadType, data.insertedRecords);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload records.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setParsedData([]);
    setFileName("");
    setErrorMsg("");
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.7)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: "20px",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "720px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
              Bulk Upload via Excel / CSV
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "3px 0 0" }}>
              Import hundreds of churches, pastors, or events in seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer", color: "#64748b", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "28px", overflowY: "auto", flex: 1 }}>
          
          {/* Target Type Selector */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: "8px" }}>
              Select What You Want to Upload:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {[
                { id: "churches", label: "🏛️ Churches", desc: "Names, address, UK postcode, denominations" },
                { id: "pastors", label: "🎙️ Pastors & Leaders", desc: "Full name, title, bio, location" },
                { id: "events", label: "📅 Events", desc: "Title, dates, venue, tickets" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setUploadType(t.id as any);
                    resetState();
                  }}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    border: "2px solid",
                    borderColor: uploadType === t.id ? "#7c3aed" : "#e2e8f0",
                    background: uploadType === t.id ? "#f5f3ff" : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 800, color: uploadType === t.id ? "#7c3aed" : "#0f172a" }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sample Download Bar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="ti ti-file-spreadsheet" style={{ fontSize: "24px", color: "#16a34a" }}></i>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Need the template format?</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Download pre-formatted sample spreadsheet with columns</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => downloadSampleTemplate("xlsx")}
                style={{
                  background: "#16a34a",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                }}
              >
                <i className="ti ti-file-spreadsheet"></i> Full Excel (.xlsx)
              </button>

              <button
                onClick={() => downloadSampleTemplate("csv")}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="ti ti-download"></i> .CSV Template
              </button>
            </div>
          </div>

          {/* Dropzone Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "16px",
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: fileName ? "#f0fdf4" : "#ffffff",
              borderColor: fileName ? "#86efac" : "#cbd5e1",
              transition: "all 0.2s",
              marginBottom: "18px",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <i className={`ti ${fileName ? "ti-file-check" : "ti-cloud-upload"}`} style={{ fontSize: "40px", color: fileName ? "#16a34a" : "#7c3aed", marginBottom: "10px", display: "block" }}></i>
            
            {fileName ? (
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#16a34a" }}>
                  Selected: {fileName}
                </div>
                <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>
                  <strong>{parsedData.length}</strong> records ready to import. Click below to proceed.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                  Click to choose your Excel (.xlsx) or CSV file
                </div>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                  Supports auto-geocoding for UK postcodes & addresses
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success Banner */}
          {uploadResult && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "14px", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ fontWeight: 800, fontSize: "14px" }}>
                🎉 Successfully imported {uploadResult.insertedCount} {uploadType}!
              </div>
              {uploadResult.errorsCount > 0 && (
                <div style={{ fontSize: "12.5px", marginTop: "4px", color: "#b45309" }}>
                  {uploadResult.errorsCount} rows had errors and were skipped.
                </div>
              )}
            </div>
          )}

          {/* Data Preview Table (First 3 rows) */}
          {parsedData.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                Preview First {Math.min(3, parsedData.length)} Records:
              </div>
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                      {Object.keys(parsedData[0] || {}).slice(0, 5).map((k) => (
                        <th key={k} style={{ padding: "8px 10px", color: "#475569" }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 3).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {Object.values(row).slice(0, 5).map((val: any, i) => (
                          <td key={i} style={{ padding: "8px 10px", color: "#1e293b" }}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ padding: "18px 28px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <button
            onClick={resetState}
            disabled={isUploading || parsedData.length === 0}
            style={{ background: "transparent", border: "none", color: "#64748b", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
          >
            Clear Selected
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              disabled={isUploading}
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                color: "#475569",
                fontWeight: 700,
                fontSize: "13.5px",
                padding: "10px 18px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStartImport}
              disabled={isUploading || parsedData.length === 0}
              style={{
                background: parsedData.length > 0 ? "linear-gradient(135deg, #16a34a, #059669)" : "#94a3b8",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: "13.5px",
                padding: "10px 24px",
                borderRadius: "12px",
                cursor: parsedData.length > 0 ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: parsedData.length > 0 ? "0 4px 14px rgba(22, 163, 74, 0.35)" : "none",
              }}
            >
              <i className={`ti ${isUploading ? "ti-loader animate-spin" : "ti-upload"}`}></i>
              {isUploading ? "Importing Data..." : `Import ${parsedData.length} ${uploadType}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
