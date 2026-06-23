import Image from "next/image";
import logoImg from "@/Assets/logo (1).png";

export default function TopNav() {
  return (
    <div className="topnav">
      <div style={{ display: "flex", alignItems: "center", gap: "11px", flexShrink: 0 }}>
        {/* Replace brand-mark with actual logo image */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={180} height={48} style={{ objectFit: "contain" }} />
        </div>
      </div>
      <div className="nav-search">
        <i className="ti ti-search" style={{ fontSize: "15px" }}></i> Search churches, cities, ministries...
      </div>
      <div style={{ flex: 1 }}></div>
      <div className="ai-pill">
        <span className="ai-dot"></span> AI Directory
      </div>
      <div className="nav-link">Explore</div>
      <div className="nav-link">For churches</div>
      <button className="nav-cta">List your church</button>
    </div>
  );
}
