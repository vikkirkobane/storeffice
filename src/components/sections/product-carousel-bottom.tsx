'use client';

import Image from "next/image";

const products = [
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/JGh2D3MbO1Hr26EXCdQPWqCIk-5.svg",
    alt: "Record, Edit & Share Platform",
    width: "336px",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/C2udKqwjKOmBBwNZt3dDla63is-4.png",
    alt: "Handyman Service App",
    width: "512px",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/HKwPus0cIvPrEUqot2AU3n5hgs-5.png",
    alt: "File Management System",
    width: "400px",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/AeCKUF6s6BYHRkU0DCMXs7gPNI4-6.png",
    alt: "AI-Powered Meeting Recorder",
    width: "512px",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/LOLAtqdeajolUWScDb0oqXM0EVE-6.svg",
    alt: "Research Participant Finder",
    width: "256px",
  },
];

const ProductCarouselBottom = () => {
    return (
        <section className="mt-6 w-full overflow-hidden">
            <style>
                {`
                    @keyframes scrollReverse {
                      from { transform: translateX(-50%); }
                      to { transform: translateX(0); }
                    }
                    .animate-scroll-reverse {
                      animation: scrollReverse 40s linear infinite;
                    }
                `}
            </style>
            <ul className="flex items-center gap-6 w-max animate-scroll-reverse will-change-transform">
                {[...products, ...products].map((product, index) => (
                    <li
                        key={index}
                        className="flex-shrink-0"
                        style={{ width: product.width }}
                    >
                        <figure className="relative h-[218px] w-full rounded-2xl shadow-[0_4px_24px_rgba(26,31,58,0.08)] overflow-hidden bg-white">
                            <Image
                                src={product.src}
                                alt={product.alt}
                                layout="fill"
                                objectFit="cover"
                            />
                        </figure>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ProductCarouselBottom;