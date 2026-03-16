import Image from 'next/image';

const products = [
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/Y23NZDdBtZUOSEoQyt7PJvf0Xc-3.svg",
    alt: "Money Transfer & Savings",
    width: 336,
    height: 218,
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/dxUiSWhuAOck0jTplhadt07M7k-1.png",
    alt: "Short Video Generator",
    width: 1008,
    height: 654,
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/N18ArrHs0LVNPUMsHFfgupFk-2.png",
    alt: " Next-Gen CRM Solution",
    width: 1344,
    height: 654,
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/images/CBnrk2ujbPwv1pHf5QaIUJGtTWQ-3.png",
    alt: "All-in-One Feedback Hub",
    width: 768,
    height: 654,
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/2b706d32-6f03-40fd-afb4-45b21bcc8b50-diglet-framer-ai/assets/svgs/XzO7R8Ij4a4mjOIz9uhvTbD2IU-4.svg",
    alt: "Business Growth Software",
    width: 256,
    height: 218,
  },
];

const ProductCarouselTop = () => {
    // Duplicating a few times to match the original DOM structure and ensure a smooth infinite scroll.
    const duplicatedProducts = [...products, ...products, ...products, ...products];

    return (
        <section className="w-full overflow-hidden">
            <style>
            {`
                @keyframes scroll-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-25%); }
                }
            `}
            </style>
            <ul
                className="flex animate-[scroll-left_40s_linear_infinite]"
                aria-hidden="true" 
            >
                {duplicatedProducts.map((product, index) => (
                    <li key={index} className="flex-shrink-0 px-3">
                        <figure className="rounded-lg shadow-[0_4px_24px_rgba(26,31,58,0.08)] overflow-hidden h-[218px] flex items-center justify-center bg-white">
                             <Image
                                src={product.src}
                                alt={product.alt}
                                width={product.width}
                                height={product.height}
                                className="object-contain h-full w-auto"
                            />
                        </figure>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ProductCarouselTop;