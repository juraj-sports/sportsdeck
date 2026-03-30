"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Trophy, Star, Zap, Check } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultMode = "signin" }: AuthModalProps) {
  const { signIn } = useAuthActions();
  const stats = useQuery(api.apps.getStats);

  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [twitterLoading, setTwitterLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: mode === "signin" ? "signIn" : "signUp" });
      onOpenChange(false);
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg = err?.message ?? "";
      if (mode === "signup" && msg.includes("already exists")) {
        // Account exists — switch to sign-in and let the user know
        setMode("signin");
        setError("You already have an account. Please sign in below.");
      } else if (mode === "signin") {
        setError("Invalid email or password.");
      } else {
        setError("Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google");
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError("Google sign-in is not configured yet.");
      setGoogleLoading(false);
    }
  };

  const handleTwitter = async () => {
    setTwitterLoading(true);
    setError("");
    try {
      await signIn("twitter");
    } catch (err: any) {
      console.error("Twitter auth error:", err);
      setError("X sign-in is not configured yet.");
      setTwitterLoading(false);
    }
  };

  const benefits = [
    { icon: Star, text: "Save your favourite apps" },
    { icon: Trophy, text: "Personalised picks by sport" },
    { icon: Zap, text: "First to know about new tools" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl flex"
        style={{ minHeight: "520px" }}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT PANEL — Sports theme */}
        <div
          className="hidden md:flex flex-col justify-between w-5/12 p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f1923 0%, #1a2a1a 50%, #0f1923 100%)",
          }}
        >
          {/* Background texture */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #FF6B35 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, #FF6B35 0%, transparent 50%)`,
            }}
          />
          {/* Decorative circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border border-white/5" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-white/5" />
          <div className="absolute top-1/2 -right-12 w-40 h-40 rounded-full border border-orange-500/10" />

          <div className="relative z-10">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 mb-8">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#FF6B35" }}
              />
              <span className="text-white font-bold text-sm tracking-widest uppercase">
                SportsDeck
              </span>
            </div>

            <h2 className="text-white text-2xl font-bold leading-tight mb-3">
              The #1 directory for<br />
              <span style={{ color: "#FF6B35" }}>sports tech tools</span>
            </h2>
            <p className="text-white/50 text-sm mb-8">
              100+ tools. Zero noise.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: "#FF6B35" }} />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white">100+</div>
              <div className="text-white/40 text-xs mt-0.5">Tools</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats ? stats.categoriesCount : "8"}
              </div>
              <div className="text-white/40 text-xs mt-0.5">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats ? `${stats.sportsCount}+` : "—"}
              </div>
              <div className="text-white/40 text-xs mt-0.5">Sports</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {mode === "signin" ? (
                <>
                  No account yet?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    className="font-medium hover:underline"
                    style={{ color: "#FF6B35" }}
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    onClick={() => { setMode("signin"); setError(""); }}
                    className="font-medium hover:underline"
                    style={{ color: "#FF6B35" }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#FF6B35" }}
            >
              {loading
                ? mode === "signin" ? "Signing in…" : "Creating account…"
                : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
              <span className="bg-white px-2">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            <button
              onClick={handleTwitter}
              disabled={twitterLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {twitterLoading ? "Redirecting…" : "Continue with X"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
