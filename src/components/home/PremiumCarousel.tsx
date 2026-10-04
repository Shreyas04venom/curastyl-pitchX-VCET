"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scissors,
  Palette,
  Crown,
  Star,
  ArrowRight,
  Play,
  Pause,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselSlide {
  id: number;
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  image: string;
  cta: string;
  secondaryCta?: string;
  link: string;
  secondaryLink?: string;
  gradientOverlay: string;
  accentGlow: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  rating: string;
  reviews: string;
  priceStarts: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    shortTitle: "Bridal Glam",
    title: "Premium Bridal Makeover",
    subtitle: "Your Dream Wedding Look Awaits",
    description: "Expert celebrity stylists, luxury makeup brands, and bespoke bridal packages tailored for your biggest day.",
    highlights: ["HD & Airbrush Bridal", "Pre-Bridal Glow Rituals", "Hairstyling & Saree Draping"],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&auto=format&fit=crop&q=85",
    cta: "Book Bridal Package",
    secondaryCta: "Explore Salons",
    link: "/salons?service=Bridal%20Makeup",
    secondaryLink: "/salons",
    gradientOverlay: "from-[#14041e]/95 via-[#14041e]/75 to-transparent",
    accentGlow: "from-pink-500 via-rose-500 to-purple-600",
    icon: Crown,
    tag: "Wedding Special",
    rating: "4.98",
    reviews: "3.2k+",
    priceStarts: "₹4,999",
  },
  {
    id: 2,
    shortTitle: "Hair Studio",
    title: "Luxury Hair Transformations",
    subtitle: "Mumbai's Premier Hair Stylists",
    description: "Transform your hair with certified color masters, balayage perfectionists, and deep nourishing keratin therapies.",
    highlights: ["Balayage & Ombre", "Keratin & Botox Care", "Precision Designer Cuts"],
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1920&auto=format&fit=crop&q=85",
    cta: "Explore Hair Services",
    secondaryCta: "View Top Stylists",
    link: "/salons?service=Hair%20Color",
    secondaryLink: "/salons",
    gradientOverlay: "from-[#0f0426]/95 via-[#0f0426]/75 to-transparent",
    accentGlow: "from-violet-500 via-purple-500 to-fuchsia-600",
    icon: Scissors,
    tag: "Trending Now",
    rating: "4.93",
    reviews: "4.8k+",
    priceStarts: "₹799",
  },
  {
    id: 3,
    shortTitle: "Skin & Facials",
    title: "Radiant Skin & Glow Treatments",
    subtitle: "Advanced Clinical & Organic Skincare",
    description: "Rejuvenate your skin barrier with clinical hydrafacials, LED phototherapy, and curated natural peel therapies.",
    highlights: ["Hydra-Oxygen Facial", "D-Tan & Brightening", "Acne & Pore Care"],
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1920&auto=format&fit=crop&q=85",
    cta: "Book Facial Session",
    secondaryCta: "Skin AI Match",
    link: "/salons?service=Facial",
    secondaryLink: "/ai-assistant",
    gradientOverlay: "from-[#041524]/95 via-[#041524]/75 to-transparent",
    accentGlow: "from-cyan-500 via-blue-500 to-teal-500",
    icon: Sparkles,
    tag: "Instant Glow",
    rating: "4.91",
    reviews: "2.1k+",
    priceStarts: "₹1,299",
  },
  {
    id: 4,
    shortTitle: "Makeup Artistry",
    title: "Professional Makeup Artistry",
    subtitle: "Glam Up for Every Occasion",
    description: "Flawless red-carpet look, cocktail glam, or natural dewy party makeup crafted by top Mumbai artists.",
    highlights: ["Cocktail & Party Looks", "High-Definition Airbrush", "Celebrity Signature Style"],
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1920&auto=format&fit=crop&q=85",
    cta: "Book Makeup Artist",
    secondaryCta: "Browse Looks",
    link: "/salons?service=Makeup",
    secondaryLink: "/salons",
    gradientOverlay: "from-[#220417]/95 via-[#220417]/75 to-transparent",
    accentGlow: "from-rose-500 via-pink-500 to-fuchsia-500",
    icon: Palette,
    tag: "Most Booked",
    rating: "4.97",
    reviews: "5.4k+",
    priceStarts: "₹2,499",
  },
  {
    id: 5,
    shortTitle: "Spa & Wellness",
    title: "Luxury Spa & Rejuvenation",
    subtitle: "Escape The Rush, Restore Your Mind",
    description: "Immerse yourself in authentic Swedish massage, holistic aromatherapy, and revitalizing body polishing rituals.",
    highlights: ["Deep Tissue Massage", "Aromatherapy Detox", "Full Body Polishing"],
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&auto=format&fit=crop&q=85",
    cta: "Book Spa Session",
    secondaryCta: "View Spa Offers",
    link: "/salons?service=Spa%20Packages",
    secondaryLink: "/offers",
    gradientOverlay: "from-[#041b14]/95 via-[#041b14]/75 to-transparent",
    accentGlow: "from-emerald-500 via-teal-500 to-green-500",
    icon: Sparkles,
    tag: "Relaxation",
    rating: "4.95",
    reviews: "1.9k+",
    priceStarts: "₹1,999",
  },
];

const SLIDE_DURATION = 5500; // 5.5 seconds per slide

export default function PremiumCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(nextSlide, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Threshold of 45px for a swipe
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const activeSlideData = CAROUSEL_SLIDES[currentSlide];

  return (
    <section
      aria-label="Featured Salon Highlights"
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Main Banner Stage ────────────────────────────────────────────── */}
      <div className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] overflow-hidden">
        {/* Background Layers for all slides (crossfading) */}
        {CAROUSEL_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;

          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              {/* Background Image with slow cinematic scale */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-full transition-transform duration-[7000ms] ease-out",
                  isActive ? "scale-105" : "scale-100"
                )}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover object-center"
                  priority={idx === 0}
                  sizes="100vw"
                  quality={88}
                />
              </div>

              {/* Dynamic Gradients */}
              {/* Primary directional dark gradient to ensure text readability */}
              <div className={cn("absolute inset-0 bg-gradient-to-r", slide.gradientOverlay)} />

              {/* Subtle top & bottom shadow gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/60 pointer-events-none" />

              {/* Ambient radial accent light */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />
            </div>
          );
        })}

        {/* ── Foreground Content ────────────────────────────────────────── */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl lg:max-w-3xl pt-8 pb-16 sm:pb-20">
            {/* Tag & Rating row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-400/30 text-purple-200 text-xs font-semibold shadow-lg shadow-purple-500/10">
                <activeSlideData.icon className="w-3.5 h-3.5 text-purple-400" />
                {activeSlideData.tag}
              </span>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-white">{activeSlideData.rating}</span>
                <span className="text-white/60">({activeSlideData.reviews})</span>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/50 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Salons
              </span>
            </div>

            {/* Main Title */}
            <h1
              key={`title-${currentSlide}`}
              className="text-2xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-2 drop-shadow-md animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              {activeSlideData.title}
            </h1>

            {/* Subtitle with dynamic accent glow */}
            <p
              key={`sub-${currentSlide}`}
              className="text-sm sm:text-xl md:text-2xl font-medium text-purple-200/90 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-600"
            >
              {activeSlideData.subtitle}
            </p>

            {/* Description */}
            <p
              key={`desc-${currentSlide}`}
              className="text-xs sm:text-sm md:text-base text-white/70 max-w-xl mb-5 leading-relaxed hidden sm:block animate-in fade-in slide-in-from-bottom-5 duration-700"
            >
              {activeSlideData.description}
            </p>

            {/* Feature Highlights (Glass Chips) */}
            <div
              key={`chips-${currentSlide}`}
              className="flex flex-wrap gap-2 mb-5 sm:mb-7 animate-in fade-in slide-in-from-bottom-5 duration-700"
            >
              {activeSlideData.highlights.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-[11px] sm:text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {item}
                </span>
              ))}
            </div>

            {/* CTA Group */}
            <div
              key={`cta-${currentSlide}`}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 animate-in fade-in slide-in-from-bottom-6 duration-700"
            >
              <Link href={activeSlideData.link}>
                <Button
                  size="lg"
                  className={cn(
                    "h-11 sm:h-14 px-5 sm:px-9 text-xs sm:text-base font-bold rounded-full shadow-2xl transition-all duration-300 gap-2 group relative overflow-hidden",
                    "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:scale-[1.03] active:scale-[0.98]",
                    "shadow-purple-500/30 hover:shadow-purple-500/50 text-white border border-purple-400/30"
                  )}
                >
                  <span>{activeSlideData.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              {activeSlideData.secondaryCta && activeSlideData.secondaryLink && (
                <Link href={activeSlideData.secondaryLink}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 sm:h-14 px-4 sm:px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-base backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {activeSlideData.secondaryCta}
                  </Button>
                </Link>
              )}

              {/* Price Callout */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-white/80 backdrop-blur-md">
                <span className="text-white/40">Starts:</span>
                <span className="font-bold text-emerald-400">{activeSlideData.priceStarts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Arrows (Desktop & Tablet) ────────────────────────── */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-purple-600/80 border border-white/20 hover:border-purple-400/50 text-white items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-black/50 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-purple-600/80 border border-white/20 hover:border-purple-400/50 text-white items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-black/50 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* ── Bottom Controls & Category Pills Bar ──────────────────────── */}
        <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-30 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Quick-Jump Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
              {CAROUSEL_SLIDES.map((slide, index) => {
                const isActive = index === currentSlide;
                const SlideIcon = slide.icon;

                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 shrink-0 whitespace-nowrap backdrop-blur-md",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/40 scale-105"
                        : "bg-black/50 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
                    )}
                  >
                    <SlideIcon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-white/60")} />
                    <span>{slide.shortTitle}</span>

                    {/* Progress bar inside active pill */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white/40 rounded-full overflow-hidden">
                        <span
                          key={`prog-${currentSlide}-${isPaused}`}
                          className="block h-full bg-white rounded-full animate-progress"
                          style={{
                            animationDuration: `${SLIDE_DURATION}ms`,
                            animationPlayState: isPaused ? "paused" : "running",
                          }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Play/Pause & Slide Counter controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/70">
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="hover:text-white transition-colors p-0.5 rounded-full"
                title={isPaused ? "Resume auto-play" : "Pause auto-play"}
                aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              </button>

              <span className="w-[1px] h-3 bg-white/20" />

              <span className="font-mono text-[11px] tracking-widest text-white/90">
                0{currentSlide + 1} <span className="text-white/40">/</span> 0{CAROUSEL_SLIDES.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
