/**
 * ============================================================
 *  Navbar.jsx — Premium Travel Booking Platform
 *  "voya" — curated travel for the discerning traveler
 * ============================================================
 *
 *  The third sibling of Signup.jsx and Login.jsx.
 *  Inherits the exact TOKENS, gold accent, and Antique Gold
 *  radar-dot logo from its siblings.
 *
 *  New capabilities:
 *   ✦ Scroll-aware transparency → backdrop-blur on scroll
 *   ✦ Dark / Light theme toggle (writes `dark` to <html>)
 *   ✦ Data-driven NAV_ITEMS — push new routes in one place
 *   ✦ Guest state: Sign In ghost + Request Invitation gold pill
 *   ✦ Member state: avatar + animated dropdown menu
 *   ✦ Mobile: right-side full-height drawer with AnimatePresence
 *
 *  Stack:
 *    • React 18 + JSX
 *    • Tailwind CSS (JIT, dark-mode: 'class')
 *    • Framer Motion
 *    • lucide-react
 *
 *  Tailwind config prerequisite (tailwind.config.js):
 *    module.exports = { darkMode: 'class', ... }
 *
 *  Install dependencies (shared with Signup / Login):
 *    npm install framer-motion lucide-react
 *
 *  Usage:
 *    import Navbar from "./Navbar";
 *    <Navbar isAuthenticated={false} />
 *    <Navbar isAuthenticated={true} memberName="Isabelle Fontaine" />
 * ============================================================
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Sun,
  Moon,
  ChevronDown,
  Map,
  Bookmark,
  HeadphonesIcon,
  LogOut,
  X,
  Menu,
  Sparkles,
  BookOpen,
  Home,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS  ← identical palette to Signup.jsx / Login.jsx
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dark-mode values mirror Signup.jsx / Login.jsx exactly.
 * Light-mode values are new — warm cream/parchment, never clinical white.
 */
const TOKENS = {
  // ── Shared (mode-independent) ──────────────────────────────────────────
  gold:        "#C8A97E",   // Antique Gold — the brand constant
  goldHover:   "#D9BC96",
  goldMuted:   "rgba(200,169,126,0.65)",

  // ── Dark mode (matches Signup.jsx) ────────────────────────────────────
  dark: {
    bg:          "#0C0E14",
    bgElevated:  "#141720",
    border:      "rgba(242,237,230,0.08)",
    borderFocus: "rgba(200,169,126,0.28)",
    text:        "#F2EDE6",
    textMuted:   "rgba(242,237,230,0.42)",
    textFaint:   "rgba(242,237,230,0.22)",
    overlay:     "rgba(12,14,20,0.88)",
    surface:     "rgba(255,255,255,0.05)",
    surfaceHover:"rgba(255,255,255,0.08)",
  },

  // ── Light mode — warm parchment, not clinical white ────────────────────
  light: {
    bg:          "#FAF8F4",   // warm off-white / parchment
    bgElevated:  "#FFFFFF",
    border:      "rgba(26,23,18,0.10)",
    borderFocus: "rgba(200,169,126,0.45)",
    text:        "#1A1712",   // rich charcoal
    textMuted:   "rgba(26,23,18,0.50)",
    textFaint:   "rgba(26,23,18,0.28)",
    overlay:     "rgba(250,248,244,0.92)",
    surface:     "rgba(26,23,18,0.04)",
    surfaceHover:"rgba(26,23,18,0.07)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATA  ← edit NAV_ITEMS to add / reorder routes; no JSX changes needed
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Central route registry.
 * Each item describes one top-nav link and its mobile-drawer counterpart.
 *
 * @property {string}   label   — Display text
 * @property {string}   href    — Route path
 * @property {ReactNode} icon   — Lucide icon (used in mobile drawer only)
 */
const NAV_ITEMS = [
  { label: "Curated Villas",   href: "/villas",      icon: <Home      size={15} /> },
  { label: "Experiences",      href: "/experiences", icon: <Sparkles  size={15} /> },
  { label: "Journal",          href: "/journal",     icon: <BookOpen  size={15} /> },
];

/**
 * Member-only dropdown items.
 * badge: shows a small gold pill with a count next to the label.
 * accent: renders the icon in gold (used for Voya Concierge premium item).
 * dividerBefore: inserts a separator line before this item.
 */
const MEMBER_MENU_ITEMS = [
  {
    label:   "My Itineraries",
    href:    "/itineraries",
    icon:    <Map      size={14} />,
    badge:   2,
  },
  {
    label:   "Saved Sanctuaries",
    href:    "/saved",
    icon:    <Bookmark size={14} />,
  },
  {
    label:   "Voya Concierge",
    href:    "/concierge",
    icon:    <HeadphonesIcon size={14} />,
    accent:  true,
  },
  {
    label:         "Sign out",
    href:          "/logout",
    icon:          <LogOut size={14} />,
    dividerBefore: true,
    danger:        true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HELPER — derive initials from a full name
// ─────────────────────────────────────────────────────────────────────────────

/** "Isabelle Fontaine" → "IF"  |  "Marcus" → "M" */
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// ─────────────────────────────────────────────────────────────────────────────
// 4. HELPER — useTheme hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads / writes the `dark` class on <html>.
 * Persists the preference to localStorage so it survives page reloads.
 * Respects the OS default on first visit.
 *
 * Returns: [isDark, toggleTheme]
 */
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // SSR guard
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("voya-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("voya-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("voya-theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);
  return [isDark, toggleTheme];
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. HELPER — useScrolled hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true once the user has scrolled past `threshold` pixels.
 * Drives the transparent → frosted-glass transition of the navbar.
 */
const useScrolled = (threshold = 12) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. HELPER — useClickOutside hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls `handler` whenever a click occurs outside the referenced element.
 * Used to close the profile dropdown when clicking elsewhere on the page.
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUB-COMPONENT — VoyaLogo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The brand wordmark: gold MapPin icon + "voya" logotype.
 * Identical to the logo used in Signup.jsx and Login.jsx left panels.
 * The MapPin subtly bobs upward on hover.
 *
 * @param {string} mode — "dark" | "light"
 */
const VoyaLogo = ({ mode }) => {
  const t = TOKENS[mode];
  return (
    <a
      href="/"
      className="flex items-center gap-2 select-none flex-shrink-0 group"
      aria-label="Voya — go to homepage"
    >
      {/* Icon container */}
      <motion.div
        whileHover={{ y: -1.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: TOKENS.gold }}
      >
        <MapPin size={13} color="#0C0E14" strokeWidth={2.5} />
      </motion.div>

      {/* Wordmark */}
      <span
        className="font-semibold uppercase text-xs tracking-widest"
        style={{ color: t.text, letterSpacing: "0.18em" }}
      >
        voya
      </span>
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. SUB-COMPONENT — NavLink
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single desktop nav link.
 * Shows a narrow animated gold underline pill when `isActive` is true.
 * On hover, the pill slides into view at reduced opacity.
 *
 * @param {string}  href     — Route path
 * @param {string}  label    — Display text
 * @param {boolean} isActive — Whether this route is currently active
 * @param {string}  mode     — "dark" | "light"
 */
const NavLink = ({ href, label, isActive, mode }) => {
  const t = TOKENS[mode];
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      className="relative flex flex-col items-center gap-0 py-1 text-sm font-medium"
      style={{
        color: isActive ? t.text : t.textMuted,
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = t.text;
        setHovered(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isActive ? t.text : t.textMuted;
        setHovered(false);
      }}
    >
      {label}

      {/* Active / hover indicator — a thin gold pill below the text */}
      <AnimatePresence>
        {(isActive || hovered) && (
          <motion.span
            key="indicator"
            layoutId="nav-indicator" // shared layoutId creates the sliding effect
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: isActive ? 1 : 0.4, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.4 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full"
            style={{ backgroundColor: TOKENS.gold }}
          />
        )}
      </AnimatePresence>
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. SUB-COMPONENT — ThemeToggle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A pill-shaped toggle housing an animated Sun/Moon icon.
 * The icon rotates 180° as it transitions between states, giving a
 * "spinning dial" feeling. The pill background transitions in color too.
 *
 * @param {boolean}  isDark       — Current theme state
 * @param {Function} onToggle     — Callback to flip the theme
 * @param {string}   mode         — "dark" | "light"
 */
const ThemeToggle = ({ isDark, onToggle, mode }) => {
  const t = TOKENS[mode];

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.90 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                 transition-colors duration-300 focus:outline-none"
      style={{
        backgroundColor: t.surface,
        border: `1px solid ${t.border}`,
        color: t.textMuted,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = t.surfaceHover;
        e.currentTarget.style.color = t.text;
        e.currentTarget.style.borderColor = t.borderFocus;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = t.surface;
        e.currentTarget.style.color = t.textMuted;
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      {/* AnimatePresence swaps Sun ↔ Moon with a rotate-and-fade */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate:   0, opacity: 1, scale: 1   }}
            exit={{    rotate:  90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon size={14} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate:  90, opacity: 0, scale: 0.7 }}
            animate={{ rotate:   0, opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun size={14} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. SUB-COMPONENT — GuestActions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shown when `isAuthenticated={false}`.
 * Two buttons:
 *   - "Sign In"            — ghost (transparent + border)
 *   - "Request Invitation" — filled gold pill, the primary CTA
 *
 * @param {string} mode — "dark" | "light"
 */
const GuestActions = ({ mode }) => {
  const t = TOKENS[mode];

  return (
    <div className="flex items-center gap-2.5">
      {/* Ghost: Sign In */}
      <motion.a
        href="/login"
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 rounded-xl text-xs font-medium transition-colors duration-200"
        style={{
          color:       t.textMuted,
          border:      `1px solid ${t.border}`,
          background:  "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color       = t.text;
          e.currentTarget.style.borderColor = t.borderFocus;
          e.currentTarget.style.background  = t.surface;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color       = t.textMuted;
          e.currentTarget.style.borderColor = t.border;
          e.currentTarget.style.background  = "transparent";
        }}
      >
        Sign in
      </motion.a>

      {/* Gold pill: Request Invitation */}
      <motion.a
        href="/signup"
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200"
        style={{ backgroundColor: TOKENS.gold, color: "#0C0E14" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = TOKENS.goldHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = TOKENS.gold)
        }
      >
        Request invitation
      </motion.a>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. SUB-COMPONENT — MemberDropdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The member profile dropdown shown when `isAuthenticated={true}`.
 *
 * Trigger: A circular avatar (initials-based) + a ChevronDown that
 * rotates 180° when the dropdown is open.
 *
 * Dropdown card: AnimatePresence fade + scale from the top-right corner.
 * Sits below the navbar via absolute positioning.
 *
 * @param {string} memberName — Full name, used for initials and greeting
 * @param {string} mode       — "dark" | "light"
 */
const MemberDropdown = ({ memberName, mode }) => {
  const t        = TOKENS[mode];
  const [open, setOpen] = useState(false);
  const wrapperRef      = useRef(null);
  const initials        = getInitials(memberName);

  // Close when clicking anywhere outside the dropdown wrapper
  useClickOutside(wrapperRef, () => setOpen(false));

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      {/* ── Avatar trigger button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1
                   transition-colors duration-200 focus:outline-none"
        style={{
          background:   open ? t.surfaceHover : "transparent",
          border:       `1px solid ${open ? t.borderFocus : "transparent"}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background   = t.surfaceHover;
          e.currentTarget.style.borderColor  = t.borderFocus;
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background  = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
        aria-label="Open member menu"
        aria-expanded={open}
      >
        {/* Avatar circle with gold ring on open */}
        <motion.div
          animate={{
            boxShadow: open
              ? `0 0 0 2px ${TOKENS.gold}`
              : "0 0 0 2px transparent",
          }}
          transition={{ duration: 0.2 }}
          className="w-7 h-7 rounded-full flex items-center justify-center
                     text-xs font-semibold flex-shrink-0"
          style={{
            background: "rgba(200,169,126,0.18)",
            color:      TOKENS.gold,
            border:     `1px solid rgba(200,169,126,0.30)`,
          }}
        >
          {initials}
        </motion.div>

        {/* ChevronDown — rotates 180° when open */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ color: t.textMuted, display: "flex", alignItems: "center" }}
        >
          <ChevronDown size={12} strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      {/* ── Floating dropdown card ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1.00, y:  0 }}
            exit={{    opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // Origin from top-right so it feels anchored to the trigger button
            style={{
              transformOrigin: "top right",
              position:        "absolute",
              top:             "calc(100% + 10px)",
              right:           0,
              width:           220,
              background:      t.bgElevated,
              border:          `1px solid ${t.border}`,
              borderRadius:    16,
              boxShadow:       mode === "dark"
                ? "0 16px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.30)"
                : "0 16px 48px rgba(26,23,18,0.12), 0 2px 8px rgba(26,23,18,0.06)",
              overflow:        "hidden",
              zIndex:          60,
            }}
          >
            {/* Greeting header */}
            <div
              className="px-4 pt-4 pb-3 border-b"
              style={{ borderColor: t.border }}
            >
              <p className="text-xs font-medium truncate" style={{ color: t.text }}>
                {memberName || "Member"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Pulsing radar dot — the brand micro-detail */}
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: TOKENS.gold }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: TOKENS.gold }}
                  />
                </span>
                <span className="text-xs" style={{ color: t.textMuted }}>
                  Active member
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {MEMBER_MENU_ITEMS.map((item, idx) => (
                <div key={idx}>
                  {/* Divider before Sign Out */}
                  {item.dividerBefore && (
                    <div
                      className="my-2 mx-4 h-px"
                      style={{ backgroundColor: t.border }}
                    />
                  )}

                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs
                               transition-colors duration-150 group"
                    style={{
                      color:      item.danger ? "#F06B6B"
                                : item.accent ? TOKENS.gold
                                : t.textMuted,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = t.surfaceHover;
                      if (!item.danger && !item.accent)
                        e.currentTarget.style.color = t.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = item.danger ? "#F06B6B"
                                                  : item.accent ? TOKENS.gold
                                                  : t.textMuted;
                    }}
                  >
                    {/* Icon */}
                    <span
                      style={{
                        color:      item.accent ? TOKENS.gold
                                  : item.danger ? "#F06B6B"
                                  : t.textFaint,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className="flex-1 font-medium">{item.label}</span>

                    {/* Badge (e.g. "2" for My Itineraries) */}
                    {item.badge != null && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(200,169,126,0.18)",
                          color:           TOKENS.gold,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Accent sparkle for Voya Concierge */}
                    {item.accent && (
                      <span style={{ color: TOKENS.goldMuted }}>
                        <Sparkles size={11} />
                      </span>
                    )}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. SUB-COMPONENT — MobileDrawer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full-height slide-in drawer for mobile viewports.
 * Slides in from the RIGHT (like a concierge's private side door).
 * A frosted-glass scrim covers the rest of the screen — tap to close.
 *
 * Drawer contains:
 *   - Voya logo at top
 *   - All NAV_ITEMS with icons
 *   - Divider
 *   - Member items (if authenticated) OR guest auth buttons
 *   - Theme toggle at the bottom
 *
 * @param {boolean}  isOpen           — Whether the drawer is visible
 * @param {Function} onClose          — Callback to close the drawer
 * @param {boolean}  isAuthenticated  — Controls which auth section to show
 * @param {string}   memberName       — Member's full name (authenticated only)
 * @param {boolean}  isDark           — Current theme
 * @param {Function} onToggleTheme    — Theme toggle callback
 * @param {string}   activePath       — Current route path for active link detection
 * @param {string}   mode             — "dark" | "light"
 */
const MobileDrawer = ({
  isOpen,
  onClose,
  isAuthenticated,
  memberName,
  isDark,
  onToggleTheme,
  activePath,
  mode,
}) => {
  const t        = TOKENS[mode];
  const initials = getInitials(memberName);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Frosted-glass scrim ── */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{
              background:  mode === "dark"
                ? "rgba(12,14,20,0.72)"
                : "rgba(26,23,18,0.38)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* ── Drawer panel — slides in from right ── */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: "0%"   }}
            exit={{    x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width:      "min(85vw, 320px)",
              background: t.bg,
              borderLeft: `1px solid ${t.border}`,
            }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: t.border }}
            >
              <VoyaLogo mode={mode} />

              {/* Close button */}
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full flex items-center justify-center
                           transition-colors duration-200 focus:outline-none"
                style={{
                  color:           t.textMuted,
                  backgroundColor: t.surface,
                  border:          `1px solid ${t.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = t.surfaceHover;
                  e.currentTarget.style.color = t.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = t.surface;
                  e.currentTarget.style.color = t.textMuted;
                }}
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto py-4 px-4">

              {/* Member greeting strip (authenticated only) */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
                  style={{ background: t.surface, border: `1px solid ${t.border}` }}
                >
                  {/* Mini avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center
                               text-xs font-semibold flex-shrink-0"
                    style={{
                      background:  "rgba(200,169,126,0.18)",
                      color:       TOKENS.gold,
                      border:      `1px solid rgba(200,169,126,0.30)`,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: t.text }}>
                      {memberName || "Member"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                          style={{ backgroundColor: TOKENS.gold }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-1.5 w-1.5"
                          style={{ backgroundColor: TOKENS.gold }}
                        />
                      </span>
                      <span className="text-xs" style={{ color: t.textMuted }}>
                        Active member
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation links */}
              <nav className="mb-2">
                <p
                  className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold mb-1"
                  style={{ color: t.textFaint, letterSpacing: "0.14em" }}
                >
                  Explore
                </p>
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activePath === item.href;
                  return (
                    <motion.a
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.05 }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm
                                 font-medium mb-0.5 transition-colors duration-150"
                      style={{
                        background: isActive ? t.surfaceHover : "transparent",
                        color:      isActive ? t.text : t.textMuted,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = t.surfaceHover;
                        e.currentTarget.style.color = t.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? t.surfaceHover : "transparent";
                        e.currentTarget.style.color = isActive ? t.text : t.textMuted;
                      }}
                    >
                      {/* Icon (always shown in mobile; hidden on desktop) */}
                      <span style={{ color: isActive ? TOKENS.gold : t.textFaint }}>
                        {item.icon}
                      </span>
                      {item.label}

                      {/* Active gold dot */}
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: TOKENS.gold }}
                        />
                      )}
                    </motion.a>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-3 my-3 h-px" style={{ backgroundColor: t.border }} />

              {/* Member links OR guest actions */}
              {isAuthenticated ? (
                <div>
                  <p
                    className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold mb-1"
                    style={{ color: t.textFaint, letterSpacing: "0.14em" }}
                  >
                    Account
                  </p>
                  {MEMBER_MENU_ITEMS.map((item, idx) => (
                    <div key={idx}>
                      {item.dividerBefore && (
                        <div className="mx-3 my-2 h-px" style={{ backgroundColor: t.border }} />
                      )}
                      <motion.a
                        href={item.href}
                        onClick={onClose}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + idx * 0.05 }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm
                                   font-medium mb-0.5 transition-colors duration-150"
                        style={{
                          color: item.danger ? "#F06B6B"
                               : item.accent ? TOKENS.gold
                               : t.textMuted,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = t.surfaceHover;
                          if (!item.danger && !item.accent)
                            e.currentTarget.style.color = t.text;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = item.danger ? "#F06B6B"
                                                      : item.accent ? TOKENS.gold
                                                      : t.textMuted;
                        }}
                      >
                        <span style={{ color: item.accent ? TOKENS.gold : item.danger ? "#F06B6B" : t.textFaint }}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge != null && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(200,169,126,0.18)", color: TOKENS.gold }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.accent && (
                          <span style={{ color: TOKENS.goldMuted }}>
                            <Sparkles size={11} />
                          </span>
                        )}
                      </motion.a>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="px-1 space-y-2"
                >
                  <a
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center w-full py-3 rounded-xl
                               text-sm font-medium border transition-colors duration-200"
                    style={{ color: t.textMuted, borderColor: t.border }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = t.text;
                      e.currentTarget.style.borderColor = t.borderFocus;
                      e.currentTarget.style.background = t.surface;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = t.textMuted;
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Sign in
                  </a>
                  <a
                    href="/signup"
                    onClick={onClose}
                    className="flex items-center justify-center w-full py-3 rounded-xl
                               text-sm font-semibold transition-colors duration-200"
                    style={{ backgroundColor: TOKENS.gold, color: "#0C0E14" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = TOKENS.goldHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = TOKENS.gold)
                    }
                  >
                    Request invitation
                  </a>
                </motion.div>
              )}
            </div>

            {/* ── Footer: theme toggle ── */}
            <div
              className="px-6 py-5 flex-shrink-0 border-t"
              style={{ borderColor: t.border }}
            >
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                           text-xs font-medium transition-colors duration-200"
                style={{ color: t.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = t.surfaceHover;
                  e.currentTarget.style.color = t.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = t.textMuted;
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: t.surface, border: `1px solid ${t.border}` }}
                >
                  {isDark ? <Moon size={13} /> : <Sun size={13} />}
                </span>
                {isDark ? "Switch to light mode" : "Switch to dark mode"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. MAIN COMPONENT — Navbar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The primary navigation bar for the Voya platform.
 *
 * Props:
 *  @param {boolean} [isAuthenticated=false] — Guest vs member UI
 *  @param {string}  [memberName=""]         — Full name for avatar initials + greeting
 *  @param {string}  [activePath=""]         — Current route path for active link states
 *
 * Internal state:
 *  - isDark      bool   — Theme (synced to <html class="dark"> via useTheme hook)
 *  - scrolled    bool   — True after 12px scroll (triggers backdrop-blur)
 *  - drawerOpen  bool   — Mobile drawer visibility
 */
export default function Navbar({
  isAuthenticated = false,
  memberName = "Isabelle Fontaine",
  activePath = "/villas",
}) {
  const [isDark, toggleTheme] = useTheme();
  const scrolled              = useScrolled(12);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // "dark" | "light" shorthand — used throughout to pick from TOKENS
  const mode = isDark ? "dark" : "light";
  const t    = TOKENS[mode];

  return (
    <>
      {/* ── The bar itself ── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50"
        style={{
          // Transparent until scrolled; then frosted glass kicks in
          backgroundColor: scrolled ? t.overlay : "transparent",
          backdropFilter:  scrolled ? "blur(16px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(160%)" : "none",
          borderBottom:    scrolled ? `1px solid ${t.border}` : "1px solid transparent",
          transition:      "background-color 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12"
          style={{ height: 64, maxWidth: 1200 }}
        >
          {/* ── Left: Logo ── */}
          <VoyaLogo mode={mode} />

          {/* ── Center: Desktop nav links (hidden on mobile) ── */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={activePath === item.href}
                mode={mode}
              />
            ))}
          </nav>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2.5">

            {/* Theme toggle — always visible */}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} mode={mode} />

            {/* Guest / Member auth area — hidden on mobile (drawer handles it) */}
            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <MemberDropdown memberName={memberName} mode={mode} />
              ) : (
                <GuestActions mode={mode} />
              )}
            </div>

            {/* Hamburger — mobile only */}
            <motion.button
              onClick={() => setDrawerOpen(true)}
              whileTap={{ scale: 0.90 }}
              aria-label="Open navigation menu"
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center
                         transition-colors duration-200 focus:outline-none"
              style={{
                color:           t.textMuted,
                backgroundColor: t.surface,
                border:          `1px solid ${t.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = t.surfaceHover;
                e.currentTarget.style.color = t.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = t.surface;
                e.currentTarget.style.color = t.textMuted;
              }}
            >
              <Menu size={15} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer (rendered outside the nav for correct stacking) ── */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        memberName={memberName}
        isDark={isDark}
        onToggleTheme={() => {
          toggleTheme();
          // Keep drawer open — the theme change is visible immediately
        }}
        activePath={activePath}
        mode={mode}
      />
    </>
  );
}
