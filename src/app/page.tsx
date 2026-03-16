import Navigation from "@/components/sections/navigation";
import Hero from "@/components/sections/hero";
import ProductCarouselTop from "@/components/sections/product-carousel-top";
import ProductCarouselBottom from "@/components/sections/product-carousel-bottom";
import Features from "@/components/sections/features";
import ProductsGrid from "@/components/sections/products-grid";
import Testimonials from "@/components/sections/testimonials";
import FaqSection from "@/components/sections/faq";
import CtaSection from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <div className="flex flex-col">
        <Hero />
        
        <div className="w-full py-12 md:py-16 lg:py-20">
          <ProductCarouselTop />
          <ProductCarouselBottom />
        </div>
        
        <Features />
        
        <ProductsGrid />
        
        <Testimonials />
        
        <FaqSection />
        
        <CtaSection />
        
        <Footer />
      </div>
    </main>
  );
}