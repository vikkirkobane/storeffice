export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Storeffice</h1>
        <div className="prose prose-indigo max-w-none">
          <p className="text-lg text-gray-600 mb-4">
            Storeffice is a dual-purpose marketplace that connects office space owners, storage providers, merchants, and customers.
            Our mission is to make flexible workspace and product commerce accessible to everyone.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2025, Storeffice emerged from the need for a unified platform where businesses could list their spaces
            and individuals could discover both work environments and quality products in one place.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Enable office and storage space owners to list and rent their properties.</li>
            <li>Allow merchants to store products in secure storage and sell to customers.</li>
            <li>Provide customers with a seamless booking and shopping experience.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
