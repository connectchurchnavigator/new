"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function TestDb() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing_tables">("loading");
  const [message, setMessage] = useState("Testing connection...");

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = supabaseBrowser();
        
        // Try to fetch 1 row from the churches table
        const { data, error } = await supabase.from('churches').select('id').limit(1);

        if (error) {
          if (error.code === "42P01") {
            // Postgres error code for "undefined_table"
            setStatus("missing_tables");
            setMessage("Connection successful, but the tables don't exist! Did you run the SQL scripts in Supabase?");
          } else {
            setStatus("error");
            setMessage(`Connection failed: ${error.message}`);
          }
        } else {
          setStatus("success");
          setMessage("Connection successful! The database and tables are ready to go!");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(`Error: ${err.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "500px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "20px", color: "#111827" }}>Database Test</h1>
        
        {status === "loading" && <div style={{ color: "#6b7280" }}><i className="ti ti-loader" style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: "8px" }}></i> {message}</div>}
        
        {status === "success" && (
          <div style={{ color: "#059669", background: "#ecfdf5", padding: "16px", borderRadius: "8px", fontWeight: 600 }}>
            <i className="ti ti-circle-check" style={{ fontSize: "20px", marginBottom: "8px", display: "block" }}></i>
            {message}
          </div>
        )}

        {status === "missing_tables" && (
          <div style={{ color: "#d97706", background: "#fffbeb", padding: "16px", borderRadius: "8px", fontWeight: 600 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: "20px", marginBottom: "8px", display: "block" }}></i>
            {message}
          </div>
        )}

        {status === "error" && (
          <div style={{ color: "#dc2626", background: "#fef2f2", padding: "16px", borderRadius: "8px", fontWeight: 600 }}>
            <i className="ti ti-x" style={{ fontSize: "20px", marginBottom: "8px", display: "block" }}></i>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
