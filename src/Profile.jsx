/**
 * ============================================================
 * Profile.jsx — User Account & Profile Management
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 *
 * A member's private portal. View, edit, and manage account
 * details in a single, animated card experience.
 *
 * Features:
 * ✦ AnimatePresence crossfade between View and Edit modes
 * ✦ Live name mirror: card header updates as you type
 * ✦ Floating label inputs (exact Voya DS pattern)
 * ✦ Axios PUT → /api/user/update  (withCredentials: true)
 * ✦ Loading / success / error states on save
 * ✦ "Profile updated" banner on return to View mode
 * ✦ Role badge: Traveler (indigo) / Creator (gold)
 * ✦ Full dark / light mode via Tailwind dark: classes
 *
 * Props:
 * @param {object}    userProfile       — { firstname, lastname, email, role }
 * @param {Function}  onLogout          — Called when user clicks "Sign out"
 * @param {Function}  [onProfileUpdate] — Optional: called with updated profile on save
 *
 * Dependencies: axios, framer-motion, lucide-react
 * ============================================================
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  User,
  Mail,
  Shield,
  Edit2,
  LogOut,
  Check,
  Loader2,
  X,
  AlertCircle,
  MapPin,
  Lock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DESIGN CONSTANTS
//    Kept as JS values for inline styles where Tailwind dark: can't reach
//    (boxShadow on motion elements, gradient stops, dynamic borders).
// ─────────────────────────────────────────────────────────────────────────────

const GOLD        = "#C8A97E";
const GOLD_HOVER  = "#D9BC96";
const GOLD_SUBTLE = "rgba(200,169,126,0.12)";
const GOLD_RING   = "rgba(200,169,126,0.28)";
const GOLD_MUTED  = "rgba(200,169,126,0.65)";

const SUCCESS     = "#4CAF82";
const ERROR       = "#F06B6B";

// Role appearance config — extend with new roles without touching JSX
const ROLE_CONFIG = {
  traveler: {
    label:  "Traveler",
    Icon:   User,
    bg:     "rgba(99,139,176,0.12)",
    border: "rgba(99,139,176,0.22)",
    color:  "rgba(130,170,210,0.90)",
  },
  creator: {
    label:  "Creator",
    Icon:   Sparkles,
    bg:     GOLD_SUBTLE,
    border: GOLD_RING,
    color:  GOLD,
  },
};

// Mock stats shown in View mode — replace with real API data in production
const MOCK_STATS = [
  { label: "Trips Planned",     value: "4"   },
  { label: "Sanctuaries Saved", value: "12"  },
  { label: "Nights Booked",     value: "31"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Page-level entrance — drifts up 20px and fades in */
const pageVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/**
 * Card content — used by both ViewMode and EditMode.
 * Exit: slides up and fades out. Enter: arrives from slightly below.
 * This "page flip" motion feels natural for a toggle between two states.
 */
const cardContentVariants = {
  enter: { opacity: 0, y: 10, scale: 0.99 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { duration: 0.24, ease: "easeIn" },
  },
};

/** Update banner — slides down from above */
const bannerVariants = {
  hidden:  { opacity: 0, y: -10, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -6,
    height: 0,
    transition: { duration: 0.22 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUB-COMPONENT — FloatingField
//    Controlled text input with Framer Motion floating label.
//    Identical pattern to Signup.jsx and Login.jsx — consistent across the DS.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string}    label      — Label text that floats above when active
 * @param {string}    name       — HTML name / id pairing
 * @param {string}    value      — Controlled value
 * @param {Function}  onChange   — (e) => void
 * @param {string}    [error]    — Validation error message
 * @param {boolean}   [autoFocus]
 */
const FloatingField = ({ label, name, value, onChange, error, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || Boolean(value);

  return (
    <div className="relative w-full">
      {/* Animated bottom border */}
      <div
        className="relative pb-1.5"
        style={{
          borderBottom: `1px solid ${
            error   ? ERROR
          : focused ? GOLD
          :           "rgba(200,169,126,0.16)"
          }`,
          transition: "border-color 0.25s",
        }}
      >
        {/* Floating label */}
        <motion.label
          htmlFor={name}
          animate={{
            y:     isFloating ? -20 : 0,
            scale: isFloating ? 0.80 : 1,
            color: error   ? ERROR
                 : focused ? GOLD
                 :           "rgba(242,237,230,0.36)",
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 top-3 text-sm pointer-events-none origin-left select-none"
          style={{ transformOrigin: "left center" }}
        >
          {label}
        </motion.label>

        {/* Input */}
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          autoFocus={autoFocus}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          autoComplete="off"
          className="w-full bg-transparent pt-5 pb-0.5 text-sm focus:outline-none
                     dark:text-[#F2EDE6] text-[#1A1712]"
        />
      </div>

      {/* Inline error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="field-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="mt-1.5 text-xs"
            style={{ color: ERROR }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUB-COMPONENT — ReadOnlyField
//    Displays a non-editable field (email) with a visual lock indicator.
//    Styled as a contained block rather than a disabled input, which avoids
//    browser-native disabled styling inconsistencies.
// ─────────────────────────────────────────────────────────────────────────────

const ReadOnlyField = ({ label, value, icon: Icon }) => (
  <div
    className="flex items-center gap-3 px-4 py-3.5 rounded-xl
               dark:bg-[#0C0E14]/60 bg-[#FAF8F4]
               dark:border dark:border-white/[0.06]
               border border-black/[0.06]"
  >
    {Icon && (
      <Icon
        size={14}
        strokeWidth={1.8}
        className="flex-shrink-0"
        style={{ color: GOLD_MUTED }}
      />
    )}
    <div className="flex-1 min-w-0">
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5
                   dark:text-white/28 text-black/32"
        style={{ letterSpacing: "0.12em" }}
      >
        {label}
      </p>
      <p className="text-sm truncate dark:text-white/55 text-black/55">{value}</p>
    </div>
    <Lock
      size={11}
      className="flex-shrink-0 dark:text-white/18 text-black/20"
      strokeWidth={1.8}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUB-COMPONENT — RoleBadge
//    Renders the account-type pill. Visually distinct per role.
// ─────────────────────────────────────────────────────────────────────────────

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role?.toLowerCase()] ?? ROLE_CONFIG.traveler;
  const { label, Icon, bg, border, color } = config;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 text-[11px] font-semibold border"
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      <Icon size={10} strokeWidth={2} />
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SUB-COMPONENT — ProfileAvatar
//    Large initials circle — consistent with the pattern used across Navbar,
//    Login, and MemberDropdown.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} name  — Full display name (used to derive initials)
 * @param {number} [size=64] — Diameter in pixels
 */
const ProfileAvatar = ({ name = "", size = 64 }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className="rounded-full flex items-center justify-center
                 font-semibold flex-shrink-0 select-none border-2"
      style={{
        width:           size,
        height:          size,
        fontSize:        size * 0.3,
        backgroundColor: GOLD_SUBTLE,
        borderColor:     GOLD_RING,
        color:           GOLD,
        boxShadow:       `0 0 0 4px rgba(200,169,126,0.08)`,
        fontFamily:      "'Playfair Display', Georgia, serif",
      }}
    >
      {initials || <User size={size * 0.38} strokeWidth={1.8} />}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUB-COMPONENT — ViewMode
//    The read-only profile display. Shows all details + action buttons.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object}    profile      — Current profile data
 * @param {Function}  onStartEdit  — Opens edit mode
 * @param {Function}  onLogout     — Triggers logout
 */
const ViewMode = ({ profile, onStartEdit, onLogout }) => {
  const fullName = [profile.firstname, profile.lastname].filter(Boolean).join(" ");

  return (
    <motion.div
      key="view-mode"
      variants={cardContentVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {/* ── Profile identity block ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
        <ProfileAvatar name={fullName} size={68} />

        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Full name */}
          <h2
            className="text-2xl font-semibold leading-tight
                       dark:text-[#F2EDE6] text-[#1A1712]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {fullName || "Voya Member"}
          </h2>

          {/* Email row */}
          <div className="flex items-center gap-1.5">
            <Mail
              size={12}
              strokeWidth={1.8}
              style={{ color: GOLD_MUTED }}
              className="flex-shrink-0"
            />
            <span className="text-sm truncate dark:text-white/45 text-black/50">
              {profile.email}
            </span>
          </div>

          {/* Role badge */}
          <div className="mt-0.5">
            <RoleBadge role={profile.role} />
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        className="grid grid-cols-3 gap-3 mb-8 py-5 rounded-xl
                   dark:bg-[#0C0E14]/40 bg-[#FAF8F4]
                   dark:border dark:border-white/[0.05]
                   border border-black/[0.05]"
      >
        {MOCK_STATS.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center px-2">
            <span
              className="text-xl font-semibold"
              style={{
                color:      GOLD,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {value}
            </span>
            <span className="text-[11px] dark:text-white/30 text-black/38 leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Account details ── */}
      <div className="space-y-2.5 mb-8">
        {/* Account type detail row */}
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-xl
                     dark:bg-[#0C0E14]/40 bg-[#FAF8F4]
                     dark:border dark:border-white/[0.05]
                     border border-black/[0.05]"
        >
          <div className="flex items-center gap-2.5">
            <Shield
              size={14}
              strokeWidth={1.8}
              className="flex-shrink-0"
              style={{ color: GOLD_MUTED }}
            />
            <span className="text-xs dark:text-white/40 text-black/45">Account type</span>
          </div>
          <RoleBadge role={profile.role} />
        </div>

        {/* Email detail row */}
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-xl
                     dark:bg-[#0C0E14]/40 bg-[#FAF8F4]
                     dark:border dark:border-white/[0.05]
                     border border-black/[0.05]"
        >
          <div className="flex items-center gap-2.5">
            <Mail
              size={14}
              strokeWidth={1.8}
              className="flex-shrink-0"
              style={{ color: GOLD_MUTED }}
            />
            <span className="text-xs dark:text-white/40 text-black/45">Email address</span>
          </div>
          <span className="text-sm dark:text-white/60 text-black/60 truncate max-w-[180px]">
            {profile.email}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px w-full dark:bg-white/[0.07] bg-black/[0.06] mb-6" />

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Edit profile — primary gold button */}
        <motion.button
          onClick={onStartEdit}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2
                     py-3 rounded-xl text-sm font-semibold
                     transition-colors duration-200"
          style={{ backgroundColor: GOLD, color: "#0C0E14" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = GOLD_HOVER)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = GOLD)
          }
        >
          <Edit2 size={14} strokeWidth={2} />
          Edit profile
        </motion.button>

        {/* Sign out — ghost button with red hover */}
        <motion.button
          onClick={onLogout}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2
                     px-5 py-3 rounded-xl text-sm font-medium border
                     transition-colors duration-200
                     dark:border-white/[0.08] dark:text-white/45
                     border-black/[0.08] text-black/45"
          onMouseEnter={(e) => {
            e.currentTarget.style.color       = ERROR;
            e.currentTarget.style.borderColor = "rgba(240,107,107,0.30)";
            e.currentTarget.style.backgroundColor = "rgba(240,107,107,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color           = "";
            e.currentTarget.style.borderColor     = "";
            e.currentTarget.style.backgroundColor = "";
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          Sign out
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. SUB-COMPONENT — EditMode
//    The edit form. Owns its own form state, validation, and Axios call.
//    Reports upward only through onSaved(updatedData) and onCancel().
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object}    profile   — Current profile (pre-populates inputs)
 * @param {Function}  onCancel  — Discards changes, returns to View mode
 * @param {Function}  onSaved   — Called with { firstname, lastname } on success
 */
const EditMode = ({ profile, onCancel, onSaved }) => {
  const [formData, setFormData] = useState({
    firstname: profile.firstname ?? "",
    lastname:  profile.lastname  ?? "",
  });

  // "idle" | "loading" | "success" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError,  setSaveError]  = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the per-field error as the user types
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (saveError)         setSaveError("");
  }, [fieldErrors, saveError]);

  const validate = () => {
    const errs = {};
    if (!formData.firstname.trim()) errs.firstname = "First name is required";
    if (!formData.lastname.trim())  errs.lastname  = "Last name is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSaveError("");
    setSaveStatus("loading");

    try {
      // ↓ Replace the URL with your real endpoint; keep withCredentials for JWT auth
      await axios.put(
        "https://voya-backend-cmoy.onrender.com/api/user/update",
        {
          firstname: formData.firstname.trim(),
          lastname:  formData.lastname.trim(),
        },
        { withCredentials: true }
      );

      setSaveStatus("success");

      // Brief success flash, then close edit mode and surface the banner
      setTimeout(() => {
        onSaved({
          firstname: formData.firstname.trim(),
          lastname:  formData.lastname.trim(),
        });
      }, 1000);

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Could not save changes. Please try again.";
      setSaveError(msg);
      setSaveStatus("error");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      key="edit-mode"
      variants={cardContentVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {/* Section heading */}
      <div className="mb-7">
        <h3
          className="text-lg font-semibold dark:text-[#F2EDE6] text-[#1A1712]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Edit your profile
        </h3>
        <p className="text-sm dark:text-white/38 text-black/42 mt-1">
          Changes apply to your account immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Form fields ── */}
        <div className="space-y-8 mb-8">

          {/* First name */}
          <FloatingField
            label="First name"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            error={fieldErrors.firstname}
            autoFocus
          />

          {/* Last name */}
          <FloatingField
            label="Last name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            error={fieldErrors.lastname}
          />

          {/* Email — read-only, security notice */}
          <ReadOnlyField
            label="Email address (read-only)"
            value={profile.email}
            icon={Mail}
          />
        </div>

        {/* ── API error banner ── */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              key="api-error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0,  height: "auto" }}
              exit={{    opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.22 }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6 overflow-hidden"
              style={{
                background:   "rgba(240,107,107,0.10)",
                border:       "1px solid rgba(240,107,107,0.25)",
              }}
            >
              <AlertCircle
                size={14}
                className="flex-shrink-0 mt-0.5"
                style={{ color: ERROR }}
              />
              <p className="text-xs leading-relaxed" style={{ color: ERROR }}>
                {saveError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Divider ── */}
        <div className="h-px w-full dark:bg-white/[0.07] bg-black/[0.06] mb-6" />

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-3">
          {/* Cancel */}
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.97 }}
            disabled={saveStatus === "loading" || saveStatus === "success"}
            className="px-5 py-3 rounded-xl text-sm font-medium border
                       transition-colors duration-200
                       dark:border-white/[0.08] dark:text-white/42
                       border-black/[0.08] text-black/42
                       dark:hover:border-white/16 dark:hover:text-white/68
                       hover:border-black/15 hover:text-black/65
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </motion.button>

          {/* Save — transitions through loading → success states */}
          <AnimatePresence mode="wait">
            {saveStatus !== "success" ? (
              <motion.button
                key="save-btn"
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={saveStatus === "loading"}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold
                           flex items-center justify-center gap-2
                           transition-colors duration-200
                           disabled:opacity-65 disabled:cursor-not-allowed"
                style={{ backgroundColor: GOLD, color: "#0C0E14" }}
                onMouseEnter={(e) => {
                  if (saveStatus !== "loading")
                    e.currentTarget.style.backgroundColor = GOLD_HOVER;
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = GOLD)
                }
              >
                {saveStatus === "loading" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </motion.button>
            ) : (
              // Saved success state — replaces the button briefly
              <motion.div
                key="saved-confirm"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold
                           flex items-center justify-center gap-2 border"
                style={{
                  backgroundColor: "rgba(76,175,130,0.10)",
                  borderColor:     "rgba(76,175,130,0.28)",
                  color:           SUCCESS,
                }}
              >
                <Check size={14} strokeWidth={2.5} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. MAIN COMPONENT — Profile
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The complete profile page.
 *
 * Internal state:
 * - localProfile     — mutable copy of userProfile; updated after a successful save
 * - isEditing        — toggles between ViewMode and EditMode
 * - showUpdateBanner — flashes a "Profile updated" confirmation on return to View
 *
 * The live-name pattern:
 * The card header (avatar + name) always reflects the CURRENT localProfile.
 * In edit mode the name displayed hasn't changed yet — it only updates once the
 * user saves. This is intentional: the displayed name is authoritative, not a
 * preview of unsaved input.
 */
export default function Profile({
  userProfile = {},
  onLogout,
  onProfileUpdate,
}) {
  // ── Derive a mutable local copy so saves update the UI immediately ─────────
  const [localProfile,    setLocalProfile]    = useState(userProfile);
  const [isEditing,       setIsEditing]       = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Sync if the prop changes externally (e.g. after a route-level refetch)
  useEffect(() => {
    setLocalProfile(userProfile);
  }, [userProfile]);

  // ── Inject Google Fonts (idempotent) ──────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaved = useCallback((updatedFields) => {
    const updated = { ...localProfile, ...updatedFields };
    setLocalProfile(updated);
    setIsEditing(false);
    setShowUpdateBanner(true);
    onProfileUpdate?.(updated);

    // Auto-hide the banner after 3s
    setTimeout(() => setShowUpdateBanner(false), 3000);
  }, [localProfile, onProfileUpdate]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const fullName = [localProfile.firstname, localProfile.lastname]
    .filter(Boolean)
    .join(" ");

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen dark:bg-[#0C0E14] bg-[#FAF8F4] transition-colors duration-300
                 py-10 lg:py-16"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-2xl px-5 sm:px-8 space-y-8">

        {/* ══════════════════════════════════════════════════════════════
            PAGE HEADER — greeting + breadcrumb
        ══════════════════════════════════════════════════════════════ */}
        <div>
          {/* ── BACK BUTTON ── */}
          <a 
            href="/home" 
            className="inline-flex items-center gap-2 text-sm font-medium dark:text-white/45 text-black/45 hover:text-black/80 dark:hover:text-white/80 transition-colors mb-8"
          >
            <ArrowLeft size={14} strokeWidth={2} /> Return to Discovery
          </a>

          {/* Eyebrow with radar dot */}
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
              className="text-[10px] font-semibold uppercase dark:text-white/30 text-black/38"
              style={{ letterSpacing: "0.16em" }}
            >
              Your account
            </span>
          </div>

          {/* Greeting */}
          <h1
            className="text-3xl lg:text-4xl font-semibold leading-tight
                       dark:text-[#F2EDE6] text-[#1A1712]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {fullName ? `Welcome back, ${localProfile.firstname}.` : "Welcome back."}
          </h1>

          <p className="mt-2 text-sm dark:text-white/38 text-black/44">
            Here is everything Voya holds about you — nothing more.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            "PROFILE UPDATED" SUCCESS BANNER
            Flashes when the user returns from a successful edit.
        ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showUpdateBanner && (
            <motion.div
              key="update-banner"
              variants={bannerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl overflow-hidden"
              style={{
                background:  "rgba(76,175,130,0.10)",
                border:      "1px solid rgba(76,175,130,0.25)",
              }}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
              >
                <Check size={16} style={{ color: SUCCESS }} />
              </motion.span>
              <p className="text-sm font-medium" style={{ color: SUCCESS }}>
                Profile updated successfully.
              </p>
              <motion.button
                onClick={() => setShowUpdateBanner(false)}
                whileTap={{ scale: 0.88 }}
                className="ml-auto dark:text-white/25 text-black/25
                           hover:text-white dark:hover:text-white
                           transition-colors duration-150"
              >
                <X size={13} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            MAIN PROFILE CARD
            The outer shell is static. AnimatePresence swaps the interior
            between ViewMode and EditMode with a crossfade.
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden
                     dark:bg-[#141720] bg-white
                     dark:border dark:border-white/[0.07]
                     border border-black/[0.06]
                     shadow-sm dark:shadow-none"
        >
          {/* ── Card top strip — brand anchor ── */}
          <div
            className="flex items-center gap-2 px-7 py-4
                       dark:border-b dark:border-white/[0.06]
                       border-b border-black/[0.05]"
            style={{
              background: "linear-gradient(135deg, rgba(200,169,126,0.06) 0%, transparent 60%)",
            }}
          >
            {/* Mini Voya logo */}
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: GOLD }}
            >
              <MapPin size={11} color="#0C0E14" strokeWidth={2.5} />
            </div>
            <span
              className="text-[10px] font-semibold uppercase dark:text-white/30 text-black/38"
              style={{ letterSpacing: "0.20em", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              voya
            </span>

            {/* Edit-mode indicator */}
            <AnimatePresence>
              {isEditing && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto text-[10px] uppercase tracking-widest font-medium"
                  style={{ color: GOLD_MUTED, letterSpacing: "0.14em" }}
                >
                  Editing
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ── Card body — animated content area ── */}
          <div className="px-7 py-7">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <ViewMode
                  key="view"
                  profile={localProfile}
                  onStartEdit={() => setIsEditing(true)}
                  onLogout={onLogout}
                />
              ) : (
                <EditMode
                  key="edit"
                  profile={localProfile}
                  onCancel={handleCancelEdit}
                  onSaved={handleSaved}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM NOTE — privacy reassurance
        ══════════════════════════════════════════════════════════════ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-xs dark:text-white/20 text-black/28 pb-4"
        >
          Your information is stored securely and never shared with third parties.
        </motion.p>

      </div>
    </motion.div>
  );
}