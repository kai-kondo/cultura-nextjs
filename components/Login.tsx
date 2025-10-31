import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { CulturaLogo } from "./CulturaLogo";

interface LoginProps {
  onLogin?: (type: "family" | "aupair") => void;
  onSwitchToSignup?: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
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
                Cultura <span className="text-gray-400 text-lg align-top">(Beta)</span>
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Cultura is where people grow —
                <br />
                Families open their homes, Au Pairs share their hearts,
                <br />
                and together, they cultivate understanding.
              </p>
            </div>

            <Separator className="my-8" />

            {/* Social Login */}
            <div className="space-y-3">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Button
                  variant="outline"
                  aria-label="Continue with Google"
                  className="group relative w-full h-auto py-4 px-6 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                  onClick={() => onLogin?.("aupair")}
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
                  <span className="font-medium text-gray-700">Continue with Google</span>
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Button
                  variant="outline"
                  aria-label="Continue with Email"
                  className="group relative w-full h-auto py-4 px-6 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                  onClick={() => onLogin?.("aupair")}
                >
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Continue with Email</span>
                </Button>
              </motion.div>
            </div>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500">
                OR
              </span>
            </div>

            {/* Main CTA */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Button
                className="w-full h-auto py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:via-amber-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={() => onLogin?.("aupair")}
              >
                <span className="font-semibold text-lg">Get Started</span>
              </Button>
            </motion.div>

            <p className="text-center text-xs text-gray-500 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
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
