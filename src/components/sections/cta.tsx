import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  "Fully Customizable",
  "Ongoing Updates",
  "200+ Ready Use Products",
];

const CtaSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#E8EDF5] to-[#D4DBF0] py-24 lg:py-32">
      {/* Decorative images for large screens */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {/* Card 1: Find research participants */}
        <div className="absolute top-[76.5px] -left-32 w-[336px] -rotate-15">
          <Image
            src="https://framerusercontent.com/images/S5P668Jd41j9yWvC1u2C4P490.png"
            alt="Find research participants with a click"
            width={816}
            height={448}
            className="rounded-xl shadow-2xl"
          />
        </div>
        {/* Card 2: SVG snippet */}
        <div className="absolute bottom-[56.5px] left-72 w-[272px] rotate-5">
          <Image
            src="https://framerusercontent.com/images/3fWJ7C0F4g8O5qE4Xk0F8dKk.svg"
            alt="Product card snippet"
            width={272}
            height={218}
            className="rounded-xl bg-white shadow-2xl"
          />
        </div>
        {/* Card 3: Boost Business */}
        <div className="absolute top-[86.5px] -right-28 w-[336px] rotate-15">
          <Image
            src="https://framerusercontent.com/images/k7P7V4g0T8O4Y2X1l1w4N3p5w.png"
            alt="Boost Business All-in-One Software"
            width={776}
            height={427}
            className="rounded-xl shadow-2xl"
          />
        </div>
        {/* Card 4: One hub */}
        <div className="absolute bottom-[56.5px] right-80 w-[288px] -rotate-5">
          <Image
            src="https://framerusercontent.com/images/uN2jQ1h0T0y4P6y3R5o7C8v1E.svg"
            alt="One hub for all your feedback"
            width={288}
            height={210}
            className="rounded-xl bg-white shadow-2xl"
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center px-5 text-center">
        <h2 className="text-4xl font-bold text-dark-navy md:text-5xl" style={{ lineHeight: 1.2 }}>
          Transform Your Ideas Into Reality
        </h2>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/30">
                <Check className="h-3 w-3 text-dark-navy" />
              </div>
              <p className="text-base font-medium text-medium-gray">{feature}</p>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="mt-10 h-auto bg-primary-blue px-8 py-[14px] font-semibold text-primary-foreground transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-primary-blue/90"
          style={{ boxShadow: '0 2px 8px rgba(0, 102, 255, 0.24)' }}
        >
          Get Started
        </Button>
      </div>
    </section>
  );
};

export default CtaSection;