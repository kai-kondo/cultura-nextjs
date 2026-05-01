import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { CulturaLogo } from "./CulturaLogo";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInEmail } from "@/lib/auth-actions";
import { db } from "@/lib/firebase";

interface LoginProps {
  onLogin?: (type: "family" | "aupair") => void;
  onSwitchToSignup?: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [showEmailForm] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signInEmail(email, password);
      // UID が取れれば認証は成功とみなし、あとは /home 側のガードに任せる
      if (user?.uid) {
        window.location.href = "/home";
      }
    } catch (err: any) {
      console.error("[Login] error raw:", err);
      console.error("[Login] code:", err?.code);
      console.error("[Login] message:", err?.message);

      let message = "We couldn’t open your Cultura door just yet. Please try again.";
      if (err?.code === "auth/invalid-email") {
        message = "That email doesn’t look quite right. Please check it and try again.";
      } else if (err?.code === "auth/user-not-found") {
        message = "We couldn’t find your Cultura account yet.";
      } else if (err?.code === "auth/wrong-password") {
        message = "That password didn’t match. Give it another try.";
      } else if (err?.code === "auth/invalid-credential") {
        message = "We couldn’t match that email and password.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many tries for now. Take a short break and come back soon.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function openPasswordResetModal() {
    setError(null);
    setResetError(null);
    setResetMessage(null);
    setShowResetModal(true);
  }

  function closePasswordResetModal() {
    setShowResetModal(false);
    setResetError(null);
    setResetMessage(null);
    setResetLoading(false);
  }

  async function handlePasswordReset() {
    setResetError(null);
    setResetMessage(null);

    if (!email) {
      setResetError("Enter your email and we’ll send you a reset link.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("We’ve sent a password reset link to your inbox.");
    } catch (err: any) {
      console.error("[Password Reset] error:", err);

      let message = "We couldn’t send the reset email. Please try again.";
      if (err?.code === "auth/invalid-email") {
        message = "That email doesn’t look quite right.";
      } else if (err?.code === "auth/user-not-found") {
        message = "We couldn’t find your Cultura account yet.";
      }

      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  }

  // Google login is intentionally disabled for the beta release.
  // TODO: Re-enable after stabilizing Firebase OAuth, redirect domains, and user document checks.
  // async function handleGoogleLogin() {
  //   setError(null);
  //   setLoading(true);
  //
  //   try {
  //     const user = await signInGoogle("aupair", "login");
  //
  //     if (!user?.uid) {
  //       setError("Google sign-in failed. Please try again.");
  //       return;
  //     }
  //
  //     const userSnap = await getDoc(doc(db, "users", user.uid));
  //
  //     if (!userSnap.exists()) {
  //       await signOutUser();
  //       window.location.href = "/signup";
  //       return;
  //     }
  //
  //     const userData = userSnap.data() as any;
  //
  //     if (userData?.isDeleted === true) {
  //       await signOutUser();
  //       setError("This account has been deleted and can no longer be used.");
  //       return;
  //     }
  //
  //     window.location.href = "/home";
  //   } catch (err: any) {
  //     console.error("[Google Login] error raw:", err);
  //     console.error("[Google Login] code:", err?.code);
  //     console.error("[Google Login] message:", err?.message);
  //
  //     let message = "Google sign-in failed. Please try again.";
  //     if (err?.code === "auth/popup-closed-by-user") {
  //       message = "Google sign-in was cancelled.";
  //     } else if (err?.code === "auth/popup-blocked") {
  //       message = "The popup was blocked. Please check your browser settings.";
  //     } else if (err?.code === "auth/cancelled-popup-request") {
  //       message = "Google sign-in was interrupted. Please try again.";
  //     }
  //
  //     setError(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const isAccountNotFound = error === "We couldn’t find your Cultura account yet.";
  const isWrongPassword =
    error === "That password didn’t match. Give it another try." ||
    error === "We couldn’t match that email and password.";
  const isTooManyRequests =
    error === "Too many tries for now. Take a short break and come back soon.";
  const shouldShowLoginErrorModal =
    isAccountNotFound || isWrongPassword || isTooManyRequests;

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
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10">
            {/* subtle highlight inside card */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 blur-3xl opacity-40" />

            {/* Logo / Hero */}
            <div className="relative text-center mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center justify-center mb-4"
              >
                <CulturaLogo size={80} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
                Cultura{" "}
                <span className="text-gray-400 text-lg align-top">(Beta)</span>
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Meet trusted families and au pairs.
                <br />
                Sign in with email to continue.
              </p>
            </div>

            <Separator className="my-8" />

            {/* Email Login */}

            {error && !showEmailForm && !shouldShowLoginErrorModal ? (
              <p className="mt-4 text-sm text-center text-red-500">{error}</p>
            ) : null}

            {showEmailForm && (
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-gray-300 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={openPasswordResetModal}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                {error && !shouldShowLoginErrorModal ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : null}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-auto py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            )}

            {showResetModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl"
                >
                  <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-orange-200/60 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-rose-200/60 blur-3xl" />

                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <Mail className="h-6 w-6 text-orange-500" />
                    </div>

                    <h2 className="mb-2 text-lg font-semibold text-gray-800">
                      Reset your password
                    </h2>

                    <p className="mb-5 text-sm leading-relaxed text-gray-600">
                      Enter the email connected to your Cultura account. We’ll send you a secure link to create a new password.
                    </p>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="mb-3 w-full rounded-xl border border-gray-300 bg-white/90 p-3 text-left outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    {resetError ? (
                      <p className="mb-3 text-left text-sm text-red-500">{resetError}</p>
                    ) : null}

                    {resetMessage ? (
                      <p className="mb-3 rounded-xl bg-orange-50 px-3 py-2 text-left text-sm text-orange-700">
                        {resetMessage}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={resetLoading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white shadow-md hover:from-orange-600 hover:via-amber-600 hover:to-rose-600"
                    >
                      {resetLoading ? "Sending..." : "Send reset link"}
                    </Button>

                    <button
                      type="button"
                      onClick={closePasswordResetModal}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Back to sign in
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}

            {shouldShowLoginErrorModal ? (
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
                    {isAccountNotFound
                      ? "We haven’t met you yet"
                      : isTooManyRequests
                        ? "Let’s pause for a moment"
                        : "Almost there — just one detail off"}
                  </h2>

                  <p className="mb-5 text-sm leading-relaxed text-gray-600">
                    {isAccountNotFound
                      ? "This email isn’t connected to a Cultura account yet. Create one first and start your journey with us."
                      : isTooManyRequests
                        ? "For your safety, sign-in is taking a short break. Please try again a little later."
                        : "The email and password didn’t match. Check your details and try again when you’re ready."}
                  </p>

                  <div className="space-y-3">
                    {isAccountNotFound ? (
                      <Button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white shadow-md hover:from-orange-600 hover:via-amber-600 hover:to-rose-600"
                      >
                        Create your Cultura account
                      </Button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {isAccountNotFound
                        ? "Try another email"
                        : isTooManyRequests
                          ? "Close"
                          : "Try again"}
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}


            <p className="text-center text-xs text-gray-500 mt-2">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>

            {/* Switch to Signup */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-orange-500 hover:underline"
                >
                  Sign up
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
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </button>
            <Separator orientation="vertical" className="h-4" />
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              Language: EN / JP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
