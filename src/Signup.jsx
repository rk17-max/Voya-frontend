/**
 * ============================================================
 * Signup.jsx — Premium Travel Booking Platform
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  MapPin,
  Star,
  Compass,
  Key,
  AlertCircle
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS
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
// 2. STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const TAGLINES = [
  "The world is a book — don't read just one chapter.",
  "Curated adventures for the discerning traveler.",
  "Where the extraordinary becomes your everyday.",
  "Every horizon holds a story worth chasing.",
];

const TESTIMONIALS = [
  {
    quote: "Voya redefined what travel could feel like. Every detail handled with an elegance I've never encountered elsewhere.",
    author: "Isabelle Fontaine",
    location: "Paris, France",
    trips: 14,
    initials: "IF",
  },
  {
    quote: "From Patagonia to Kyoto, each trip is a masterpiece of curation. I wouldn't trust another platform with my itineraries.",
    author: "Marcus Chen",
    location: "Singapore",
    trips: 9,
    initials: "MC",
  },
  {
    quote: "The concierge service alone is worth every penny. They anticipated things I didn't even know I needed.",
    author: "Amara Osei",
    location: "Accra, Ghana",
    trips: 7,
    initials: "AO",
  },
];

const DESTINATIONS = [
  { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85&fit=crop", location: "Patagonia, Chile" },
  { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85&fit=crop", location: "Hallstatt, Austria" },
  { url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&q=85&fit=crop", location: "Scottish Highlands, UK" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZOD VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/** Step 1 — Personal information + Role Selection */
const step1Schema = z.object({
  firstName: z.string().min(2, "At least 2 characters required").max(50, "First name is too long"),
  lastName: z.string().min(2, "At least 2 characters required").max(50, "Last name is too long"),
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  role: z.enum(["traveler", "creator"], { required_error: "Please select an account type" }),
});

/** Step 2 — Security credentials */
const step2Schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters required")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─────────────────────────────────────────────────────────────────────────────
// 4. HELPER — PASSWORD STRENGTH CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", barColor: "#2D3148", barWidth: "0%" };
  let score = 1;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "", barColor: "#2D3148", barWidth: "0%" },
    { label: "Weak",   barColor: "#EF4444", barWidth: "25%" },
    { label: "Fair",   barColor: "#F97316", barWidth: "50%" },
    { label: "Good",   barColor: "#EAB308", barWidth: "75%" },
    { label: "Strong", barColor: "#4CAF82", barWidth: "100%" },
  ];
  return { score, ...levels[score] };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. RE-USABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const FloatingInput = ({ id, label, type = "text", error, isValid, rightSlot, registration, value }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || Boolean(value);
  const { ref, name, onChange, onBlur: rhfOnBlur } = registration;

  return (
    <div className="relative w-full">
      <div
        className="relative pb-2 transition-colors duration-300"
        style={{ borderBottom: `1px solid ${error ? TOKENS.error : isFocused ? TOKENS.gold : "rgba(242,237,230,0.16)"}` }}
      >
        <motion.label
          htmlFor={id}
          animate={{ y: isFloating ? -20 : 0, scale: isFloating ? 0.8 : 1, color: error ? TOKENS.error : isFocused ? TOKENS.gold : TOKENS.textMuted }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-3 text-sm pointer-events-none origin-left select-none"
          style={{ transformOrigin: "left center" }}
        >
          {label}
        </motion.label>
        <input
          id={id} name={name} ref={ref} type={type} onChange={onChange}
          onFocus={() => setIsFocused(true)} onBlur={(e) => { setIsFocused(false); rhfOnBlur(e); }}
          placeholder=" " autoComplete="off"
          className="w-full bg-transparent pt-5 pb-0.5 pr-10 text-sm focus:outline-none"
          style={{ color: TOKENS.textPrimary }}
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence>
            {isValid && !error && (
              <motion.span
                key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
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
            key={error} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
            className="mt-1.5 text-xs" style={{ color: TOKENS.error }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const PasswordStrengthBar = ({ password }) => {
  const { label, barColor, barWidth, score } = getPasswordStrength(password);
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="mt-2.5 space-y-1 overflow-hidden">
      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "rgba(242,237,230,0.1)" }}>
        <motion.div className="h-full rounded-full" initial={{ width: "0%", backgroundColor: "#2D3148" }} animate={{ width: barWidth, backgroundColor: barColor }} transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-xs" style={{ color: score > 0 ? barColor : TOKENS.textMuted }}>
          {label ? `${label} password` : ""}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

const TypewriterTagline = () => {
  const [displayText, setDisplayText] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const currentText = TAGLINES[taglineIndex];
    const delay = isDeleting ? 38 : charIndex === 0 ? 480 : 72;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setIsPaused(true);
          setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, 2600);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setTaglineIndex((i) => (i + 1) % TAGLINES.length);
        }
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, isPaused, taglineIndex]);

  return (
    <div className="text-2xl md:text-[1.65rem] leading-snug min-h-[5rem]" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "rgba(242,237,230,0.92)" }}>
      {displayText}
      <motion.span animate={{ opacity: [1, 1, 0, 0, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} className="inline-block w-0.5 h-[1.25em] align-middle ml-[2px]" style={{ backgroundColor: TOKENS.gold }} />
    </div>
  );
};

const TestimonialCarousel = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const t = TESTIMONIALS[index];

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: "easeOut" }} className="rounded-2xl p-5 backdrop-blur-md border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}>
          <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} style={{ color: TOKENS.gold, fill: TOKENS.gold }} />)}</div>
          <p className="text-sm leading-relaxed mb-4 italic" style={{ color: "rgba(242,237,230,0.78)" }}>"{t.quote}"</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border" style={{ background: "rgba(200,169,126,0.18)", borderColor: "rgba(200,169,126,0.35)", color: TOKENS.gold }}>{t.initials}</div>
            <div>
              <p className="text-xs font-medium" style={{ color: TOKENS.textPrimary }}>{t.author}</p>
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "rgba(242,237,230,0.38)" }}><MapPin size={9} /><span>{t.location}</span><span>·</span><span>{t.trips} trips</span></div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-1.5 mt-3 justify-center">
        {TESTIMONIALS.map((_, i) => <motion.button key={i} onClick={() => setIndex(i)} animate={{ width: i === index ? 16 : 6, backgroundColor: i === index ? TOKENS.gold : "rgba(242,237,230,0.22)" }} transition={{ duration: 0.25 }} className="h-1.5 rounded-full focus:outline-none" />)}
      </div>
    </div>
  );
};

const LeftPanel = () => {
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setBgIndex((i) => (i + 1) % DESTINATIONS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hidden lg:flex flex-col h-full overflow-hidden">
      <AnimatePresence>
        <motion.div key={bgIndex} initial={{ opacity: 0, scale: 1.07 }} animate={{ opacity: 1, scale: 1.03 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: "easeOut" }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${DESTINATIONS[bgIndex].url})` }} />
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: TOKENS.indigoOverlay }} />
      <div className="relative z-10 flex flex-col h-full p-10 gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TOKENS.gold }}><MapPin size={14} color="#0C0E14" strokeWidth={2.5} /></div>
          <span className="font-semibold text-lg tracking-widest uppercase text-xs" style={{ color: TOKENS.textPrimary, letterSpacing: "0.18em" }}>voya</span>
        </motion.div>
        <div className="flex-1" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="mb-2">
          <AnimatePresence mode="wait">
            <motion.div key={bgIndex} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs backdrop-blur-sm border" style={{ background: "rgba(12,14,20,0.40)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(242,237,230,0.65)" }}>
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ backgroundColor: TOKENS.gold }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: TOKENS.gold }} /></span>
              {DESTINATIONS[bgIndex].location}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="mb-4"><TypewriterTagline /></motion.div>
        <div className="flex-1" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }}><TestimonialCarousel /></motion.div>
      </div>
    </div>
  );
};

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-2 mb-8">
    {[1, 2].map((step) => (
      <div key={step} className="flex items-center gap-2">
        <motion.div animate={{ width: currentStep === step ? 24 : 8, backgroundColor: currentStep > step ? TOKENS.success : currentStep === step ? TOKENS.gold : "rgba(242,237,230,0.15)" }} transition={{ duration: 0.3, ease: "easeInOut" }} className="h-2 rounded-full" />
        {step < 2 && <div className="w-5 h-px" style={{ backgroundColor: "rgba(242,237,230,0.12)" }} />}
      </div>
    ))}
    <span className="ml-1 text-xs" style={{ color: "rgba(242,237,230,0.30)" }}>Step {currentStep} of 2</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN COMPONENT — Signup
// ─────────────────────────────────────────────────────────────────────────────

export default function Signup() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!document.getElementById("voya-gfonts")) {
      const link = document.createElement("link");
      link.id = "voya-gfonts"; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400;1,500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const { register: reg1, handleSubmit: handleStep1Submit, watch: watch1, formState: { errors: errors1, dirtyFields: dirty1 } } = useForm({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: { role: "traveler" } // Default account type
  });

  const { register: reg2, handleSubmit: handleStep2Submit, watch: watch2, formState: { errors: errors2, dirtyFields: dirty2 } } = useForm({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
  });

  const s1 = watch1();
  const s2 = watch2();
  const passwordValue = s2.password || "";
  const acceptTermsChecked = Boolean(s2.acceptTerms);

  const onStep1Valid = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Valid = async (data) => {
    setIsSubmitting(true);
    setApiError("");

    // Map React camelCase variables strictly to the lowercase format the backend expects
    const payload = {
      firstname: step1Data.firstName,
      lastname: step1Data.lastName,
      email: step1Data.email,
      password: data.password,
      role: step1Data.role, // Added the role to the payload!
    };

    try {
      const response = await axios.post('https://voya-backend-cmoy.onrender.com/api/user/signup', payload);
      console.log("Signup success:", response.data);
      setIsSuccess(true);
    } catch (err) {
      const backendErrorMessage = err.response?.data?.message || "Something went wrong creating your account.";
      setApiError(backendErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideDirection = step === 2 ? 1 : -1;
  const stepVariants = {
    enter: (dir) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.984 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="min-h-screen w-full lg:grid" style={{ backgroundColor: TOKENS.pageBg, fontFamily: "'Inter', system-ui, sans-serif", gridTemplateColumns: "58% 42%" }}>
      <LeftPanel />

      <div className="flex items-center justify-center min-h-screen lg:min-h-0 px-6 py-12 sm:px-10 overflow-y-auto" style={{ backgroundColor: TOKENS.pageBg }}>
        <div className="w-full max-w-[340px] py-8">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: TOKENS.gold }}><MapPin size={13} color="#0C0E14" strokeWidth={2.5} /></div>
            <span className="font-semibold uppercase text-xs tracking-widest" style={{ color: TOKENS.textPrimary, letterSpacing: "0.18em" }}>voya</span>
          </motion.div>

          {/* API Error Banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm shadow-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p>{apiError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSuccess && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: "easeOut" }} className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{ background: "rgba(76,175,130,0.12)", borderColor: "rgba(76,175,130,0.3)" }}>
                  <Check size={26} style={{ color: TOKENS.success }} />
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-2xl font-semibold mb-2" style={{ color: TOKENS.textPrimary }}>Welcome aboard</motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm" style={{ color: TOKENS.textMuted }}>Your journey starts here. You can now sign in.</motion.p>
                <motion.a href="/login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-8 inline-block px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: TOKENS.gold, color: TOKENS.pageBg }}>Sign In Now</motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5 }} className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.div key={`heading-${step}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: TOKENS.textPrimary }}>{step === 1 ? "Create your account" : "Secure your account"}</h1>
                    <p className="text-sm" style={{ color: TOKENS.textMuted }}>{step === 1 ? "Join thousands of discerning travelers." : "Choose a strong password to protect your journeys."}</p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <StepIndicator currentStep={step} />

              <div className="relative overflow-hidden">
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  {step === 1 && (
                    <motion.form key="step-1" custom={slideDirection} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: "easeInOut" }} onSubmit={handleStep1Submit(onStep1Valid)} className="space-y-6">
                      
                      {/* Account Type Selector (The New Fields) */}
                      <div className="space-y-3 pb-2">
                        <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: TOKENS.textMuted }}>
                          Account Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          
                          {/* Traveler Card */}
                          <label
                            className="relative cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all duration-200"
                            style={{
                              backgroundColor: s1.role === "traveler" ? "rgba(200,169,126,0.08)" : "transparent",
                              borderColor: s1.role === "traveler" ? TOKENS.gold : "rgba(242,237,230,0.12)",
                            }}
                          >
                            <input type="radio" value="traveler" {...reg1("role")} className="sr-only" />
                            <Compass size={22} style={{ color: s1.role === "traveler" ? TOKENS.gold : TOKENS.textMuted }} />
                            <div className="text-center mt-1">
                              <p className="text-sm font-medium" style={{ color: s1.role === "traveler" ? TOKENS.textPrimary : TOKENS.textMuted }}>Traveler</p>
                              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: TOKENS.textMuted }}>Book curated<br/>sanctuaries</p>
                            </div>
                            {s1.role === "traveler" && (
                              <motion.div layoutId="role-check" className="absolute top-2.5 right-2.5">
                                <Check size={12} style={{ color: TOKENS.gold }} />
                              </motion.div>
                            )}
                          </label>

                          {/* Creator Card */}
                          <label
                            className="relative cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all duration-200"
                            style={{
                              backgroundColor: s1.role === "creator" ? "rgba(200,169,126,0.08)" : "transparent",
                              borderColor: s1.role === "creator" ? TOKENS.gold : "rgba(242,237,230,0.12)",
                            }}
                          >
                            <input type="radio" value="creator" {...reg1("role")} className="sr-only" />
                            <Key size={22} style={{ color: s1.role === "creator" ? TOKENS.gold : TOKENS.textMuted }} />
                            <div className="text-center mt-1">
                              <p className="text-sm font-medium" style={{ color: s1.role === "creator" ? TOKENS.textPrimary : TOKENS.textMuted }}>Creator</p>
                              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: TOKENS.textMuted }}>Host and manage<br/>properties</p>
                            </div>
                            {s1.role === "creator" && (
                              <motion.div layoutId="role-check" className="absolute top-2.5 right-2.5">
                                <Check size={12} style={{ color: TOKENS.gold }} />
                              </motion.div>
                            )}
                          </label>

                        </div>
                      </div>

                      <FloatingInput id="firstName" label="First name" registration={reg1("firstName")} error={errors1.firstName?.message} isValid={dirty1.firstName && !errors1.firstName} value={s1.firstName} />
                      <FloatingInput id="lastName" label="Last name" registration={reg1("lastName")} error={errors1.lastName?.message} isValid={dirty1.lastName && !errors1.lastName} value={s1.lastName} />
                      <FloatingInput id="email" label="Email address" type="email" registration={reg1("email")} error={errors1.email?.message} isValid={dirty1.email && !errors1.email} value={s1.email} />
                      
                      <motion.button type="submit" whileTap={{ scale: 0.98 }} className="w-full py-3.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 mt-2" style={{ backgroundColor: TOKENS.gold, color: TOKENS.pageBg }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TOKENS.goldHover)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TOKENS.gold)}>
                        Continue <ArrowRight size={15} strokeWidth={2.5} />
                      </motion.button>
                      <p className="text-center text-xs" style={{ color: "rgba(242,237,230,0.30)" }}>Already have an account? <a href="/login" className="underline underline-offset-2 transition-colors" style={{ color: "rgba(200,169,126,0.75)" }} onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,169,126,0.75)")}>Sign in</a></p>
                    </motion.form>
                  )}

                  {step === 2 && (
                    <motion.form key="step-2" custom={slideDirection} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: "easeInOut" }} onSubmit={handleStep2Submit(onStep2Valid)} className="space-y-8">
                      <div>
                        <FloatingInput id="password" label="Password" type={showPassword ? "text" : "password"} registration={reg2("password")} error={errors2.password?.message} isValid={dirty2.password && !errors2.password} value={s2.password} rightSlot={<button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} className="ml-1 transition-opacity" style={{ color: "rgba(242,237,230,0.30)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(242,237,230,0.70)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(242,237,230,0.30)")}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                        <AnimatePresence>{passwordValue.length > 0 && <PasswordStrengthBar password={passwordValue} />}</AnimatePresence>
                      </div>
                      <FloatingInput id="confirmPassword" label="Confirm password" type={showConfirm ? "text" : "password"} registration={reg2("confirmPassword")} error={errors2.confirmPassword?.message} isValid={dirty2.confirmPassword && !errors2.confirmPassword} value={s2.confirmPassword} rightSlot={<button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} className="ml-1 transition-opacity" style={{ color: "rgba(242,237,230,0.30)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(242,237,230,0.70)")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(242,237,230,0.30)")}>{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer select-none" htmlFor="acceptTerms">
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input id="acceptTerms" type="checkbox" {...reg2("acceptTerms")} className="sr-only" />
                            <motion.div whileTap={{ scale: 0.82 }} className="w-4 h-4 rounded flex items-center justify-center border transition-colors duration-200" style={{ backgroundColor: acceptTermsChecked ? TOKENS.gold : "transparent", borderColor: acceptTermsChecked ? TOKENS.gold : "rgba(242,237,230,0.22)" }}>
                              <AnimatePresence>{acceptTermsChecked && <motion.span key="terms-check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}><Check size={10} color={TOKENS.pageBg} strokeWidth={3} /></motion.span>}</AnimatePresence>
                            </motion.div>
                          </div>
                          <span className="text-xs leading-relaxed" style={{ color: TOKENS.textMuted }}>I agree to the <a href="/terms" className="underline underline-offset-1 transition-colors" style={{ color: "rgba(200,169,126,0.75)" }} onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,169,126,0.75)")}>Terms of Service</a> and <a href="/privacy" className="underline underline-offset-1 transition-colors" style={{ color: "rgba(200,169,126,0.75)" }} onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.gold)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,169,126,0.75)")}>Privacy Policy</a></span>
                        </label>
                        <AnimatePresence>{errors2.acceptTerms && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-1.5 text-xs pl-7" style={{ color: TOKENS.error }}>{errors2.acceptTerms.message}</motion.p>}</AnimatePresence>
                      </div>
                      <div className="flex gap-3">
                        <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => setStep(1)} className="py-3.5 px-4 rounded-xl text-sm border transition-colors duration-200" style={{ color: TOKENS.textMuted, borderColor: "rgba(242,237,230,0.14)" }} onMouseEnter={(e) => { e.currentTarget.style.color = TOKENS.textPrimary; e.currentTarget.style.borderColor = "rgba(242,237,230,0.28)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = TOKENS.textMuted; e.currentTarget.style.borderColor = "rgba(242,237,230,0.14)"; }}>Back</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="flex-1 py-3.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-60" style={{ backgroundColor: TOKENS.gold, color: TOKENS.pageBg }} onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = TOKENS.goldHover; }} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TOKENS.gold)}>
                          {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : "Create account"}
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}