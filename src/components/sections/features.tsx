import React from 'react';
import Image from 'next/image';

const featuresData = [
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/Olkttp0te2LSRHSi9NeWni9M75U-7.svg',
    title: 'Trendy Design',
    description: 'Sleek and modern aesthetics that match the latest design trends.',
    alt: 'Trendy Design icon showing layered stacks',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/ueuqDVhlCQJcg2Jy2wGQkk7vA-9.svg',
    title: 'Fully Customizable',
    description: 'Easily adjust colors, layouts, and elements to fit your project needs.',
    alt: 'Fully Customizable icon showing adjustment sliders',
  },
  {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/IiORAtKOLFnqE57qQxljSMmQwI8-8.svg',
    title: 'Cross-Platform',
    description: 'Works seamlessly on web, mobile, and tablet interfaces effortlessly.',
    alt: 'Cross-Platform icon showing multiple device screens',
  },
];

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  alt: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, alt }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Image src={icon} alt={alt} width={32} height={32} />
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-lg leading-[1.6] text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="bg-background py-16 lg:py-[120px]">
      <div className="container grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {featuresData.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default Features;