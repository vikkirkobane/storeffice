import Image from "next/image";
import { MessageSquareQuote, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Liam Bennett",
    title: "Founder, Bright Concepts",
    quote: "The attention to detail in these resources is unmatched. They’ve streamlined our workflow significantly.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/n3lNV1QUrVcZHoGpnCI5OmEI-1.jpg",
  },
  {
    name: "Ethan Brooks",
    title: "Founder, InnovateHub",
    quote: "Each product shows deep insight into creators’ needs. Highly recommended for all.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/heQDx9TJWl2IGrgljtmXkzVz1C4-2.jpg",
  },
  {
    name: "James Carter",
    title: "Founder, Creative Studio",
    quote: "The products here have transformed how we approach design projects. Clean, modern, and easy to use!",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/NJFB98hjxcaEJhJwxxpmNVUPB0M-3.jpg",
  },
  {
    name: "Andrew Smith",
    title: "CEO, Zenith Enterprises",
    quote: "An exceptional tool that has helped us optimize costs without compromising quality.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/3sPsxVF695NE2w19yi9YFz9VwX4-4.jpg",
  },
  {
    name: "Michel Wilson",
    title: "CEO, Pixel Perfect Studio",
    quote: "The insights we gained from this platform have directly contributed to our product’s success.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/3FVQba5bsE7DxhAxVBRXXW9Gyg-5.jpg",
  },
  {
    name: "Chris Wilson",
    title: "CEO, Visionary Tech Co.",
    quote: "This service streamlined our processes and saved us countless hours. A must-have for growing businesses.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/4OLliUO2ACfZTDvgzeQ3AOmc-6.jpg",
  },
  {
    name: "Holand Gonze",
    title: "CEO, CloudCore Apps",
    quote: "Innovative features have taken our designs to the next level. Highly recommend it to any professional!",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/cDqnqaQejlFSmotA3EKJpNKO6dQ-7.jpg",
  },
  {
    name: "Michael Smith",
    title: "CEO, Innovate Digital",
    quote: "Efficiency and reliability at its best! Our team has greatly benefited from the seamless integration options.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/wVxDvYAiRCJtZUjBuDp3El9Qpo-8.jpg",
  },
  {
    name: "Michael Anderson",
    title: "CEO, CreativeX Solutions",
    quote: "Working with this platform has been a game-changer for our campaigns. The tools are intuitive.",
    avatarUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/0s7k9WgPK2onGdMgkWlXG2Nijuk-9.jpg",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-background py-[120px]">
      <div className="container max-w-[1120px]">
        <div className="mb-16 flex flex-col items-center gap-y-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#dce4ff] bg-[#f0f4ff] px-3 py-2 text-primary">
              <MessageSquareQuote className="h-4 w-4" />
              <span className="text-[13px] font-medium">Testimonial</span>
            </div>
            <h2 className="mt-4 max-w-lg">
              Hear How We’ve Made a Difference
            </h2>
          </div>
          <p className="max-w-sm text-lg-body">
            Discover how our solutions have transformed businesses and created lasting impacts through real customer experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-muted p-8 shadow-[0_4px_24px_rgba(26,31,58,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(26,31,58,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    className="h-14 w-14 rounded-full object-cover"
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <Quote className="h-10 w-10 shrink-0 text-border" />
              </div>
              <p className="mt-6 flex-grow text-regular-body text-muted-foreground">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;