"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "bg-white border border-border rounded-xl shadow-[0_2px_8px_0_rgba(26,31,58,0.04)]",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between px-8 py-6 text-left text-lg font-semibold text-dark-navy transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-base transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("px-8 pb-6 pt-0 text-medium-gray leading-relaxed", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const faqData = [
  {
    value: "item-1",
    question: "Are the products customizable?",
    answer: "Yes, our products are fully customizable. You can easily adjust colors, layouts, and elements to fit your specific project needs and branding guidelines."
  },
  {
    value: "item-2",
    question: "How do I purchase a product?",
    answer: "To purchase a product, simply browse our collection, select the item you want, and click the 'Buy Now' or 'Add to Cart' button. Follow the on-screen instructions to complete your purchase through our secure checkout process."
  },
  {
    value: "item-3",
    question: "What types of digital products can I find on this website?",
    answer: "We offer a wide range of digital products, including UI kits, website templates, mobile app designs, branding assets, illustrations, and more, all designed to help creators and businesses."
  },
  {
    value: "item-4",
    question: "Can I get a refund if the product doesn’t meet my expectations?",
    answer: "We strive for customer satisfaction. Please review our refund policy on the terms and conditions page. Generally, due to the digital nature of our products, refunds are handled on a case-by-case basis."
  },
  {
    value: "item-5",
    question: "Do I need any special software to use the products?",
    answer: "The software requirements vary by product. Each product page lists the necessary software (e.g., Figma, Sketch, Adobe XD). Most of our products are designed to be used with popular and accessible design tools."
  },
  {
    value: "item-6",
    question: "Can I sell my products on this website?",
    answer: "We are always looking for talented creators to join our marketplace. If you are interested in selling your products with us, please visit our 'Become a Creator' page for more information and to submit your application."
  },
  {
    value: "item-7",
    question: "Is there customer support available if I face issues?",
    answer: "Absolutely! We offer dedicated customer support. If you encounter any issues or have questions, you can reach out to our support team through the contact form, and we'll be happy to assist you."
  }
];

const FaqSection = () => {
  return (
    <section className="bg-background py-[60px] md:py-[80px] lg:py-[120px]">
      <div className="container mx-auto flex flex-col items-center px-5 md:px-10 lg:px-20">
        <div className="mb-[60px] flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E8EDF5] bg-[#F8FAFC] py-1.5 px-4">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <div className="max-w-xl">
            <h2 className="text-dark-navy">Got Questions?</h2>
            <h2 className="text-dark-navy">We’ve Got Answers!</h2>
          </div>
        </div>

        <div className="w-full max-w-[800px]">
          <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
            {faqData.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;