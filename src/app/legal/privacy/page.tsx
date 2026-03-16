export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
            <p>We collect personal information you provide directly, such as name, email, phone, address, and payment details when you register, list a space/product, or make a purchase. We also collect usage data (IP address, browser type, pages visited) to improve our service.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Process transactions and send related notifications</li>
              <li>Communicate with you about your account or support requests</li>
              <li>Improve the platform and analyze usage patterns</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Service providers (Stripe, SendGrid, Supabase) who assist in operations</li>
              <li>Other users only as necessary for transactions (e.g., sharing your name and address with a seller for delivery)</li>
              <li>Law enforcement or regulators when required by law</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption (TLS/SSL), hashed passwords, and role-based access controls. Payment data is handled by Stripe and never stored on our servers in full. Despite our efforts, no system is 100% secure; we cannot guarantee absolute security.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to enhance user experience, analyze usage, for authentication. You can disable cookies in your browser, but some features may not function correctly.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">6. Data Retention</h2>
            <p>We retain your personal data as long as your account is active or as needed to provide services. You may request deletion of your account and associated data; we will honor such requests unless we are legally required to retain certain data.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. To exercise these rights, contact us at privacy@storeffice.com.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">8. Children's Privacy</h2>
            <p>Our service is not intended for individuals under 18. We do not knowingly collect data from children. If we become aware of such collection, we will delete it promptly.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">9. Changes to Privacy Policy</h2>
            <p>We may update this policy from time to time. We will notify users of material changes via email or in-app notice. Continued use after changes constitutes acceptance.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">10. Contact</h2>
            <p>For privacy concerns or data requests, contact: privacy@storeffice.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
