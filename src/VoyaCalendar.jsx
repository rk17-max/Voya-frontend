import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RotateCcw, 
  Sparkles,
  Info
} from "lucide-react";
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  isBefore, 
  isAfter, 
  isWithinInterval, 
  differenceInCalendarDays, 
  parseISO, 
  startOfDay 
} from "date-fns";

/* ==========================================================================
   1. VOYA DESIGN TOKENS
   ========================================================================== */
const TOKENS = {
  bgMain: "#141720",
  bgBody: "#0C0E14",
  textPrimary: "#F2EDE6",
  textMuted: "rgba(242, 237, 230, 0.42)",
  textBlocked: "rgba(242, 237, 230, 0.18)",
  goldPrimary: "#C8A97E",
  goldHover: "#D6BC96",
  goldWash: "rgba(200, 169, 126, 0.12)",
  goldWashStrong: "rgba(200, 169, 126, 0.22)",
  borderSubtle: "rgba(255, 255, 255, 0.07)",
  borderStrong: "rgba(200, 169, 126, 0.35)",
};

/* ==========================================================================
   2. HELPER FUNCTIONS
   ========================================================================== */
const normalizeToStartOfDay = (dateInput) => {
  if (!dateInput) return null;
  const parsed = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  return startOfDay(parsed);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/* ==========================================================================
   3. FRAMER MOTION ANIMATION VARIANTS
   ========================================================================== */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.15 },
    },
  }),
};

const summaryVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  exit: { opacity: 0, y: 12, transition: { duration: 0.15 } }
};

/* ==========================================================================
   4. SUB-COMPONENT: MONTH GRID
   ========================================================================== */
const MonthGrid = ({
  monthDate,
  checkIn,
  checkOut,
  hoverDate,
  bookedSet,
  onDayClick,
  onDayHover,
  today,
}) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex flex-col select-none">
      {/* Month Heading */}
      <div className="h-12 flex items-center justify-center mb-2">
        <h3 
          className="text-lg font-normal tracking-wide text-[#F2EDE6]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {format(monthDate, "MMMM yyyy")}
        </h3>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 mb-3 text-center">
        {weekDays.map((day, idx) => (
          <span 
            key={idx} 
            className="text-xs font-medium tracking-wider uppercase"
            style={{ color: TOKENS.textMuted, fontFamily: "'Inter', sans-serif" }}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Matrix */}
      <div className="grid grid-cols-7 gap-y-1.5 relative z-10">
        {days.map((dayStr) => {
          const day = dayStr;
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isPast = isBefore(day, today);
          const timeKey = day.getTime();
          const isBooked = bookedSet.has(timeKey);
          const isDisabled = !isCurrentMonth || isPast || isBooked;

          const isSelectedCheckIn = checkIn && isSameDay(day, checkIn);
          const isSelectedCheckOut = checkOut && isSameDay(day, checkOut);
          const isSelected = isSelectedCheckIn || isSelectedCheckOut;

          // Range logic
          const activeEnd = checkOut || hoverDate;
          const isInRange = checkIn && activeEnd && isAfter(activeEnd, checkIn) && 
                            isWithinInterval(day, { start: checkIn, end: activeEnd }) &&
                            !isSelected;

          // Hover connection preview ends
          const isTentative = !checkOut && hoverDate && isInRange;

          return (
            <div 
              key={day.toISOString()} 
              className="relative h-10 flex items-center justify-center"
              onMouseEnter={() => !isDisabled && onDayHover(day)}
            >
              {/* Background Wash Connectors (Pill Link Effect) */}
              {isCurrentMonth && (
                <>
                  {(isInRange || isSelectedCheckOut || (isSelectedCheckIn && activeEnd && isAfter(activeEnd, checkIn))) && (
                    <div 
                      className={`absolute top-1 bottom-1 ${isSelectedCheckIn ? 'left-1/2 right-0' : isSelectedCheckOut ? 'left-0 right-1/2' : 'inset-x-0'}`}
                      style={{ 
                        backgroundColor: isTentative ? TOKENS.goldWash : TOKENS.goldWashStrong,
                        transition: "background-color 0.15s ease"
                      }}
                    />
                  )}
                </>
              )}

              {/* Day Interactive Circle */}
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onDayClick(day)}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 z-10 ${
                  !isCurrentMonth 
                    ? "opacity-0 pointer-events-none" 
                    : isDisabled 
                    ? "cursor-not-allowed" 
                    : "cursor-pointer"
                }`}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isSelected 
                    ? TOKENS.bgMain 
                    : isDisabled 
                    ? TOKENS.textBlocked 
                    : TOKENS.textPrimary,
                  backgroundColor: isSelected ? TOKENS.goldPrimary : "transparent",
                  fontWeight: isSelected ? 600 : isToday(day) ? 600 : 400,
                  boxShadow: isSelected ? "0 0 16px rgba(200, 169, 126, 0.45)" : "none",
                }}
              >
                {/* Available Date Hover Ring */}
                {!isDisabled && !isSelected && (
                  <span className="absolute inset-1 rounded-full border border-transparent hover:border-[#C8A97E]/60 transition-colors duration-150" />
                )}

                {/* Date Number */}
                <span className={isBooked ? "line-through decoration-white/30" : ""}>
                  {format(day, "d")}
                </span>

                {/* Today Indicator Dot */}
                {isToday(day) && !isSelected && (
                  <span 
                    className="absolute bottom-1.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: TOKENS.goldPrimary }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   5. MASTER ORCHESTRATOR: VoyaCalendar
   ========================================================================== */
export default function VoyaCalendar({
  pricePerNight = 32000,
  bookedDates = [],
  onRangeSelect,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  
  // Navigation State
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [direction, setDirection] = useState(1);

  // Selection State
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // Convert bookedDates to lookup set of timestamps
  const bookedSet = useMemo(() => {
    const set = new Set();
    bookedDates.forEach((d) => {
      const norm = normalizeToStartOfDay(d);
      if (norm) set.add(norm.getTime());
    });
    return set;
  }, [bookedDates]);

  // Check if any booked dates exist strictly between two candidate dates
  const hasBookedConflict = useCallback((start, end) => {
    if (!start || !end || isBefore(end, start)) return false;
    const intervalDays = eachDayOfInterval({ start, end });
    return intervalDays.some(day => bookedSet.has(day.getTime()));
  }, [bookedSet]);

  /* --------------------------------------------------------------------------
     Navigation Handlers
     -------------------------------------------------------------------------- */
  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  /* --------------------------------------------------------------------------
     Selection Logic (Airbnb Click-Click Pattern)
     -------------------------------------------------------------------------- */
  const handleDayClick = useCallback((clickedDay) => {
    // 1. If nothing selected OR range already complete -> Start fresh Check-In
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clickedDay);
      setCheckOut(null);
      if (onRangeSelect) {
        onRangeSelect({ checkIn: clickedDay, checkOut: null, totalNights: 0, totalPrice: 0 });
      }
      return;
    }

    // 2. If clicked date is before Check-In -> Reset Check-In to clicked date
    if (isBefore(clickedDay, checkIn)) {
      setCheckIn(clickedDay);
      return;
    }

    // 3. If clicked date equals Check-In -> Deselect
    if (isSameDay(clickedDay, checkIn)) {
      setCheckIn(null);
      setHoverDate(null);
      if (onRangeSelect) {
        onRangeSelect({ checkIn: null, checkOut: null, totalNights: 0, totalPrice: 0 });
      }
      return;
    }

    // 4. Validate no booked dates exist between Check-In and tentative Check-Out
    if (hasBookedConflict(checkIn, clickedDay)) {
      // Treat as new Check-In instead of throwing jarring error
      setCheckIn(clickedDay);
      return;
    }

    // 5. Successful Check-Out Selection
    setCheckOut(clickedDay);
    setHoverDate(null);

    const nights = differenceInCalendarDays(clickedDay, checkIn);
    const total = nights * pricePerNight;

    if (onRangeSelect) {
      onRangeSelect({
        checkIn,
        checkOut: clickedDay,
        totalNights: nights,
        totalPrice: total,
      });
    }
  }, [checkIn, checkOut, hasBookedConflict, onRangeSelect, pricePerNight]);

  const handleDayHover = useCallback((day) => {
    if (checkIn && !checkOut) {
      // Only hover-highlight if hovering forward and no conflicts
      if (isAfter(day, checkIn) && !hasBookedConflict(checkIn, day)) {
        setHoverDate(day);
      } else {
        setHoverDate(null);
      }
    }
  }, [checkIn, checkOut, hasBookedConflict]);

  const handleReset = () => {
    setCheckIn(null);
    setCheckOut(null);
    setHoverDate(null);
    if (onRangeSelect) {
      onRangeSelect({ checkIn: null, checkOut: null, totalNights: 0, totalPrice: 0 });
    }
  };

  /* --------------------------------------------------------------------------
     Calculations
     -------------------------------------------------------------------------- */
  const totalNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInCalendarDays(checkOut, checkIn);
  }, [checkIn, checkOut]);

  const totalPrice = totalNights * pricePerNight;
  const nextMonth = useMemo(() => addMonths(currentMonth, 1), [currentMonth]);

  return (
    <div 
      className="w-full max-w-4xl mx-auto rounded-2xl p-6 md:p-8 border relative overflow-hidden shadow-2xl"
      style={{ 
        backgroundColor: TOKENS.bgMain, 
        borderColor: TOKENS.borderSubtle,
        boxShadow: "0 24px 50px -12px rgba(0, 0, 0, 0.5)" 
      }}
    >
      {/* Top Ambient Glow */}
      <div 
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: TOKENS.goldPrimary }}
      />

      {/* =====================================================================
          HEADER SECTION & CONTROLS
          ===================================================================== */}
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/[0.07] relative z-10">
        <div className="flex items-center gap-2.5">
          <CalendarIcon size={18} style={{ color: TOKENS.goldPrimary }} />
          <span 
            className="text-xs font-semibold uppercase tracking-widest text-[#F2EDE6]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Select Dates
          </span>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isBefore(currentMonth, startOfMonth(today))}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:border-[#C8A97E] hover:bg-white/[0.02]"
            style={{ borderColor: TOKENS.borderSubtle, color: TOKENS.textPrimary }}
            aria-label="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:border-[#C8A97E] hover:bg-white/[0.02]"
            style={{ borderColor: TOKENS.borderSubtle, color: TOKENS.textPrimary }}
            aria-label="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* =====================================================================
          DUAL MONTH CAROUSEL
          ===================================================================== */}
      <div className="relative overflow-hidden min-h-[340px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentMonth.toISOString()}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
          >
            {/* Left Calendar: Current Month */}
            <MonthGrid
              monthDate={currentMonth}
              checkIn={checkIn}
              checkOut={checkOut}
              hoverDate={hoverDate}
              bookedSet={bookedSet}
              onDayClick={handleDayClick}
              onDayHover={handleDayHover}
              today={today}
            />

            {/* Right Calendar: Consecutive Month (Hidden on mobile viewport) */}
            <div className="hidden md:block">
              <MonthGrid
                monthDate={nextMonth}
                checkIn={checkIn}
                checkOut={checkOut}
                hoverDate={hoverDate}
                bookedSet={bookedSet}
                onDayClick={handleDayClick}
                onDayHover={handleDayHover}
                today={today}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =====================================================================
          FOOTER CALCULATION & SUMMARY BAR
          ===================================================================== */}
      <div className="mt-8 pt-6 border-t border-white/[0.07] min-h-[72px] flex items-center justify-between relative z-10">
        <AnimatePresence mode="wait">
          {!checkIn ? (
            /* State A: Prompt */
            <motion.div 
              key="prompt"
              variants={summaryVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-2 text-sm"
              style={{ color: TOKENS.textMuted, fontFamily: "'Inter', sans-serif" }}
            >
              <Info size={16} className="text-[#C8A97E]" />
              <span>Select a Check-In date to begin your reservation.</span>
            </motion.div>
          ) : !checkOut ? (
            /* State B: Partial */
            <motion.div 
              key="partial"
              variants={summaryVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3"
            >
              <div 
                className="px-3 py-1 rounded-md text-xs font-medium bg-[#C8A97E]/15 text-[#C8A97E] border border-[#C8A97E]/30"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Check-In: {format(checkIn, "MMM d, yyyy")}
              </div>
              <span className="text-sm text-white/50 animate-pulse">
                Select Check-Out date...
              </span>
            </motion.div>
          ) : (
            /* State C: Complete Breakdown */
            <motion.div 
              key="complete"
              variants={summaryVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-wrap items-center justify-between w-full gap-4"
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5 font-sans">
                    Duration
                  </p>
                  <p className="text-base font-medium text-[#F2EDE6] font-sans flex items-center gap-1.5">
                    <Sparkles size={15} className="text-[#C8A97E]" />
                    {totalNights} {totalNights === 1 ? "Night" : "Nights"}
                  </p>
                </div>

                <div className="h-8 w-[1px] bg-white/10" />

                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5 font-sans">
                    Total Investment
                  </p>
                  <p 
                    className="text-xl font-semibold text-[#C8A97E] tracking-tight"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatCurrency(totalPrice)}
                    <span className="text-xs font-normal text-white/40 ml-1.5">
                      ({formatCurrency(pricePerNight)} / night)
                    </span>
                  </p>
                </div>
              </div>

              {/* Reset CTA */}
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 text-white/50 hover:text-white hover:bg-white/[0.05]"
              >
                <RotateCcw size={13} />
                <span>Reset Dates</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}