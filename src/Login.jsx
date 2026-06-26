/**
 * ============================================================
 * Login.jsx — Sibling to Signup.jsx
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // <-- Standard Axios for full control over requests
import {
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SHARED DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const TOKENS = {
  pageBg: "#0C0E14",
  formBg: "#141720",
  gold: "#C8A97E",
  goldHover: "#D9BC96",
  textPrimary: "#F2EDE6",
  textMuted: "rgba(242,237,230,0.42)",
  success: "#4CAF82",
  error: "#F06B6B",
  indigoOverlay:
    "linear-gradient(160deg, rgba(28,31,60,0.82) 0%, rgba(12,14,20,0.45) 50%, rgba(12,14,20,0.88) 100%)",
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MOODY "EVENING" STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const RETURNING_TAGLINES = [
  "Welcome back to the extraordinary.",
  "Your private sanctuary in the hills awaits.",
  "Redefining the Indian weekend getaway.",
  "The finest heritage stays, unlocked.",
  "Welcome back to the extraordinary.",
  "Your next chapter of wanderlust awaits.",
  "Pick up right where your curiosity left off.",
  "The world missed you.",
];

const DESTINATIONS = [
  {
    url: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1400&q=85&fit=crop",
    location: "Lake Pichola, Udaipur · 19:15",
  },
  {
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1400&q=85&fit=crop",
    location: "Kumarakom Backwaters, Kerala · 18:40",
  },
  {
    url: "https://images.unsplash.com/photo-1596895111956-bf1ce4069fee?w=1400&q=85&fit=crop",
    location: "Assagao Heritage Villa, Goa · 20:15",
  },
  {
    url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1400&q=85&fit=crop",
    location: "Amalfi Coast, Italy · 19:42",
  },
  {
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1400&q=85&fit=crop",
    location: "Kyoto Alleyways, Japan · 21:15",
  },
  {
    url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1400&q=85&fit=crop",
    location: "Dubai Marina, UAE · 20:04",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZOD LOGIN SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
  rememberMe: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. RE-USABLE FLOATING INPUT
// ─────────────────────────────────────────────────────────────────────────────

const FloatingInput = ({
  id,
  label,
  type = "text",
  error,
  isValid,
  rightSlot,
  registration,
  value,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || Boolean(value);
  const { ref, name, onChange, onBlur: rhfOnBlur } = registration;

  return (
    <div className="relative w-full">
      <div
        className="relative pb-2 transition-colors duration-300"
        style={{
          borderBottom: `1px solid ${
            error
              ? TOKENS.error
              : isFocused
              ? TOKENS.gold
              : "rgba(242,237,230,0.16)"
          }`,
        }}
      >
        <motion.label
          htmlFor={id}
          animate={{
            y: isFloating ? -20 : 0,
            scale: isFloating ? 0.8 : 1,
            color: error
              ? TOKENS.error
              : isFocused
              ? TOKENS.gold
              : TOKENS.textMuted,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-3 text-sm pointer-events-none origin-left select-none"
          style={{ transformOrigin: "left center" }}
        >
          {label}
        </motion.label>

        <input
          id={id}
          name={name}
          ref={ref}
          type={type}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            rhfOnBlur(e);
          }}
          placeholder=" "
          autoComplete="off"
          className="w-full bg-transparent pt-5 pb-0.5 pr-10 text-sm focus:outline-none"
          style={{ color: TOKENS.textPrimary }}
        />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence>
            {isValid && !error && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
              >
                <Check size={13} style={{ color: TOKENS.success }} />
              </motion.span>
            )}
          </AnimatePresence>
          {rightSlot}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 text-xs"
            style={{ color: TOKENS.error }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. LEFT PANEL (Moody Evening Variant)
// ─────────────────────────────────────────────────────────────────────────────

const TypewriterTagline = () => {
  const [displayText, setDisplayText] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const currentText = RETURNING_TAGLINES[taglineIndex];
    const delay = isDeleting ? 30 : charIndex === 0 ? 400 : 65;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 3000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setTaglineIndex((i) => (i + 1) % RETURNING_TAGLINES.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, isPaused, taglineIndex]);

  return (
    <div
      className="text-2xl md:text-[1.65rem] leading-snug min-h-[5rem]"
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        color: "rgba(242,237,230,0.92)",
      }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 1, 0, 0, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        className="inline-block w-0.5 h-[1.25em] align-middle ml-[2px]"
        style={{ backgroundColor: TOKENS.gold }}
      />
    </div>
  );
};

const LeftPanel = () => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setBgIndex((i) => (i + 1) % DESTINATIONS.length),
      8000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hidden lg:flex flex-col h-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0, scale: 1.07 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${DESTINATIONS[bgIndex].url})` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0" style={{ background: TOKENS.indigoOverlay }} />

      <div className="relative z-10 flex flex-col h-full p-10 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: TOKENS.gold }}
          >
            <MapPin size={14} color="#0C0E14" strokeWidth={2.5} />
          </div>
          <span
            className="font-semibold text-xs tracking-widest uppercase"
            style={{ color: TOKENS.textPrimary, letterSpacing: "0.18em" }}
          >
            voya
          </span>
        </motion.div>

        <div className="flex-1" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-2"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs backdrop-blur-sm border"
              style={{
                background: "rgba(12,14,20,0.40)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(242,237,230,0.65)",
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ backgroundColor: TOKENS.gold }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: TOKENS.gold }}
                />
              </span>
              {DESTINATIONS[bgIndex].location}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-4"
        >
          <TypewriterTagline />
        </motion.div>

        <div className="flex-1" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 text-xs"
          style={{ color: "rgba(242,237,230,0.4)" }}
        >
          <Sparkles size={13} style={{ color: TOKENS.gold }} />
          <span>Concierge desk active · Member portals online</span>
        </motion.div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN COMPONENT — Login
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState(null); // <-- Added error state for the UI banner

  useEffect(() => {
    if (!document.getElementById("voya-gfonts")) {
      const link = document.createElement("link");
      link.id = "voya-gfonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400;1,500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const watched = watch();
  const rememberMeChecked = Boolean(watched.rememberMe);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null); // Clear previous errors

    try {
      // 1. Send the post request to your Express login route
      // IMPORTANT: withCredentials allows the HTTP-Only cookie to be saved by the browser!
      const response = await axios.post("http://localhost:5000/api/user/login", {
        email: data.email,
        password: data.password
      }, {
        withCredentials: true 
      });

      console.log("✅ Login Success:", response.data.message);
      setIsSuccess(true); 

      // 2. Redirect to home after a brief success animation
      setTimeout(() => {
        window.location.href = '/home'; // Will redirect to the home discovery feed
      }, 1500);

    } catch (err) {
      // Axios puts the backend's custom JSON error message right here:
      const backendErrorMessage = err.response?.data?.message || "The server failed to respond.";
      
      console.error("Login rejected:", backendErrorMessage);
      setApiError(backendErrorMessage); // Render error in UI

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.984 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen w-full lg:grid"
      style={{
        backgroundColor: TOKENS.pageBg,
        fontFamily: "'Inter', system-ui, sans-serif",
        gridTemplateColumns: "58% 42%",
      }}
    >
      <LeftPanel />

      <div
        className="flex items-center justify-center min-h-screen lg:min-h-0 px-6 py-12 sm:px-10"
        style={{ backgroundColor: TOKENS.pageBg }}
      >
        <div className="w-full max-w-[340px]">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-10 lg:hidden"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: TOKENS.gold }}
            >
              <MapPin size={13} color="#0C0E14" strokeWidth={2.5} />
            </div>
            <span
              className="font-semibold uppercase text-xs tracking-widest"
              style={{ color: TOKENS.textPrimary, letterSpacing: "0.18em" }}
            >
              voya
            </span>
          </motion.div>

          {/* SUCCESS SCREEN */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    borderColor: "rgba(200,169,126,0.3)",
                  }}
                >
                  <MapPin size={26} style={{ color: TOKENS.gold }} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-semibold mb-2"
                  style={{ color: TOKENS.textPrimary }}
                >
                  Welcome back
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm"
                  style={{ color: TOKENS.textMuted }}
                >
                  Retrieving your curated itineraries…
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          {!isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5 }}
            >
              <div className="mb-8">
                <h1
                  className="text-2xl font-semibold tracking-tight mb-1"
                  style={{ color: TOKENS.textPrimary }}
                >
                  Sign in to Voya
                </h1>
                <p className="text-sm" style={{ color: TOKENS.textMuted }}>
                  Enter your credentials to access your portal.
                </p>
              </div>

              {/* ── API Error Banner ── */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 px-4 py-3 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: "rgba(240, 107, 107, 0.1)",
                      borderColor: "rgba(240, 107, 107, 0.25)",
                    }}
                  >
                    <p className="text-sm font-medium text-center" style={{ color: TOKENS.error }}>
                      {apiError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FloatingInput
                  id="login-email"
                  label="Email address"
                  type="email"
                  registration={register("email")}
                  error={errors.email?.message}
                  isValid={dirtyFields.email && !errors.email}
                  value={watched.email}
                />

                <FloatingInput
                  id="login-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  registration={register("password")}
                  error={errors.password?.message}
                  isValid={dirtyFields.password && !errors.password}
                  value={watched.password}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="ml-1 transition-opacity"
                      style={{ color: "rgba(242,237,230,0.30)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(242,237,230,0.70)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(242,237,230,0.30)")
                      }
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />

                {/* Utilities Row: Remember me + Forgot password */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none text-xs"
                    htmlFor="rememberMe"
                    style={{ color: TOKENS.textMuted }}
                  >
                    <div className="relative flex-shrink-0">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        {...register("rememberMe")}
                        className="sr-only"
                      />
                      <motion.div
                        whileTap={{ scale: 0.82 }}
                        className="w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors duration-200"
                        style={{
                          backgroundColor: rememberMeChecked
                            ? TOKENS.gold
                            : "transparent",
                          borderColor: rememberMeChecked
                            ? TOKENS.gold
                            : "rgba(242,237,230,0.22)",
                        }}
                      >
                        {rememberMeChecked && (
                          <Check size={9} color={TOKENS.pageBg} strokeWidth={3} />
                        )}
                      </motion.div>
                    </div>
                    Remember me
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-xs transition-colors"
                    style={{ color: TOKENS.gold }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = TOKENS.goldHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = TOKENS.gold)
                    }
                  >
                    Forgot password?
                  </a>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-xl text-sm font-semibold
                             flex items-center justify-center gap-2 mt-4
                             transition-colors duration-200 disabled:opacity-60"
                  style={{
                    backgroundColor: TOKENS.gold,
                    color: TOKENS.pageBg,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.backgroundColor = TOKENS.goldHover;
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = TOKENS.gold)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </>
                  )}
                </motion.button>

                <p
                  className="text-center text-xs pt-2"
                  style={{ color: "rgba(242,237,230,0.30)" }}
                >
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    className="underline underline-offset-2 transition-colors font-medium"
                    style={{ color: "rgba(200,169,126,0.75)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.gold)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(200,169,126,0.75)")
                    }
                  >
                    Request an invitation
                  </a>
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}