import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroCarouselProps } from "@/types";

export function HeroCarousel({
  slides,
  autoplay = true,
  interval = 5000,
  className,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  const overlayClasses = {
    dark: "bg-black/50",
    light: "bg-white/30",
    gradient: "bg-gradient-to-r from-black/70 via-black/50 to-transparent",
  };

  const textPositionClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[650px] w-full ">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${s.backgroundImage})`,
                backgroundPosition: s.backgroundPosition || "center",
              }}
            />

            {/* Overlay */}
            {s.overlay && (
              <div
                className={cn("absolute inset-0", overlayClasses[s.overlay])}
              />
            )}

            {/* Content */}
            <div className="relative h-full container mx-auto px-4">
              <div
                className={cn(
                  "h-full flex flex-col justify-center gap-6 max-w-3xl",
                  textPositionClasses[s.textPosition || "left"],
                  s.textPosition === "center" ? "mx-auto" : ""
                )}
              >
                {/* Subtitle Badge */}
                <div className="animate-fade-in">
                  <span className="inline-block px-4 py-2 bg-accent/90 text-accent-foreground text-sm md:text-base font-semibold rounded-full shadow-medium">
                    {s.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] animate-fade-in animation-delay-100">
                  {s.title}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl leading-relaxed animate-fade-in animation-delay-200">
                  {s.description}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in animation-delay-300">
                  <Link to={s.ctaLink}>
                    <Button
                      size="xl"
                      variant="accent"
                      className="shadow-large hover:shadow-glow transition-shadow"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {s.ctaText}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  {s.secondaryCtaText && s.secondaryCtaLink && (
                    <Link to={s.secondaryCtaLink}>
                      <Button
                        size="xl"
                        variant="outline"
                        className="bg-white/90 border-white text-foreground hover:bg-white backdrop-blur-sm shadow-medium font-semibold"
                      >
                        {s.secondaryCtaText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-soft"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-soft"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
