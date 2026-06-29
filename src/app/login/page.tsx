"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logoImg from "@/Assets/logo (1).png"; // Assuming this is the correct logo

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", paddingTop: "12vh", background: "#ffffff" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "20px" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <Image src={logoImg} alt="Church Navigator" height={36} style={{ objectFit: "contain" }} />
        </div>

        {/* Toggle Switch */}
        <div style={{ display: "flex", background: "#f8f9fa", borderRadius: "24px", padding: "5px", marginBottom: "32px", border: "1px solid #f0f0f0" }}>
          <button
            onClick={() => setActiveTab("signin")}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "20px",
              border: "none",
              fontSize: "14px",
              fontWeight: activeTab === "signin" ? 600 : 500,
              background: activeTab === "signin" ? "#fff" : "transparent",
              color: activeTab === "signin" ? "var(--cn-ink)" : "#6b7280",
              boxShadow: activeTab === "signin" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "20px",
              border: "none",
              fontSize: "14px",
              fontWeight: activeTab === "register" ? 600 : 500,
              background: activeTab === "register" ? "#fff" : "transparent",
              color: activeTab === "register" ? "var(--cn-ink)" : "#6b7280",
              boxShadow: activeTab === "register" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {activeTab === "register" && (
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--cn-border)",
                    fontSize: "15px",
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--cn-border)",
                    fontSize: "15px",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--cn-border)",
                fontSize: "15px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  borderRadius: "12px",
                  border: "1px solid var(--cn-border)",
                  fontSize: "15px",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: "18px" }}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "24px",
              border: "none",
              background: "var(--cn-purple)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              marginTop: "12px",
            }}
          >
            {activeTab === "signin" ? "Sign In" : "Register"}
          </button>
        </form>

        {activeTab === "signin" && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link href="#" style={{ fontSize: "14px", color: "var(--cn-purple)", textDecoration: "none", fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
