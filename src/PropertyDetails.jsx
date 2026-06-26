/**
 * ============================================================
 * PropertyDetails.jsx — Premium Travel Booking Platform
 * "voya" — curated travel for the discerning traveler
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft, MapPin, Star, Heart, Share2, Wifi, Waves, Coffee, Sparkles,
  UtensilsCrossed, Droplets, Bike, Bell, TreePine, Wind, ShieldCheck, Dumbbell,
  Users, CalendarDays, Minus, Plus, Info, Award, Compass, AlertCircle, MessageSquare
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const GOLD        = "#C8A97E";
const GOLD_HOVER  = "#D9BC96";
const GOLD_MUTED  = "rgba(200,169,126,0.65)";
const GOLD_SUBTLE = "rgba(200,169,126,0.12)";
const GOLD_RING   = "rgba(200,169,126,0.30)";

const formatPrice = (n) => "₹" + n.toLocaleString("en-IN");

const AMENITY_ICONS = {
  "Private Infinity Pool": Waves, "In-villa Chef": UtensilsCrossed, "Daily Housekeeping": Sparkles,
  "High-speed WiFi": Wifi, "Garden Pavilion": TreePine, "Outdoor Shower": Droplets,
  "Vintage Bicycles": Bike, "Voya Concierge": Bell, "Air Conditioning": Wind,
  "Safe & Security": ShieldCheck, "Fitness Area": Dumbbell, "Coffee Machine": Coffee,
};

const DEFAULT_PROPERTY = {
  id: "default",
  title: "Assagao Heritage Villa",
  subtitle: "A private colonial estate in Goa's most coveted village",
  location: "Assagao, North Goa, India",
  pricePerNight: 28500,
  rating: 4.8,
  reviewsCount: 176,
  type: "Villa",
  isAvailable: true,
  description: [
    "The Assagao Heritage Villa is a meticulously restored 19th-century Portuguese manor set within three acres of frangipani-scented gardens in North Goa's most sought-after village. Original hand-painted azulejo tiles, colonial arched doorways, and ceiling rafters of aged teak coexist in quiet conversation with the considered comforts of a private retreat.",
    "This is a home that asks nothing of you. Mornings unfurl slowly — filter coffee on the veranda, garden birds, the unhurried Goa that existed before the crowds found it."
  ],
  images: [
    { url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=85&fit=crop", alt: "Villa exterior" },
    { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80&fit=crop", alt: "Infinity pool" },
    { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80&fit=crop", alt: "Master bedroom" },
  ],
  amenities: [
    "Private Infinity Pool", "In-villa Chef", "Daily Housekeeping", "High-speed WiFi",
    "Garden Pavilion", "Outdoor Shower", "Vintage Bicycles", "Voya Concierge",
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANIMATION VARIANTS & SHARED UI
// ─────────────────────────────────────────────────────────────────────────────
const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } } };
const heroVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const heroItemVariants = { hidden: { opacity: 0, y: 24, scale: 0.985 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } } };
const feeVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const feeItemVariants = { hidden: { opacity: 0, x: 6 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } };

const StarRow = ({ rating, size = 13 }) => {
  const full = Math.floor(rating);
  const empty = 5 - Math.ceil(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} size={size} style={{ fill: GOLD, color: GOLD }} />)}
      {Math.ceil(rating) > full && <Star size={size} style={{ fill: GOLD_MUTED, color: GOLD_MUTED }} />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} size={size} className="dark:opacity-20 opacity-15" style={{ color: GOLD }} />)}
    </span>
  );
};

const FadeIn = ({ children, delay = 0, distance = 20, className = "" }) => (
  <motion.div initial={{ opacity: 0, y: distance }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94], delay }} className={className}>
    {children}
  </motion.div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
    {subtitle && <p className="mt-1 text-sm dark:text-white/38 text-black/40 italic">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const HeroGallery = ({ images, title }) => {
  const [errors, setErrors] = useState([false, false, false]);
  const handleErr = (idx) => setErrors(prev => { const n = [...prev]; n[idx] = true; return n; });
  const Fallback = () => <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1A1D28 0%, #2D3148 55%, #1A1D28 100%)" }} />;

  return (
    <div className="relative">
      <motion.div variants={heroVariants} initial="hidden" animate="visible" className="hidden lg:grid gap-3 rounded-2xl overflow-hidden" style={{ gridTemplateColumns: "2fr 1fr", gridTemplateRows: "260px 260px", height: 523 }}>
        <motion.div variants={heroItemVariants} className="row-span-2 overflow-hidden group relative" style={{ gridRow: "1 / span 2", gridColumn: "1" }}>
          {!errors[0] ? <img src={images[0]?.url} alt={title} onError={() => handleErr(0)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="eager" /> : <Fallback />}
        </motion.div>
        <motion.div variants={heroItemVariants} className="overflow-hidden group relative" style={{ gridRow: "1", gridColumn: "2" }}>
          {!errors[1] ? <img src={images[1]?.url} alt={title} onError={() => handleErr(1)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" /> : <Fallback />}
        </motion.div>
        <motion.div variants={heroItemVariants} className="overflow-hidden group relative" style={{ gridRow: "2", gridColumn: "2" }}>
          {!errors[2] ? <img src={images[2]?.url} alt={title} onError={() => handleErr(2)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" /> : <Fallback />}
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="lg:hidden rounded-2xl overflow-hidden aspect-[4/3] group">
        {!errors[0] ? <img src={images[0]?.url} alt={title} onError={() => handleErr(0)} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="eager" /> : <Fallback />}
      </motion.div>
    </div>
  );
};

const AmenityGrid = ({ amenities }) => (
  <div className="grid grid-cols-2 gap-3">
    {amenities.map((amenity) => {
      const IconComponent = AMENITY_ICONS[amenity] ?? Sparkles;
      return (
        <div key={amenity} className="flex items-center gap-3 px-4 py-3.5 rounded-xl dark:bg-[#141720] dark:border dark:border-white/[0.07] bg-white border border-black/[0.06] shadow-sm dark:shadow-none">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD_SUBTLE }}>
            <IconComponent size={15} style={{ color: GOLD_MUTED }} strokeWidth={1.7} />
          </div>
          <span className="text-xs font-medium dark:text-white/65 text-black/60 leading-snug">{amenity}</span>
        </div>
      );
    })}
  </div>
);

const ReviewCard = ({ review, index }) => {
  const fname = review.user?.firstname || "Guest";
  const lname = review.user?.lastname || "User";
  const initials = `${fname[0]}${lname[0]}`.toUpperCase();
  const dateStr = new Date(review.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <FadeIn delay={index * 0.08}>
      <div className="p-5 rounded-2xl dark:bg-[#141720] dark:border dark:border-white/[0.07] bg-white border border-black/[0.06] shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border" style={{ background: "rgba(200,169,126,0.14)", borderColor: GOLD_RING, color: GOLD }}>
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium dark:text-[#F2EDE6] text-[#1A1712]">{fname} {lname}</p>
              <p className="text-xs dark:text-white/30 text-black/35 mt-0.5">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StarRow rating={review.rating} size={11} />
            <span className="text-xs font-semibold" style={{ color: GOLD }}>{review.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed italic dark:text-white/50 text-black/55">"{review.comment}"</p>
      </div>
    </FadeIn>
  );
};

const AddReviewForm = ({ propertyId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // SAFETY CHECK: Prevent reviewing mock or default properties!
    if (propertyId === "default" || propertyId?.toString().startsWith("mock_")) {
      setError("You cannot review a demonstration property.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a reflection.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      // NOTE: Ensure your backend uses this exact route pattern (either /add/:id or /create/:id depending on what you set up)
      const res = await axios.post(`http://localhost:5000/api/review/add/${propertyId}`, {
        rating,
        comment
      }, { withCredentials: true });

      onReviewAdded(res.data.data);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Are you logged in?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-2xl dark:bg-[#141720] dark:border dark:border-white/[0.07] bg-[#FAF8F4] border border-black/[0.06]">
      <h3 className="text-base font-semibold mb-1 dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Leave a Reflection</h3>
      <p className="text-xs dark:text-white/40 text-black/45 mb-5">Share your experience to help future travelers.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
              <Star size={20} style={{ fill: star <= rating ? GOLD : "transparent", color: star <= rating ? GOLD : "rgba(242,237,230,0.2)" }} />
            </button>
          ))}
          <span className="text-xs font-medium ml-2" style={{ color: GOLD }}>{rating}.0</span>
        </div>

        <textarea
          value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Describe the atmosphere, the concierge service, the view..."
          className="w-full h-24 p-4 rounded-xl text-sm focus:outline-none resize-none dark:bg-[#0C0E14] dark:border dark:border-white/[0.10] bg-white border border-black/[0.09] dark:text-[#F2EDE6] text-[#1A1712]"
          style={{ transition: "border-color 0.25s" }}
          onFocus={(e) => e.target.style.borderColor = GOLD}
          onBlur={(e) => e.target.style.borderColor = ""}
        />

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-[#F06B6B]">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-60" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>
          {isSubmitting ? "Submitting..." : "Submit Reflection"}
        </button>
      </form>
    </div>
  );
};

const DateField = ({ label, value, onChange, min, disabled }) => (
  <div className="flex flex-col gap-1 relative">
    <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/35 text-black/40" style={{ letterSpacing: "0.12em" }}>{label}</span>
    <div className="relative flex items-center group">
      <CalendarDays size={13} style={{ color: GOLD_MUTED, position: 'absolute', left: '12px' }} strokeWidth={1.7} className="pointer-events-none" />
      <input type="date" value={value} onChange={onChange} min={min} disabled={disabled} className="w-full pl-8 pr-2 py-2.5 rounded-xl text-xs transition-colors duration-200 focus:outline-none dark:bg-[#0C0E14] dark:border dark:border-white/[0.10] dark:hover:border-[#C8A97E]/35 dark:focus:border-[#C8A97E]/60 bg-[#FAF8F4] border border-black/[0.09] hover:border-[#C8A97E]/40 focus:border-[#C8A97E]/60 dark:text-white/70 text-black/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ colorScheme: 'dark' }} />
    </div>
  </div>
);

const GuestCounter = ({ guests, setGuests, disabled }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold uppercase tracking-widest dark:text-white/35 text-black/40" style={{ letterSpacing: "0.12em" }}>Guests</span>
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl dark:bg-[#0C0E14] dark:border dark:border-white/[0.10] bg-[#FAF8F4] border border-black/[0.09] ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2">
        <Users size={13} style={{ color: GOLD_MUTED }} strokeWidth={1.7} />
        <span className="text-xs dark:text-white/35 text-black/35">Guests</span>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={guests <= 1 || disabled} className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 dark:border dark:border-white/[0.12] border border-black/[0.10]"><Minus size={10} className="dark:text-white/50 text-black/50" /></motion.button>
        <span className="text-sm font-semibold dark:text-[#F2EDE6] text-[#1A1712]">{guests}</span>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setGuests(g => Math.min(8, g + 1))} disabled={guests >= 8 || disabled} className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 dark:border dark:border-white/[0.12] border border-black/[0.10]"><Plus size={10} className="dark:text-white/50 text-black/50" /></motion.button>
      </div>
    </div>
  </div>
);

const BookingCard = ({ property }) => {
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isSoldOut = property.isAvailable === false;
  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 4;
  const subtotal = property.pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.075);
  const total = subtotal + serviceFee;
  const today = new Date().toISOString().split('T')[0];

  const handleRequest = async () => {
    if (isSoldOut) return;
    if (!checkIn || !checkOut) return setApiError("Please select Check-in and Check-out dates.");
    if (new Date(checkOut) <= new Date(checkIn)) return setApiError("Check-out date must be after Check-in date.");

    setRequesting(true); setApiError("");
    try {
      const payload = { propertyId: property.id, checkInDate: checkIn, checkOutDate: checkOut, guests, totalPrice: total };
      const response = await axios.post(`http://localhost:5000/api/booking/create/${property.id}`, payload, { withCredentials: true });
      
      // Redirect to Stripe Checkout!
      if (response.data.url) {
          window.location.href = response.data.url;
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to process booking.");
      setRequesting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }} className="rounded-2xl overflow-hidden dark:bg-[#141720] dark:border dark:border-white/[0.08] bg-white border border-black/[0.07] shadow-xl dark:shadow-none">
      <div className="p-6 space-y-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold" style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>{formatPrice(property.pricePerNight)}</span>
          <span className="text-sm dark:text-white/35 text-black/40">/ night</span>
        </div>
        <div className="h-px dark:bg-white/[0.07] bg-black/[0.07]" />
        
        <AnimatePresence>
          {apiError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#F06B6B]/30 bg-[#F06B6B]/10 text-xs text-[#F06B6B]"><AlertCircle size={14} /><p>{apiError}</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          <DateField label="Check-in" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={isSoldOut} />
          <DateField label="Check-out" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={isSoldOut} />
        </div>
        <GuestCounter guests={guests} setGuests={setGuests} disabled={isSoldOut} />
        <div className="h-px dark:bg-white/[0.07] bg-black/[0.07]" />
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between"><span className="text-sm dark:text-white/50 text-black/50">{formatPrice(property.pricePerNight)} × {nights} nights</span><span className="text-sm dark:text-white/65 text-black/65 font-medium">{formatPrice(subtotal)}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm dark:text-white/50 text-black/50">Voya service fee</span><span className="text-sm dark:text-white/65 text-black/65 font-medium">{formatPrice(serviceFee)}</span></div>
          <div className="flex items-center justify-between pt-2.5" style={{ borderTop: `1px solid rgba(200,169,126,0.14)` }}><span className="text-sm font-semibold dark:text-[#F2EDE6] text-[#1A1712]">Total</span><span className="text-sm font-bold dark:text-[#F2EDE6] text-[#1A1712]">{formatPrice(total)}</span></div>
        </div>

        {isSoldOut ? (
          <div className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: "rgba(240, 107, 107, 0.08)", border: `1px solid rgba(240, 107, 107, 0.25)` }}>
            <AlertCircle size={14} style={{ color: "#F06B6B" }} /><span style={{ color: "#F06B6B" }}>Not Available</span>
          </div>
        ) : (
          <motion.button onClick={handleRequest} disabled={requesting} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-70" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>
            {requesting ? "Redirecting to Stripe..." : "Reserve Sanctuary"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT — PropertyDetails
// ─────────────────────────────────────────────────────────────────────────────
export default function PropertyDetails({ propertyId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!document.getElementById("voya-gfonts")) {
      const link = document.createElement("link");
      link.id   = "voya-gfonts";
      link.rel  = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }

    const fetchAllData = async () => {
      // --- 1. TRY TO FETCH PROPERTY ---
      try {
        const propertyRes = await axios.get("http://localhost:5000/api/property/fetch", {
            withCredentials: true 
        });
        const apiData = propertyRes.data.data || propertyRes.data.properties || propertyRes.data;
        
        let foundProperty = null;
        if (Array.isArray(apiData)) {
          const raw = apiData.find(p => (p._id || p.id).toString() === propertyId?.toString());
          if (raw) {
            foundProperty = {
              id: raw._id || raw.id,
              title: raw.title || "Unnamed Property",
              subtitle: raw.description || "A highly curated luxury retreat.",
              location: (raw.location?.city && raw.location?.state) ? `${raw.location.city}, ${raw.location.state}` : (raw.location?.address || "India"),
              pricePerNight: raw.pricePerNight || 0,
              type: raw.propertyType || raw.type || "Villa",
              isAvailable: raw.isAvailable !== false,
              description: raw.description ? [raw.description] : DEFAULT_PROPERTY.description,
              amenities: raw.amenities?.length ? raw.amenities : DEFAULT_PROPERTY.amenities,
              images: raw.images?.map(url => ({ url, alt: "View" })) || []
            };
            if (raw.thumbnailImage) foundProperty.images.unshift({ url: raw.thumbnailImage, alt: "Primary View" });
            while (foundProperty.images.length < 3) foundProperty.images.push(DEFAULT_PROPERTY.images[foundProperty.images.length % 3]);
            
            setProperty(foundProperty);
          } else {
             if (!propertyId?.toString().startsWith("mock_") && propertyId !== "default") {
                 setNotFound(true);
             } else {
                 setProperty(DEFAULT_PROPERTY);
             }
          }
        } else {
            setProperty(DEFAULT_PROPERTY);
        }
      } catch (error) {
        console.error("Property Fetch Error:", error);
        setNotFound(true);
      }

      // --- 2. TRY TO FETCH REVIEWS (Independent of Property) ---
      if (!propertyId?.toString().startsWith("mock_") && propertyId !== "default") {
          try {
            const reviewsRes = await axios.get(`http://localhost:5000/api/review/property/${propertyId}`);
            setReviews(reviewsRes.data.data || []);
          } catch (reviewError) {
            console.error("Review Fetch Error (Ignoring so page still loads):", reviewError.message);
            setReviews([]); // Default to 0 reviews if the backend route isn't working yet
          }
      }

      setLoading(false);
    };

    if (propertyId) fetchAllData();
  }, [propertyId]);

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-[#0C0E14] bg-[#FAF8F4] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="opacity-20">
          <Compass size={48} style={{ color: GOLD }} strokeWidth={1.25} />
        </motion.div>
      </div>
    );
  }

  // ── ERROR SCREEN IF DB FAILS TO FIND IT ──
  if (notFound || !property) {
      return (
        <div className="min-h-screen dark:bg-[#0C0E14] bg-[#FAF8F4] flex flex-col items-center justify-center space-y-4 px-6 text-center">
           <AlertCircle size={48} style={{ color: "#F06B6B" }} />
           <h2 className="text-3xl font-semibold text-[#F2EDE6]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Sanctuary Not Found</h2>
           <p className="text-white/50 text-sm max-w-sm">The property you are looking for does not exist, or the database failed to load it.</p>
           <a href="/home" className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>Return to Discovery</a>
        </div>
      );
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-screen dark:bg-[#0C0E14] bg-[#FAF8F4] transition-colors duration-300" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 lg:py-10 space-y-8">
        
        <div className="flex items-center justify-between">
          <a href="/home" className="flex items-center gap-2 text-sm font-medium dark:text-white/45 text-black/45 hover:text-black/70 dark:hover:text-white/75 transition-colors">
            <ArrowLeft size={14} strokeWidth={2} /> Discovery
          </a>
        </div>

        <HeroGallery images={property.images} title={property.title} />

        <div className="lg:grid lg:gap-14" style={{ gridTemplateColumns: "1fr 360px" }}>
          <div className="space-y-0 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-semibold leading-tight dark:text-[#F2EDE6] text-[#1A1712]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{property.title}</h1>
              <p className="mt-2 text-base italic dark:text-white/40 text-black/45" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{property.subtitle}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5"><MapPin size={13} style={{ color: GOLD }} /><span className="text-sm dark:text-white/45 text-black/50">{property.location}</span></div>
                <span className="dark:text-white/15 text-black/15 text-sm">·</span>
                <div className="flex items-center gap-2">
                  <StarRow rating={averageRating} size={13} />
                  <span className="text-sm font-semibold" style={{ color: GOLD }}>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
                  <span className="text-sm dark:text-white/30 text-black/35">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-px dark:bg-white/[0.07] bg-black/[0.07] my-10" />
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold dark:text-[#F2EDE6] text-[#1A1712] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Sanctuary</h2>
              <div className="space-y-4">{property.description.map((para, i) => <p key={i} className="text-sm leading-7 dark:text-white/58 text-black/60">{para}</p>)}</div>
            </div>

            <div className="w-full h-px dark:bg-white/[0.07] bg-black/[0.07] my-10" />

            {/* ── REAL REVIEWS SECTION ── */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold dark:text-[#F2EDE6] text-[#1A1712] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Guest Reflections</h2>
              
              {reviews.length === 0 ? (
                <div className="py-10 text-center border rounded-2xl border-dashed dark:border-white/10 border-black/10">
                  <MessageSquare size={32} className="mx-auto mb-3 dark:text-white/20 text-black/20" />
                  <p className="text-sm dark:text-white/40 text-black/45">No reflections yet. Be the first to share your experience.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, i) => <ReviewCard key={review._id || i} review={review} index={i} />)}
                </div>
              )}

              <AddReviewForm propertyId={property.id} onReviewAdded={(newReview) => setReviews((prev) => [newReview, ...prev])} />
            </div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <BookingCard property={property} />
          </div>
        </div>

        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }} className="lg:hidden fixed bottom-0 left-0 right-0 z-40 dark:bg-[#141720]/95 bg-white/95 backdrop-blur-md dark:border-t dark:border-white/[0.08] border-t border-black/[0.07] px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold" style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>{formatPrice(property.pricePerNight)}</span>
              <span className="text-xs dark:text-white/35 text-black/40">/ night</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} style={{ fill: GOLD, color: GOLD }} />
              <span className="text-xs font-medium" style={{ color: GOLD }}>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
            </div>
          </div>
          
          {property.isAvailable === false ? (
             <div className="px-6 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-1.5" style={{ backgroundColor: "rgba(240, 107, 107, 0.08)", borderColor: "rgba(240, 107, 107, 0.25)", color: "#F06B6B" }}>
                <AlertCircle size={14} /> Sold Out
             </div>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200" style={{ backgroundColor: GOLD, color: "#0C0E14" }}>
              Reserve Sanctuary
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}