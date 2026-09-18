import React from "react";
import TopNav from "@/components/layout/TopNav";

export default function ExploreLoading() {
  return (
    <div style={{ background: "#f8fafc", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopNav />

      {/* Explore Tabs Skeleton */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #ececf2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 24px",
      }}>
        <div style={{
          background: "#f1f5f9",
          padding: "4px",
          borderRadius: "24px",
          display: "flex",
          gap: "8px"
        }}>
          <div style={{ width: "110px", height: "34px", background: "#7c3aed", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 700 }}>
            <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", marginRight: "6px" }}></i> Loading...
          </div>
          <div style={{ width: "100px", height: "34px", background: "#e2e8f0", borderRadius: "20px" }} />
          <div style={{ width: "130px", height: "34px", background: "#e2e8f0", borderRadius: "20px" }} />
          <div style={{ width: "90px", height: "34px", background: "#e2e8f0", borderRadius: "20px" }} />
        </div>
      </div>

      {/* Main Split Screen Skeleton */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        
        {/* Filters Sidebar Skeleton */}
        <div style={{
          width: "280px",
          minWidth: "280px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          padding: "20px",
          gap: "18px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
            <div style={{ width: "80px", height: "20px", background: "#e2e8f0", borderRadius: "6px" }}></div>
            <div style={{ width: "40px", height: "16px", background: "#f1f5f9", borderRadius: "4px" }}></div>
          </div>
          <div style={{ width: "100%", height: "44px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0" }}></div>
          <div style={{ width: "100%", height: "40px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}></div>
          <div style={{ width: "100%", height: "100px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}></div>
          <div style={{ width: "100%", height: "80px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}></div>
        </div>

        {/* Results List Column Skeleton */}
        <div style={{
          width: "400px",
          minWidth: "400px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="ti ti-loader-2" style={{ fontSize: "16px", color: "#7c3aed", animation: "spin 1s linear infinite" }}></i>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              FINDING CHURCHES ON MAP...
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1.5px solid #e2e8f0", overflow: "hidden", animation: "pulse 1.5s infinite" }}>
                <div style={{ height: "130px", background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}></div>
                <div style={{ padding: "16px" }}>
                  <div style={{ width: "65%", height: "18px", background: "#cbd5e1", borderRadius: "6px", marginBottom: "8px" }}></div>
                  <div style={{ width: "45%", height: "13px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "12px" }}></div>
                  <div style={{ width: "90%", height: "12px", background: "#f1f5f9", borderRadius: "4px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder Skeleton */}
        <div style={{
          flex: 1,
          height: "100%",
          background: "#eef2f6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          gap: "16px"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "24px 36px",
            borderRadius: "20px",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
            textAlign: "center",
            maxWidth: "360px",
            border: "1px solid #e2e8f0",
            animation: "slideUp 0.3s ease"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f43f5e, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)"
            }}>
              <i className="ti ti-map-pin" style={{ fontSize: "26px", color: "#fff" }}></i>
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Loading Map & Churches...</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Locating coordinates, service times and verified congregations.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", color: "#7c3aed", fontSize: "12px", fontWeight: 700 }}>
              <i className="ti ti-loader-2" style={{ fontSize: "14px", animation: "spin 1s linear infinite" }}></i>
              <span>Preparing Interactive Map</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
