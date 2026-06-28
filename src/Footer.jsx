/**
 * ============================================================
 * Footer.jsx — Premium Travel Booking Platform
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BULLETPROOF SOCIAL ICONS (Bypasses Vite Cache Issues)
// ─────────────────────────────────────────────────────────────────────────────
const InstagramIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const TwitterIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const LinkedinIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATA  ← The only place you need to touch to add / remove content
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_COLUMNS = [
  {
    title: "Sanctuaries",
    links: [
      { label: "Curated Havelis",       href: "/havelis"            },
      { label: "Private Villas",         href: "/villas"             },
      { label: "Forest Lodges",          href: "/forest-lodges"      },
      { label: "Backwater Retreats",     href: "/backwater-retreats" },
      { label: "Himalayan Camps",        href: "/himalayan-camps"    },
    ],
  },
  {
    title: "The Guild",
    links: [
      { label: "About Voya",            href: "/about"     },
      { label: "The Journal",           href: "/journal"   },
      { label: "Private Concierge",     href: "/concierge" },
      { label: "Bespoke Requests",      href: "/bespoke"   },
      { label: "Press",                 href: "/press"     },
    ],
  },
  {
    title: "Legal & Ethics",
    links: [
      { label: "Privacy Protocol",      href: "/privacy"      },
      { label: "Terms of Service",      href: "/terms"        },
      { label: "Guest Security",        href: "/security"     },
      { label: "Cancellation Charter",  href: "/cancellation" },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: TwitterIcon,   label: "Twitter / X", href: "https://twitter.com"  },
  { icon: LinkedinIcon,  label: "LinkedIn",   href: "https://linkedin.com" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. DESIGN CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GOLD        = "#C8A97E";
const GOLD_HOVER  = "#D6BC96";
const GOLD_SUBTLE = "rgba(200,169,126,0.10)";
const GOLD_RING   = "rgba(200,169,126,0.28)";

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren:  0.09,
      delayChildren:    0.05,
    },
  },
};

const columnVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUB-COMPONENT — RegistryStrip
// ─────────────────────────────────────────────────────────────────────────────

const RegistryStrip = () => {
  const [email,      setEmail]      = useState("");
  const [status,     setStatus]     = useState("idle");    
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setStatus("loading");

    await new Promise((resolve) => setTimeout(resolve, 1400));
    setStatus("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div
        className="relative overflow-hidden rounded-2xl
                   dark:border dark:border-white/[0.07]
                   border border-black/[0.07]
                   dark:bg-[#141720] bg-white"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(200,169,126,0.07) 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12 p-8 lg:p-10">

          <div className="flex-1 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: GOLD }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: GOLD }}
                />
              </span>
              <span
                className="text-[10px] font-semibold uppercase dark:text-white/32 text-black/38"
                style={{ letterSpacing: "0.16em" }}
              >
                Exclusive dispatches
              </span>
            </div>

            <h2
              className="text-xl lg:text-2xl font-semibold leading-snug
                         dark:text-[#F2EDE6] text-[#1A1712] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Join the Private Registry
            </h2>

            <p className="text-sm leading-relaxed dark:text-white/42 text-black/50 max-w-sm">
              Curated dispatches on slow travel and undiscovered Indian estates.
              Sent once a lunar cycle.
            </p>
          </div>

          <div className="w-full lg:max-w-sm flex-shrink-0">
            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  exit={{    opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                  className="flex items-center gap-3 py-3.5"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
                  >
                    <CheckCircle2 size={20} style={{ color: GOLD }} />
                  </motion.span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: GOLD }}
                  >
                    You have been added to the registry.
                  </span>
                </motion.div>
              )}

              {status !== "success" && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: 4 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div
                    className="flex items-center rounded-xl overflow-hidden
                               dark:bg-[#0C0E14] bg-[#FAF8F4]
                               dark:border dark:border-white/[0.10]
                               border border-black/[0.09]
                               focus-within:ring-1"
                    style={{ "--tw-ring-color": GOLD_RING }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="Your email address"
                      aria-label="Email address for registry"
                      className="flex-1 min-w-0 bg-transparent px-4 py-3.5 text-sm
                                 focus:outline-none
                                 dark:text-[#F2EDE6] text-[#1A1712]
                                 dark:placeholder-white/24 placeholder-black/28"
                    />

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.95 }}
                      disabled={status === "loading"}
                      className="flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold
                                 flex-shrink-0 transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: GOLD, color: "#0C0E14" }}
                      onMouseEnter={(e) => {
                        if (status !== "loading")
                          e.currentTarget.style.backgroundColor = GOLD_HOVER;
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = GOLD)
                      }
                    >
                      {status === "loading" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          Join
                          <ArrowRight size={12} strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        key="email-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{    opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="mt-1.5 text-xs"
                        style={{ color: "#F06B6B" }}
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="mt-2 text-[11px] dark:text-white/22 text-black/30">
                    No algorithms. No advertising. Unsubscribe at any time.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUB-COMPONENT — BrandAnchor
// ─────────────────────────────────────────────────────────────────────────────

const BrandAnchor = () => (
  <div className="flex flex-col gap-5">
    <a
      href="/"
      className="flex items-center gap-2 w-fit select-none group"
      aria-label="Voya — return to homepage"
    >
      <motion.div
        whileHover={{ y: -1.5 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: GOLD }}
      >
        <MapPin size={14} color="#0C0E14" strokeWidth={2.5} />
      </motion.div>

      <span
        className="font-semibold text-xs uppercase tracking-widest
                   dark:text-[#F2EDE6] text-[#1A1712]
                   group-hover:text-[#C8A97E] dark:group-hover:text-[#C8A97E]
                   transition-colors duration-200"
        style={{ letterSpacing: "0.20em", fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        voya
      </span>
    </a>

    <p
      className="text-sm leading-[1.75] dark:text-white/38 text-black/45 max-w-[240px]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      Voya exists for the traveller who knows that the finest journeys leave
      no trace on an itinerary. We hold a private collection of India's most
      extraordinary estates and wilderness sanctuaries — each chosen for its
      capacity to surprise. Every property carries a story; our concierge
      exists only to help you become part of it.
    </p>

    <div
      className="h-px w-10 rounded-full"
      style={{ backgroundColor: GOLD_RING }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. SUB-COMPONENT — FooterColumn
// ─────────────────────────────────────────────────────────────────────────────

const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col gap-4">
    <h3
      className="text-[11px] font-semibold uppercase tracking-widest
                 dark:text-white/35 text-black/40"
      style={{ letterSpacing: "0.14em", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {title}
    </h3>

    <ul className="flex flex-col gap-3">
      {links.map((link) => (
        <li key={link.label}>
          <motion.a
            href={link.href}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="inline-block text-sm
                       dark:text-white/42 text-black/48
                       hover:text-[#C8A97E] dark:hover:text-[#C8A97E]
                       transition-colors duration-200"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {link.label}
          </motion.a>
        </li>
      ))}
    </ul>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUB-COMPONENT — BottomBar
// ─────────────────────────────────────────────────────────────────────────────

const BottomBar = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="pt-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-0
                 dark:border-t dark:border-white/[0.07]
                 border-t border-black/[0.07]"
    >
      <p
        className="text-xs dark:text-white/25 text-black/32 sm:flex-1"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        © 2026 Voya Hospitality Pvt. Ltd. All rights reserved.
      </p>

      <div className="flex items-center gap-2 sm:flex-1 sm:justify-center">
        {SOCIALS.map(({ icon: Icon, label, href }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            whileHover={{ scale: 1.14, y: -2 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       dark:bg-white/[0.05] bg-black/[0.05]
                       dark:text-white/32 text-black/32
                       hover:text-[#C8A97E] dark:hover:text-[#C8A97E]
                       transition-colors duration-200
                       focus:outline-none focus-visible:ring-1"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1px ${GOLD_RING}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <Icon size={13} strokeWidth={1.8} />
          </motion.a>
        ))}
      </div>

      <div className="sm:flex-1 sm:flex sm:justify-end">
        <motion.button
          onClick={handleScrollTop}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Scroll back to top"
          className="flex items-center gap-1.5 text-xs font-medium
                     dark:text-white/32 text-black/38
                     hover:text-[#C8A97E] dark:hover:text-[#C8A97E]
                     transition-colors duration-200 focus:outline-none w-fit"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <motion.span
            whileHover={{ y: -1.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="flex items-center justify-center w-6 h-6 rounded-full
                       dark:bg-white/[0.05] bg-black/[0.05]"
          >
            <ArrowUp size={12} strokeWidth={2.2} />
          </motion.span>
          Back to top
        </motion.button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. MAIN COMPONENT — Footer
// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
  useEffect(() => {
    if (!document.getElementById("voya-gfonts")) {
      const link = document.createElement("link");
      link.id   = "voya-gfonts";
      link.rel  = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <footer
      className="dark:bg-[#0C0E14] bg-[#FAF8F4]
                 dark:border-t dark:border-white/[0.07]
                 border-t border-black/[0.06]
                 transition-colors duration-300"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 lg:py-20 space-y-14 lg:space-y-16">
        <RegistryStrip />

        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 xl:gap-12"
        >
          <motion.div variants={columnVariants}>
            <BrandAnchor />
          </motion.div>

          {FOOTER_COLUMNS.map((col) => (
            <motion.div key={col.title} variants={columnVariants}>
              <FooterColumn title={col.title} links={col.links} />
            </motion.div>
          ))}
        </motion.div>

        <BottomBar />
      </div>
    </footer>
  );
}