import { useState } from "react";
import { signUpEmail } from "@/lib/auth-actions";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "motion/react";
import { CulturaLogo } from "./CulturaLogo";

interface SignupProps {
  onSignupComplete?: () => void;
  onSwitchToLogin?: () => void;
}

export function Signup({ onSignupComplete, onSwitchToLogin }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"aupair" | "family">("aupair");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agreedToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms || loading) return;

    setLoading(true);
    setError(null);

    try {
      await signUpEmail(formData.email, formData.password, userType);
      if (typeof window !== "undefined") {
        localStorage.removeItem("userType");
      }
      onSignupComplete?.();
    } catch (err: any) {
      let message = "Signup failed. Please try again.";

      if (err?.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please log in instead.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err?.code === "auth/weak-password") {
        message = "Password is too weak. Please use at least 6 characters.";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isEmailAlreadyRegistered =
    error === "This email is already registered. Please log in instead.";

  // Google signup is intentionally disabled for the beta release.
  // TODO: Re-enable after stabilizing Firebase OAuth settings, redirect domains, and profile type handling.
  // const handleSocialSignup = async (provider: string) => {
  //   if (provider !== "google") return;
  //
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     await signInGoogle(undefined, "signup");
  //     if (typeof window !== "undefined") {
  //       localStorage.removeItem("userType");
  //     }
  //     onSignupComplete?.();
  //   } catch (err: any) {
  //     console.error("[Google Signup] error raw:", err);
  //     console.error("[Google Signup] code:", err?.code);
  //     console.error("[Google Signup] message:", err?.message);
  //
  //     let message = "Google sign-in failed. Please try again.";
  //     if (err?.code === "auth/account-already-exists") {
  //       message = "An account already exists. Please log in.";
  //     } else if (err?.code === "auth/popup-closed-by-user") {
  //       message = "Google sign-in was cancelled.";
  //     } else if (err?.code === "auth/popup-blocked") {
  //       message = "The popup was blocked. Please check your browser settings.";
  //     } else if (err?.code === "auth/cancelled-popup-request") {
  //       message = "Google sign-in was interrupted. Please try again.";
  //     }
  //
  //     await signOutUser().catch(() => undefined);
  //     setError(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* Soft gradient blobs (background decoration) */}
      <motion.div
        className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-orange-200/60 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-200/60 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-200/50 blur-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10">
            {/* subtle highlight inside card */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 blur-3xl opacity-40" />

            {/* Logo / Hero */}
            <div className="relative text-center mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center justify-center mb-3"
              >
                <CulturaLogo size={64} />
              </motion.div>
              <h1 className="text-2xl md:text-3xl text-gray-800 tracking-tight mb-2">
                Join Cultura
              </h1>
              <p className="text-sm text-gray-600">
                Who are you joining as?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setUserType("aupair")}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-all ${
                  userType === "aupair"
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-orange-300"
                }`}
              >
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-medium text-gray-800">Au Pair</span>
                <span className="text-xs text-gray-500">Looking for a family</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType("family")}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-all ${
                  userType === "family"
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-orange-300"
                }`}
              >
                <span className="text-2xl">🏠</span>
                <span className="text-sm font-medium text-gray-800">Host Family</span>
                <span className="text-xs text-gray-500">Looking for an au pair</span>
              </button>
            </div>

            <Separator className="my-6" />

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                    required
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Label htmlFor="password" className="text-sm text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-2 pt-2"
              >
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToTerms: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <button type="button" className="text-orange-500 hover:underline">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-orange-500 hover:underline">
                    Privacy Policy
                  </button>
                </Label>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Button
                  type="submit"
                  disabled={!formData.agreedToTerms || loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:via-amber-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Please wait..." : "Create Account"}</span>
                </Button>
              </motion.div>
            </form>

            {/* Google signup is intentionally hidden for the beta release. */}
            {/*
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="space-y-3">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => void handleSocialSignup("google")}
                  className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {loading ? "Signing in..." : "Continue with Google"}
                  </span>
                </Button>
              </motion.div>
            </div>
            */}

            {error && !isEmailAlreadyRegistered ? (
              <p className="mt-4 text-sm text-center text-red-500">{error}</p>
            ) : null}

            {isEmailAlreadyRegistered ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800">
                    Looks like you’re already part of Cultura
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600">
                    This email is already connected to an account. Log in to continue your journey.
                  </p>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white shadow-md hover:from-orange-600 hover:via-amber-600 hover:to-rose-600"
                    >
                      Log in and continue
                    </Button>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Use a different email
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}

            {/* Switch to Login */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-orange-500 hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer Navigation */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200/70 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">About</button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Contact</button>
            <Separator orientation="vertical" className="h-4" />
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Language: EN / JP</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
