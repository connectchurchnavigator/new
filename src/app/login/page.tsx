"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import logoImg from "@/Assets/logo (1).png";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const nextUrl = searchParams.get("next") || "/dashboard";

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

  // Auto-redirect if already signed in or when OAuth completes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.replace(nextUrl);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        router.replace(nextUrl);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [nextUrl, router, supabase]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setBusy(true);
    setAuthStep(0);

    try {
      if (activeTab === "register") {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const redirectUrl = typeof window !== "undefined"
          ? `${window.location.origin}/add-church`
          : "https://churchnavigator.com/add-church";

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
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInData?.session || signUpData?.session) {
          window.location.href = searchParams.get("next") || "/dashboard";
        } else {
          setInfoMsg("📩 Confirmation email sent! Please check your inbox and click the activation link to complete registration.");
          setActiveTab("signin");
          setBusy(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Direct instant navigation to dashboard or destination
        window.location.href = nextUrl;
      }
    } catch (err: any) {
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

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "24px 0 20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          <span style={{ padding: "0 14px", fontSize: "12.5px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={async () => {
            setErrorMsg("");
            try {
              const redirectUrl = typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
                : "https://churchnavigator.com/auth/callback";

              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: redirectUrl,
                  queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                  },
                },
              });
              if (error) throw error;
            } catch (err: any) {
              setErrorMsg(err.message || "Failed to initialize Google Sign-In.");
            }
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "12px 18px",
            borderRadius: "24px",
            border: "1.5px solid #e2e8f0",
            background: "#ffffff",
            color: "#1e293b",
            fontSize: "14.5px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            transition: "all 0.18s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </button>

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
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "32px 28px",
            maxWidth: "340px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#f3e8ff",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <i className="ti ti-loader-2" style={{ fontSize: "28px", animation: "cnSpin 0.7s linear infinite" }}></i>
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
              {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Redirecting you to your portal...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--cn-purple, #7c3aed)", fontWeight: 600 }}>
          <i className="ti ti-loader-2 ti-spin" style={{ fontSize: "24px" }}></i>
          <span>Loading...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
