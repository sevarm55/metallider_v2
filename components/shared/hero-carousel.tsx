"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { heroSlides } from "@/lib/mock-data";

export function HeroCarousel() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      className="w-full"
    >
      <CarouselContent>
        {heroSlides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative h-[300px] overflow-hidden rounded-xl sm:h-[400px] lg:h-[480px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="px-8 sm:px-12 lg:px-16 max-w-2xl">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  <p className="mt-3 text-sm text-white/80 sm:text-base lg:text-lg">
                    {slide.subtitle}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Link href={slide.buttonHref}>{slide.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
