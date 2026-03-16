import Image from 'next/image';
import { Star, Layers, Download } from 'lucide-react';
import { FC, ReactNode } from 'react';

// A simple component to simulate animated particles
const Particles = () => (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute left-[10%] top-[20%] h-1 w-1 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '0s' }}></div>
        <div className="absolute left-[20%] top-[80%] h-0.5 w-0.5 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '1s' }}></div>
        <div className="absolute left-[45%] top-[40%] h-1 w-1 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '2s' }}></div>
        <div className="absolute left-[50%] top-[10%] h-0.5 w-0.5 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute left-[70%] top-[90%] h-1 w-1 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute left-[85%] top-[50%] h-1 w-1 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute left-[90%] top-1/4 h-0.5 w-0.5 animate-pulse rounded-full bg-white/70" style={{ animationDelay: '0.2s' }}></div>
    </div>
);

type StatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

const StatCard: FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="flex items-center gap-4">
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#E8EDF5] to-[#D4DBF0]">
      {icon}
    </div>
    <div>
      <h6 className="text-2xl font-bold text-[#1A1F3A] md:text-3xl">{value}</h6>
      <p className="whitespace-nowrap text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

const Hero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/p7UImHqCiGUdrHBxaFpV2BB8jI-2.svg"
                    alt="Linear background"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center top"
                    priority
                />
                <Particles />
            </div>

            <div className="container relative z-10 mx-auto px-5 pt-32 pb-24 sm:px-10 md:pt-40 md:pb-32">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">

                    <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:gap-8 lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#E9E9E9] bg-white/70 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span>Trusted by 1k+ enthusiast</span>
                        </div>

                        <h1 className="text-[40px] font-bold leading-tight tracking-tighter text-[#1A1F3A] sm:text-5xl lg:text-[64px] lg:leading-[1.1]">
                            Digital Resources To Transform Your Ideas
                        </h1>

                        <a
                           href="#"
                           className="mt-2 inline-block rounded-[10px] bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 ease-out hover:-translate-y-1"
                        >
                            Get Started
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-8 lg:items-start">
                        <p className="max-w-lg text-center text-lg text-muted-foreground lg:text-left">
                            Transform your ideas into reality with premium digital products crafted to inspire, empower, and elevate your vision.
                        </p>

                        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                            <StatCard
                                icon={<Layers className="h-6 w-6 text-primary" />}
                                value="50+"
                                label="Unique Products"
                            />
                             <StatCard
                                icon={<Download className="h-6 w-6 text-primary" />}
                                value="10k+"
                                label="Global Downloads"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;