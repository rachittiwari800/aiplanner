import React, { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import {
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Plane,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,72}$/;

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  // Google Sign-In state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("traveler.google@gmail.com");
  const [googleNameInput, setGoogleNameInput] = useState("Google Traveler");
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "dummy_google_client_id" && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError("");
            await loginWithGoogle({ credential: response.credential });
          } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Google authentication failed.");
          }
        },
      });

      if (googleBtnContainerRef.current) {
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill",
        });
      }
    }
  }, [loginWithGoogle]);

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "dummy_google_client_id" && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleQuickGoogleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    if (!emailPattern.test(cleanEmail)) {
      setError("Please provide a valid Google email address.");
      return;
    }
    setError("");
    try {
      setShowGoogleModal(false);
      await loginWithGoogle({
        email: cleanEmail,
        name: googleNameInput.trim() || "Google Traveler",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Google authentication failed.");
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    setPointer({
      x: (event.clientX / window.innerWidth) * 100,
      y: (event.clientY / window.innerHeight) * 100,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!emailPattern.test(trimmedEmail)) {
        throw new Error("Enter a valid email address.");
      }
      if (mode === "register" && !namePattern.test(name.trim())) {
        throw new Error("Name may contain only letters, spaces, apostrophes, and hyphens.");
      }
      if (mode === "register" && !passwordPattern.test(password)) {
        throw new Error("Password needs 8+ characters with uppercase, lowercase, number, and special character.");
      }
      if (mode === "register") {
        await register(name.trim(), trimmedEmail, password);
      } else {
        await login(trimmedEmail, password);
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to the server.";
      setError(message);
    }
  };

  const switchMode = () => {
    setMode((currentMode) => currentMode === "register" ? "login" : "register");
    setError("");
  };

  return (
    <main
      onPointerMove={handlePointerMove}
      className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6 flex items-center justify-center"
    >
      <div
        className="pointer-events-none absolute inset-0 login-atmosphere"
        style={
          {
            "--pointer-x": `${pointer.x}%`,
            "--pointer-y": `${pointer.y}%`,
          } as React.CSSProperties
        }
      />
      <div className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-size-[42px_42px]" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1fr_0.9fr] overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/95 shadow-xl backdrop-blur-xl">
        <section className="hidden lg:flex relative overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-cyan-950 p-10 text-white flex-col justify-between min-h-155">
          <div className="pointer-events-none absolute inset-0 login-stars opacity-70" />
          <div className="pointer-events-none absolute -left-12 top-32 h-px w-[125%] rotate-18 border-t border-dashed border-cyan-200/40 login-route" />
          <div className="pointer-events-none absolute -left-12 top-64 h-px w-[125%] -rotate-12 border-t border-dashed border-purple-200/35 login-route login-route-delay" />
          <div className="pointer-events-none absolute left-[24%] top-[39%] login-pin">
            <MapPin className="h-5 w-5 fill-cyan-300 text-cyan-100" />
          </div>
          <div className="pointer-events-none absolute right-[23%] top-[56%] login-pin login-pin-delay">
            <MapPin className="h-5 w-5 fill-pink-300 text-pink-100" />
          </div>
          <div className="pointer-events-none absolute right-[14%] top-[26%] rounded-full border border-white/20 p-3 login-float">
            <Plane className="h-5 w-5 -rotate-12 text-cyan-200" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Wayfarer</p>
                <p className="text-xs text-cyan-200">
                  Travel, thoughtfully planned.
                </p>
              </div>
            </div>
          </div>
          <div className="relative max-w-md">
            <p className="text-sm font-semibold text-cyan-200">
              Your next story starts here.
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight">
              Plan less. Experience more.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              A calmer way to shape the places, people, and moments ahead.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">
                Wayfarer
              </p>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              {mode === "login" ? "Sign in to plan" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {mode === "login"
                ? "Continue your next adventure."
                : "Start building better trips today."}
            </p>

            {/* Google Sign In Button */}
            <div className="mt-6 space-y-2">
              <div ref={googleBtnContainerRef} className="empty:hidden flex justify-center w-full" />
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              <span className="bg-white dark:bg-gray-900 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
                or continue with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" ? (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Full name
                  </span>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
                      placeholder="Your name"
                    />
                  </div>
                </label>
              ) : null}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email address
                </span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    minLength={mode === "register" ? 8 : 1}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 pl-10 pr-11 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300"
                >
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : null}
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {mode === "login"
                ? "New to Wayfarer?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </section>
      </div>

      {showGoogleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Continue with Google
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Sign in or test with any Google account. Trip itineraries will be emailed to this address!
            </p>

            <form onSubmit={handleQuickGoogleSubmit} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </span>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="e.g. Rachit Traveler"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Google Email Address
                </span>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="rachit@gmail.com"
                />
              </label>

              <div className="pt-2 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGoogleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : null}
                  Sign in with Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
};
