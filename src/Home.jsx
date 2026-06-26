/**
 * ============================================================
 * Home.jsx — Premium Travel Booking Platform
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  MapPin,
  Star,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  X,
  Compass,
  Sparkles,
  Shield,
  Trash2,
  Edit3,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Link as LinkIcon,
  Users,
  BedDouble,
  Bath,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const GOLD         = "#C8A97E";
const GOLD_HOVER   = "#D9BC96";
const GOLD_MUTED   = "rgba(200,169,126,0.65)";
const GOLD_SUBTLE  = "rgba(200,169,126,0.14)";

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEFAULT MOCK DATA 
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROPERTIES = [
  {
    id: "mock_1",
    title: "Samode Haveli",
    location: "Jaipur, Rajasthan",
    region: "Rajasthan",
    pricePerNight: 32000,
    rating: 4.9,
    reviews: 214,
    type: "Heritage",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80&fit=crop",
    tagline: "A 475-year-old merchant palace, lovingly restored.",
    amenities: ["Private courtyard", "Rooftop dining", "Ayurveda spa"],
    ownerId: "system"
  },
  {
    id: "mock_2",
    title: "Assagao Garden Villa",
    location: "Assagao, North Goa",
    region: "Goa",
    pricePerNight: 28500,
    rating: 4.8,
    reviews: 176,
    type: "Villa",
    imageUrl:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80&fit=crop",
    tagline: "Colonial-era villa wrapped in frangipani and silence.",
    amenities: ["Infinity pool", "Chef on call", "Garden pavilion"],
    ownerId: "system"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. FILTER CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Heritage", "Villa", "Nature", "Waterfront"];

const PRICE_OPTIONS = [
  { label: "Any price",   value: Infinity },
  { label: "Under ₹20k",  value: 20000    },
  { label: "Under ₹30k",  value: 30000    },
  { label: "Under ₹40k",  value: 40000    },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

const pageVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const formatPrice = (n) => "₹" + n.toLocaleString("en-IN");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — formatPropertyFromAPI
// ─────────────────────────────────────────────────────────────────────────────

const formatPropertyFromAPI = (p) => {
  let formattedLocation = "Undisclosed Location";
  let formattedRegion   = "India";

  if (p.location && typeof p.location === "object") {
    formattedLocation = `${p.location.city || ""}, ${p.location.state || ""}`
      .replace(/^, | ,$|(^,$)/g, "")
      .trim();
    formattedRegion = p.location.state || p.location.city || "India";
  } else if (typeof p.location === "string") {
    formattedLocation = p.location;
    formattedRegion   = p.location.split(",")[1]?.trim() || "India";
  }

  return {
    id:            p._id || p.id,
    title:         p.title        || "Unnamed Property",
    location:      formattedLocation,
    region:        formattedRegion,
    pricePerNight: p.pricePerNight || p.price     || 0,
    rating:        p.rating        || 4.5,
    reviews:       p.totalReviews  || p.reviews   || Math.floor(Math.random() * 150) + 10,
    type:          p.propertyType  || p.type      || "Villa",
    imageUrl:      p.thumbnailImage || p.imageUrl || p.image
                   || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    tagline:       p.description   || p.tagline   || "A hand-curated Voya sanctuary.",
    amenities:     p.amenities?.length > 0 ? p.amenities : ["Wifi", "Private Pool", "Concierge"],
    ownerId:       p.Owner || p.owner || null,
    
    // We retain the raw details below so they can easily populate the Edit Form
    rawDescription: p.description || "",
    bedrooms:      p.bedrooms || "",
    bathrooms:     p.bathrooms || "",
    guests:        p.guests || "",
    images:        p.images || [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
};

const modalVariants = {
  hidden:  { opacity: 0, y: 52, scale: 0.96 },
  visible: {
    opacity: 1,
    y:       0,
    scale:   1,
    transition: { type: "spring", stiffness: 320, damping: 30, delay: 0.04 },
  },
  exit: {
    opacity: 0,
    y:       28,
    scale:   0.97,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUB-COMPONENTS (Pills, Dropdowns, Cards)
// ─────────────────────────────────────────────────────────────────────────────

const CategoryPill = ({ label, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.94 }}
    className={[
      "relative px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap",
      "transition-colors duration-200 focus:outline-none border",
      isActive
        ? "border-transparent text-[#0C0E14]"
        : "dark:border-white/10 dark:text-white/40 dark:hover:border-[#C8A97E]/40 dark:hover:text-white/70 border-black/10 text-black/40 hover:border-[#C8A97E]/50 hover:text-black/70",
    ].filter(Boolean).join(" ")}
    style={isActive ? { backgroundColor: GOLD } : {}}
  >
    {label}
    {isActive && (
      <span
        className="absolute inset-x-3 top-1 h-px rounded-full opacity-40"
        style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }}
      />
    )}
  </motion.button>
);

const PriceDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedLabel = PRICE_OPTIONS.find((o) => o.value === value)?.label ?? "Any price";
  const isFiltered = value !== Infinity;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        className={[
          "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors duration-200 focus:outline-none",
          isFiltered
            ? "border-transparent text-[#0C0E14]"
            : "dark:border-white/10 dark:text-white/40 dark:hover:border-[#C8A97E]/40 dark:hover:text-white/70 border-black/10 text-black/40 hover:border-[#C8A97E]/50 hover:text-black/70",
        ].filter(Boolean).join(" ")}
        style={isFiltered ? { backgroundColor: GOLD } : {}}
      >
        <SlidersHorizontal size={11} strokeWidth={2.2} />
        {selectedLabel}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <ChevronDown size={11} strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1.00, y:  0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
            className="absolute top-full left-0 mt-2 w-44 z-30 rounded-2xl overflow-hidden shadow-xl dark:bg-[#141720] dark:border dark:border-white/[0.07] bg-white border border-black/[0.07]"
          >
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-150 flex items-center justify-between ${opt.value === value ? "dark:text-[#C8A97E] text-[#C8A97E]" : "dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/[0.05] text-black/50 hover:text-black/80 hover:bg-black/[0.04]"}`}
              >
                {opt.label}
                {opt.value === value && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROPERTY CARD
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_TINTS = {
  Heritage:   "rgba(200,169,126,0.22)",
  Villa:      "rgba(99,176,150,0.20)",
  Nature:     "rgba(115,168,99,0.20)",
  Waterfront: "rgba(99,139,176,0.20)",
};

const TypeBadge = ({ type }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md border border-white/14 text-white/90 tracking-wide" style={{ background: TYPE_TINTS[type] || "rgba(255,255,255,0.12)" }}>
    {type || "Retreat"}
  </span>
);

const PropertyCard = ({ property, saved, onSave, isCreatorMode, onDelete, onEdit }) => {
  const [imgError, setImgError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTrigger = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirmDelete) {
        setShowConfirmDelete(true);
        setTimeout(() => setShowConfirmDelete(false), 3000);
        return;
    }

    setIsDeleting(true);
    await onDelete(property.id); 
  };

  return (
    <motion.article
      variants={cardVariants}
      layout
      className={`group flex flex-col rounded-2xl overflow-hidden select-none dark:bg-[#141720] dark:border dark:border-white/[0.07] bg-white border border-black/[0.06] shadow-sm transition-all duration-300 ${isDeleting ? "opacity-50 pointer-events-none scale-95" : "hover:border-[#C8A97E]/30 dark:hover:border-[#C8A97E]/25 hover:-translate-y-1 hover:shadow-lg dark:shadow-none dark:hover:shadow-none cursor-pointer"}`}
    >
      <div className="relative overflow-hidden aspect-[4/3] flex-shrink-0">
        {!imgError ? (
          <img src={property.imageUrl} alt={property.title} onError={() => setImgError(true)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1A1D28 0%, #2D3148 50%, #1A1D28 100%)" }} />
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(12,14,20,0.55) 0%, transparent 100%)" }} />
        <div className="absolute top-3 left-3 z-10"><TypeBadge type={property.type} /></div>
        
        {!isCreatorMode && (
          <div className="absolute top-3 right-3 z-10">
            <motion.button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }} whileTap={{ scale: 0.80 }} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none backdrop-blur-md" style={{ background: saved ? GOLD : "rgba(12,14,20,0.42)", border: saved ? "none" : "1px solid rgba(255,255,255,0.16)" }}>
              <Heart size={13} style={saved ? { fill: "#0C0E14", color: "#0C0E14" } : { color: "rgba(242,237,230,0.80)" }} />
            </motion.button>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: GOLD }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: GOLD }} /></span>
          <span className="text-[11px] font-medium text-white/70">{property.region || "India"}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{property.title}</h3>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0" style={{ backgroundColor: GOLD_SUBTLE }}>
            <Star size={10} style={{ fill: GOLD, color: GOLD }} />
            <span className="text-[11px] font-semibold" style={{ color: GOLD }}>{(property.rating || 4.0).toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin size={11} strokeWidth={2} style={{ color: GOLD_MUTED, flexShrink: 0 }} />
          <span className="text-xs dark:text-white/40 text-black/45 truncate">{property.location}</span>
        </div>

        <p className="text-xs italic leading-relaxed dark:text-white/35 text-black/40 line-clamp-2">{property.tagline}</p>

        <div className="flex-1" />

        <div className="pt-3" style={{ borderTop: "1px solid rgba(200,169,126,0.12)" }}>
            
          {isCreatorMode ? (
            <div className="flex items-center justify-between gap-2">
                <motion.button 
                    onClick={handleDeleteTrigger} 
                    whileTap={{ scale: 0.95 }}
                    disabled={isDeleting}
                    className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${showConfirmDelete ? "bg-red-500 text-white border-red-500" : "dark:text-white/50 text-black/50 border-transparent dark:hover:bg-white/5 hover:bg-black/5"}`}
                >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    {showConfirmDelete ? "Confirm Delete" : "Delete"}
                </motion.button>
                <motion.button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(property); }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-xl text-xs font-semibold border dark:border-white/10 dark:text-white/80 border-black/10 text-black/80 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                    <Edit3 size={12} /> Edit
                </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
                <div>
                <span className="text-base font-semibold" style={{ color: GOLD }}>{formatPrice(property.pricePerNight || 0)}</span>
                <span className="text-xs dark:text-white/30 text-black/35 ml-1">/ night</span>
                </div>
                <motion.a href={`/property/${property.id}`} whileTap={{ scale: 0.95 }} className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>
                View
                </motion.a>
            </div>
          )}

        </div>
      </div>
    </motion.article>
  );
};

const EmptyState = ({ isCreatorMode, onReset }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="col-span-full flex flex-col items-center justify-center py-24 gap-5 text-center">
    <Compass size={48} style={{ color: GOLD }} strokeWidth={1.25} className="opacity-20 dark:opacity-15" />
    <div className="space-y-1.5">
      <h3 className="text-lg font-semibold dark:text-white/60 text-black/50" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {isCreatorMode ? "No properties listed" : "No sanctuaries found"}
      </h3>
      <p className="text-sm dark:text-white/28 text-black/35 max-w-xs">
        {isCreatorMode ? "You haven't listed any properties yet. Click above to start hosting." : "Your filters are too refined. Broaden them to discover more."}
      </p>
    </div>
    {!isCreatorMode && (
      <motion.button onClick={onReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-200 mt-1" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>
        <X size={12} strokeWidth={2.5} /> Clear all filters
      </motion.button>
    )}
  </motion.div>
);

const AddPropertyCard = ({ onOpen }) => (
    <motion.article
      variants={cardVariants}
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="group flex flex-col items-center justify-center min-h-[350px] rounded-2xl cursor-pointer border-2 border-dashed dark:border-white/10 dark:hover:border-[#C8A97E]/50 border-black/10 hover:border-[#C8A97E]/50 transition-all duration-300"
      style={{ backgroundColor: "transparent" }}
    >
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300"
          style={{ backgroundColor: GOLD_SUBTLE }}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(200,169,126,0.24)" }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
            <Plus size={24} style={{ color: GOLD }} />
        </motion.div>
        <h3 className="text-lg font-semibold dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Add New Property</h3>
        <p className="text-xs dark:text-white/40 text-black/40 mt-1">List a new sanctuary to the world</p>
    </motion.article>
);

const FloatingField = ({
  label,
  name,
  value,
  onChange,
  type     = "text",
  as       = "input",
  error,
  hint,
  icon,
  rows     = 3,
}) => {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || Boolean(value);

  const sharedInputClass =
    "w-full bg-transparent pt-5 pb-1 text-sm focus:outline-none dark:text-[#F2EDE6] text-[#1A1712]";

  return (
    <div className="relative w-full">
      <div
        className="relative pb-1.5"
        style={{
          borderBottom: `1px solid ${error ? "#F06B6B" : focused ? GOLD : "rgba(200,169,126,0.15)"}`,
          transition: "border-color 0.25s",
        }}
      >
        <motion.label
          htmlFor={name}
          animate={{
            y:     isFloating ? -20 : 0,
            scale: isFloating ? 0.80 : 1,
            color: error
              ? "#F06B6B"
              : focused
              ? GOLD
              : "rgba(242,237,230,0.35)",
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 top-3 text-sm pointer-events-none origin-left select-none"
          style={{ transformOrigin: "left center" }}
        >
          {label}
        </motion.label>

        {as === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value}
            rows={rows}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`${sharedInputClass} resize-none pt-6`}
            placeholder=" "
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`${sharedInputClass} ${icon ? "pr-7" : ""}`}
            placeholder=" "
            style={ type === "number" ? { MozAppearance: "textfield" } : {} }
          />
        )}

        {icon && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(242,237,230,0.25)" }}
          >
            {icon}
          </span>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mt-1 text-xs"
            style={{ color: "#F06B6B" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {hint && !error && (
        <p className="mt-1 text-[11px] dark:text-white/22 text-black/30">{hint}</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY MODAL (Handles both Creating & Editing)
// ─────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ["Heritage", "Villa", "Nature", "Waterfront"];

const INITIAL_FORM = {
  title:          "",
  description:    "",
  propertyType:   "",
  location:       "",
  pricePerNight:  "",
  bedrooms:       "",
  bathrooms:      "",
  guests:         "",
  thumbnailImage: "",
  images:         "",
};

const PropertyModal = ({ isOpen, onClose, onPropertySaved, propertyToEdit }) => {
  const [form,         setForm]         = useState(INITIAL_FORM);
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState("");
  const [isSuccess,    setIsSuccess]    = useState(false);

  const isEditing = !!propertyToEdit;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (propertyToEdit) {
        setForm({
          title:          propertyToEdit.title || "",
          description:    propertyToEdit.rawDescription || propertyToEdit.tagline || "",
          propertyType:   propertyToEdit.type || "",
          location:       propertyToEdit.location || "",
          pricePerNight:  propertyToEdit.pricePerNight || "",
          bedrooms:       propertyToEdit.bedrooms || "",
          bathrooms:      propertyToEdit.bathrooms || "",
          guests:         propertyToEdit.guests || "",
          thumbnailImage: propertyToEdit.imageUrl || "",
          images:         Array.isArray(propertyToEdit.images) ? propertyToEdit.images.join(", ") : "",
        });
      } else {
        setForm(INITIAL_FORM);
      }
      setErrors({});
      setSubmitError("");
      setIsSuccess(false);
    }
  }, [isOpen, propertyToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError)  setSubmitError("");
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())                              e.title         = "Property title is required";
    if (!form.description.trim())                        e.description   = "A description is required";
    if (!form.propertyType)                              e.propertyType  = "Please select a property type";
    if (!form.location.trim())                           e.location      = "Location is required";
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0)
                                                         e.pricePerNight = "Enter a valid price per night";
    if (!form.thumbnailImage.trim())                     e.thumbnailImage = "A thumbnail image URL is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError("");

    const locationParts = form.location.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedCity = locationParts[0] || "Unknown City";
    const parsedCountry = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "India";

    const payload = {
      title:          form.title.trim(),
      description:    form.description.trim(),
      propertyType:   form.propertyType,
      location: {
        address: form.location.trim(),
        city: parsedCity,
        country: parsedCountry
      },
      pricePerNight:  Number(form.pricePerNight),
      bedrooms:       Number(form.bedrooms)  || 1,
      bathrooms:      Number(form.bathrooms) || 1,
      guests:         Number(form.guests)    || 2,
      thumbnailImage: form.thumbnailImage.trim(),
      images:         form.images
                        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
                        : [],
    };

    try {
      // Switch between POST and PUT endpoints based on isEditing
      const url = isEditing 
        ? `http://localhost:5000/api/property/update/${propertyToEdit.id}` // IMPORTANT: Ensure your backend has this PUT endpoint!
        : "http://localhost:5000/api/property/create";
        
      const method = isEditing ? "put" : "post";

      const response = await axios[method](
        url,
        payload,
        { withCredentials: true } 
      );

      const raw = response.data?.data || response.data?.property || response.data;
      const formatted = formatPropertyFromAPI(raw);

      setIsSuccess(true);
      setTimeout(() => {
        onPropertySaved(formatted, isEditing); 
        onClose();                 
      }, 900);

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{
            backgroundColor: "rgba(12,14,20,0.82)",
            backdropFilter:  "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            key="modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh]
                       overflow-y-auto flex flex-col
                       rounded-t-3xl sm:rounded-2xl
                       dark:bg-[#141720] bg-white
                       dark:border dark:border-white/[0.08]
                       border border-black/[0.07]"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,169,126,0.2) transparent" }}
          >
            <div
              className="flex items-center justify-between px-7 py-5 flex-shrink-0
                         dark:border-b dark:border-white/[0.07]
                         border-b border-black/[0.06]
                         sticky top-0 z-10
                         dark:bg-[#141720] bg-white"
            >
              <div>
                <h2
                  className="text-xl font-semibold dark:text-[#F2EDE6] text-[#1A1712]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {isEditing ? "Edit Sanctuary" : "List a New Sanctuary"}
                </h2>
                <p className="text-xs dark:text-white/35 text-black/40 mt-0.5">
                  {isEditing ? "Update your property details below." : "Your property will be reviewed by the Voya concierge team."}
                </p>
              </div>

              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                           dark:bg-white/[0.06] dark:hover:bg-white/[0.10] dark:text-white/50
                           bg-black/[0.05] hover:bg-black/[0.09] text-black/50
                           transition-colors duration-200 focus:outline-none"
              >
                <X size={14} />
              </motion.button>
            </div>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-8 gap-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.08 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center border"
                    style={{
                      background:  "rgba(76,175,130,0.12)",
                      borderColor: "rgba(76,175,130,0.30)",
                    }}
                  >
                    <CheckCircle2 size={28} style={{ color: "#4CAF82" }} />
                  </motion.div>
                  <h3
                    className="text-xl font-semibold dark:text-[#F2EDE6] text-[#1A1712]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {isEditing ? "Property updated" : "Property listed"}
                  </h3>
                  <p className="text-sm dark:text-white/40 text-black/45 max-w-xs">
                    {isEditing ? "Your changes have been saved successfully." : "Your sanctuary has been added to the Voya collection."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSuccess && (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1">
                <div className="px-7 py-7 space-y-8">
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        key="submit-error"
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0,  height: "auto" }}
                        exit={{    opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl overflow-hidden"
                        style={{ background: "rgba(240,107,107,0.10)", border: "1px solid rgba(240,107,107,0.28)" }}
                      >
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#F06B6B" }} />
                        <p className="text-xs leading-relaxed" style={{ color: "#F06B6B" }}>
                          {submitError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-7">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/28 text-black/35" style={{ letterSpacing: "0.16em" }}>Basic Information</span>
                      <div className="flex-1 h-px dark:bg-white/[0.06] bg-black/[0.06]" />
                    </div>

                    <FloatingField label="Property title" name="title" value={form.title} onChange={handleChange} error={errors.title} />
                    <FloatingField label="Description" name="description" as="textarea" rows={3} value={form.description} onChange={handleChange} error={errors.description} hint="Write 2–3 sentences that capture the essence of the property." />

                    <div>
                      <p className="text-xs mb-3 dark:text-white/35 text-black/40" style={{ letterSpacing: "0.04em" }}>Property type</p>
                      <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map((pt) => {
                          const active = form.propertyType === pt;
                          return (
                            <motion.button
                              type="button"
                              key={pt}
                              whileTap={{ scale: 0.93 }}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, propertyType: pt }));
                                if (errors.propertyType) setErrors((prev) => ({ ...prev, propertyType: "" }));
                              }}
                              className="px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 focus:outline-none"
                              style={{
                                backgroundColor: active ? GOLD : "transparent",
                                borderColor: active ? GOLD : "rgba(242,237,230,0.14)",
                                color: active ? "#0C0E14" : "rgba(242,237,230,0.42)",
                              }}
                            >
                              {pt}
                            </motion.button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {errors.propertyType && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs" style={{ color: "#F06B6B" }}>
                            {errors.propertyType}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-7">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/28 text-black/35" style={{ letterSpacing: "0.16em" }}>Location &amp; Pricing</span>
                      <div className="flex-1 h-px dark:bg-white/[0.06] bg-black/[0.06]" />
                    </div>

                    <FloatingField label="Location  (e.g. Jaipur, Rajasthan)" name="location" value={form.location} onChange={handleChange} error={errors.location} icon={<MapPin size={14} strokeWidth={1.8} />} />
                    <FloatingField label="Price per night  (₹)" name="pricePerNight" type="number" value={form.pricePerNight} onChange={handleChange} error={errors.pricePerNight} />
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/28 text-black/35" style={{ letterSpacing: "0.16em" }}>Capacity</span>
                      <div className="flex-1 h-px dark:bg-white/[0.06] bg-black/[0.06]" />
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <FloatingField label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} icon={<BedDouble size={13} strokeWidth={1.8} />} />
                      <FloatingField label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} icon={<Bath size={13} strokeWidth={1.8} />} />
                      <FloatingField label="Max guests" name="guests" type="number" value={form.guests} onChange={handleChange} icon={<Users size={13} strokeWidth={1.8} />} />
                    </div>
                  </div>

                  <div className="space-y-7">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/28 text-black/35" style={{ letterSpacing: "0.16em" }}>Images</span>
                      <div className="flex-1 h-px dark:bg-white/[0.06] bg-black/[0.06]" />
                    </div>

                    <FloatingField label="Thumbnail image URL" name="thumbnailImage" type="url" value={form.thumbnailImage} onChange={handleChange} error={errors.thumbnailImage} icon={<ImageIcon size={13} strokeWidth={1.8} />} hint="This image appears on the property card in the discovery feed." />
                    <FloatingField label="Additional photo URLs  (optional)" name="images" value={form.images} onChange={handleChange} icon={<LinkIcon size={13} strokeWidth={1.8} />} hint="Separate multiple URLs with a comma — they appear in the gallery on the detail page." />
                  </div>

                </div>

                <div
                  className="sticky bottom-0 px-7 py-5 flex-shrink-0
                             dark:bg-[#141720] bg-white
                             dark:border-t dark:border-white/[0.07]
                             border-t border-black/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      whileTap={{ scale: 0.97 }}
                      disabled={isSubmitting}
                      className="px-5 py-3 rounded-xl text-sm font-medium border
                                 transition-colors duration-200
                                 dark:border-white/[0.09] dark:text-white/40
                                 dark:hover:border-white/16 dark:hover:text-white/65
                                 border-black/[0.08] text-black/40
                                 hover:border-black/15 hover:text-black/65
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold
                                 flex items-center justify-center gap-2
                                 transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: GOLD, color: "#0C0E14" }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) e.currentTarget.style.backgroundColor = GOLD_HOVER;
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          {isEditing ? "Saving…" : "Listing property…"}
                        </>
                      ) : (
                        isEditing ? "Save Changes" : "List property"
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — Home
// ─────────────────────────────────────────────────────────────────────────────

export default function Home({ userProfile }) {
  const [properties, setProperties] = useState(DEFAULT_PROPERTIES);

  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice,       setMaxPrice]       = useState(Infinity);
  const [minRating,      setMinRating]      = useState(false);
  const [savedIds,       setSavedIds]       = useState(new Set());
  
  const [creatorMode, setCreatorMode] = useState(false);

  // ── Property Modal State ───────────────────────────────────────────────────
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [propertyToEdit, setPropertyToEdit]       = useState(null);

  const handleOpenAdd = useCallback(() => {
    setPropertyToEdit(null); // Ensure it's empty for creating
    setShowPropertyModal(true);
  }, []);

  const handleOpenEdit = useCallback((property) => {
    setPropertyToEdit(property); // Pass the existing data for editing
    setShowPropertyModal(true);
  }, []);

  /**
   * Called by PropertyModal on successful POST or PUT.
   */
  const handlePropertySaved = useCallback((savedProperty, isEditing) => {
    if (isEditing) {
      // Find the specific card and update its data
      setProperties((prev) => prev.map((p) => (p.id === savedProperty.id ? savedProperty : p)));
    } else {
      // Prepend newly created property
      setProperties((prev) => [savedProperty, ...prev]);
    }
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        let response;
        if (creatorMode) {
            const userId = userProfile?._id || userProfile?.id;
            if (!userId) return;
            response = await axios.get(`http://localhost:5000/api/property/fetchProperty/${userId}`, {
                withCredentials: true 
            });
        } else {
            response = await axios.get("http://localhost:5000/api/property/fetch");
        }

        let apiData = response.data.data || response.data.properties || response.data;
        if (apiData && !Array.isArray(apiData) && (apiData._id || apiData.id)) {
            apiData = [apiData];
        }
        
        if (Array.isArray(apiData)) {
          const formattedApiData = apiData.map(formatPropertyFromAPI);
          if (creatorMode) {
              setProperties(formattedApiData);
          } else {
              setProperties([...DEFAULT_PROPERTIES, ...formattedApiData]);
          }
        }
      } catch (error) {
        console.error("Voya API Error:", error.message);
        if (creatorMode) setProperties([]);
      }
    };

    fetchProperties();
  }, [creatorMode, userProfile]);

  const filteredProps = useMemo(() => {
    return properties.filter((p) => {
      if (creatorMode) return true; 
      if (activeCategory !== "All" && p.type !== activeCategory) return false;
      if (p.pricePerNight > maxPrice) return false;
      if (minRating && p.rating < 4.0) return false;
      return true;
    });
  }, [activeCategory, maxPrice, minRating, properties, creatorMode]);

  const toggleSaved = useCallback((id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setActiveCategory("All");
    setMaxPrice(Infinity);
    setMinRating(false);
  }, []);

  const handlePropertyDelete = async (id) => {
      try {
          await axios.delete(`http://localhost:5000/api/property/delete/${id}`, {
              withCredentials: true
          });
          setProperties(prev => prev.filter(p => p.id !== id));
      } catch (error) {
          console.error("Failed to delete property:", error.response?.data?.message || error.message);
          alert(error.response?.data?.message || "Failed to delete property.");
      }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen dark:bg-[#0C0E14] bg-[#FAF8F4] transition-colors duration-300"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-10 lg:py-14 space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: GOLD }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: GOLD }} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD_MUTED, letterSpacing: "0.16em" }}>
                  {creatorMode ? "Host Dashboard" : "Curated collection"}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {creatorMode ? "Your Properties" : "Sanctuaries of India"}
            </h1>
            <p className="mt-1.5 text-sm dark:text-white/40 text-black/45 max-w-md">
                {creatorMode 
                    ? "Manage your active listings, update details, or add new properties."
                    : "Hand-picked estates, retreats, and heritage homes — each one vetted by the Voya concierge team."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
              <AnimatePresence>
                  {userProfile?.role === "creator" && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                            setCreatorMode(!creatorMode);
                            resetFilters(); 
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                        style={{ 
                            backgroundColor: creatorMode ? GOLD : GOLD_SUBTLE, 
                            color: creatorMode ? "#0C0E14" : GOLD,
                            border: `1px solid ${creatorMode ? GOLD : 'rgba(200,169,126,0.3)'}`
                        }}
                      >
                          <Shield size={14} />
                          {creatorMode ? "Exit Creator Mode" : "Manage My Properties"}
                      </motion.button>
                  )}
              </AnimatePresence>
              
              {!creatorMode && savedIds.size > 0 && (
                <motion.a href="/saved" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: GOLD_SUBTLE, border: `1px solid rgba(200,169,126,0.28)`, color: GOLD }}>
                    <Heart size={12} style={{ fill: GOLD, color: GOLD }} />
                    {savedIds.size} saved
                </motion.a>
              )}
          </div>
        </motion.div>

        <AnimatePresence>
            {!creatorMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {CATEGORIES.map((cat) => (
                    <CategoryPill key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
                    ))}
                    <span className="w-1 h-1 rounded-full flex-shrink-0 dark:bg-white/15 bg-black/15" />
                    <PriceDropdown value={maxPrice} onChange={setMaxPrice} />
                    <RatingToggle value={minRating} onChange={setMinRating} />
                </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div variants={gridVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Add card now specifically triggers handleOpenAdd */}
          {creatorMode && <AddPropertyCard onOpen={handleOpenAdd} />}

          {filteredProps.length > 0 ? (
            filteredProps.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                saved={savedIds.has(property.id)} 
                onSave={() => toggleSaved(property.id)} 
                isCreatorMode={creatorMode}
                onDelete={handlePropertyDelete}
                onEdit={handleOpenEdit} // Pass the edit function!
              />
            ))
          ) : (
            !creatorMode && <EmptyState isCreatorMode={creatorMode} onReset={resetFilters} />
          )}
        </motion.div>

      </div>

      {/* ── Dynamic Property Modal ── */}
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onPropertySaved={handlePropertySaved}
        propertyToEdit={propertyToEdit} // Determines if we are editing or creating
      />

    </motion.div>
  );
}

const RatingToggle = ({ value, onChange }) => (
  <motion.button
    onClick={() => onChange(!value)}
    whileTap={{ scale: 0.94 }}
    className={["flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-colors duration-200", value ? "border-transparent text-[#0C0E14]" : "dark:border-white/10 dark:text-white/40 dark:hover:border-[#C8A97E]/40 border-black/10 text-black/40 hover:border-[#C8A97E]/50"].join(" ")}
    style={value ? { backgroundColor: GOLD } : {}}
  >
    <Star size={11} strokeWidth={2} style={{ fill: value ? "#0C0E14" : "none", color: value ? "#0C0E14" : "currentColor" }} />
    4.0+ Rating
  </motion.button>
);