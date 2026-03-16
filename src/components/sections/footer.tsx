import Image from 'next/image';
import {
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  ExternalLink,
  LayoutGrid,
} from 'lucide-react';

const Footer = () => {
  const framerLogoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/icons/wTVJYEnUWpDvsLc0qXkws5WAEIw-10.png";

  const pages = ["About", "Pricing", "Category", "Shop", "Company", "Contact"];
  const companyLinks = ["PixelCraft", "CodeWave", "DesignForg", "InnovateX"];
  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter (X)", icon: Twitter, href: "#" },
    { name: "Linkedin", icon: Linkedin, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
  ];

  return (
    <footer className="relative bg-[#F7F7F7] text-foreground">
      <div className="container mx-auto pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr] gap-x-8 gap-y-12 mb-16">
          {/* Column 1: Tagline */}
          <div className="pr-8">
            <h3 className="text-[32px] font-bold text-dark-navy leading-snug">
              Great design is not just seen, it's experienced.
            </h3>
          </div>

          {/* Column 2: Pages */}
          <div>
            <h4 className="font-semibold text-lg text-dark-navy mb-5">Pages</h4>
            <ul className="space-y-3">
              {pages.map((page) => (
                <li key={page}>
                  <a href="#" className="text-base text-medium-gray hover:text-primary transition-colors">
                    {page}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-semibold text-lg text-dark-navy mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-base text-medium-gray hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h4 className="font-semibold text-lg text-dark-navy mb-5">Social</h4>
            <ul className="space-y-4">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a href={social.href} className="flex items-center gap-3 text-base text-medium-gray hover:text-primary transition-colors">
                    <social.icon size={20} />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col-reverse md:flex-row justify-between items-center text-center md:text-left gap-6">
          <p className="text-sm text-medium-gray">Diglet© 2025 . All Rights Reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-medium-gray hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-medium-gray hover:text-primary transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>

      {/* Fixed Buttons */}
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 flex flex-col items-end gap-3 z-40">
        <a 
          href="#" 
          className="bg-white text-dark-navy text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border"
        >
          <ExternalLink size={16} />
          Get This Template $29
        </a>
        <a 
          href="#" 
          className="bg-accent-purple text-primary-foreground text-sm font-semibold flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-[0_4px_14px_0_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_0_rgba(139,92,246,0.2)] transition-shadow"
        >
          <LayoutGrid size={16} />
          Access More Templates
        </a>
        
        <a 
          href="#" 
          className="bg-white text-dark-navy text-xs font-medium flex items-center gap-2 px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-shadow border border-border"
        >
          <Image src={framerLogoUrl} alt="Framer Logo" width={14} height={14} />
          Made in Framer
        </a>
      </div>
    </footer>
  );
};

export default Footer;