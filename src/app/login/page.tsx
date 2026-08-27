"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import logoImg from "@/Assets/logo (1).png"; // Assuming this is the correct logo

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [authStep, setAuthStep] = useState(0);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setBusy(true);
    setAuthStep(0);

    const stepTimer1 = setTimeout(() => setAuthStep(1), 800);
    const stepTimer2 = setTimeout(() => setAuthStep(2), 1800);

    try {
      if (activeTab === "register") {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const redirectUrl = typeof window !== "undefined"
          ? `${window.location.origin}/add-church`
          : "https://chruch-gold.vercel.app/add-church";

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;

        // Try to immediately log in the user so they bypass confirmation if enabled/possible
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInData?.session || signUpData?.session) {
          setAuthStep(2);
          router.push("/add-church"); // Redirect to unified onboarding welcome selection
        } else {
          setInfoMsg("📩 Confirmation email sent! Please check your inbox and click the activation link to complete registration.");
          setActiveTab("signin");
          setBusy(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthStep(2);
        router.push("/dashboard");
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMsg(err.message || "An error occurred during authentication.");
      setBusy(false);
    }
  }

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
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMsg("");
              setInfoMsg("");
            }}
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
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
              setInfoMsg("");
            }}
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

        {errorMsg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "14px", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "14px", padding: "12px", borderRadius: "12px", marginBottom: "20px" }}>
            {infoMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {activeTab === "register" && (
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={busy}
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
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Please wait..." : (activeTab === "signin" ? "Sign In" : "Register")}
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

      {/* Full-Screen Sign In Loading Overlay */}
      {busy && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "40px 32px",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #f1f5f9"
          }}>
            {/* Animated Brand Icon */}
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)"
            }}>
              <i className="ti ti-sparkles" style={{ fontSize: "28px", color: "#ffffff" }}></i>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              {activeTab === "signin" ? "Signing You In..." : "Creating Account..."}
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 24px" }}>
              Please wait while we verify your credentials and launch your portal.
            </p>

            {/* Dynamic Step Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              {[
                { title: "Verifying email & password", icon: "ti-key" },
                { title: "Retrieving user account & permissions", icon: "ti-user-check" },
                { title: "Redirecting to portal...", icon: "ti-arrow-right" }
              ].map((step, idx) => {
                const isDone = authStep > idx;
                const isCurrent = authStep === idx;
                return (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "13px",
                    fontWeight: isCurrent || isDone ? 700 : 500,
                    color: isDone ? "#15803d" : isCurrent ? "#7c3aed" : "#94a3b8",
                    transition: "all 0.3s"
                  }}>
                    <div style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: isDone ? "#dcfce7" : isCurrent ? "#f3e8ff" : "#f1f5f9",
                      border: `1.5px solid ${isDone ? "#86efac" : isCurrent ? "#c084fc" : "#cbd5e1"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {isDone ? (
                        <i className="ti ti-check" style={{ fontSize: "12px", color: "#16a34a" }}></i>
                      ) : isCurrent ? (
                        <i className="ti ti-loader-2" style={{ fontSize: "12px", color: "#7c3aed" }}></i>
                      ) : (
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{idx + 1}</span>
                      )}
                    </div>
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
