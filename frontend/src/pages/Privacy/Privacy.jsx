import React from 'react'
import './LegalPage.css'

const Privacy = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Inkosi Restaurant ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways, including:</p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, phone number, delivery address, and payment information.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and links clicked.</li>
            <li><strong>Device Data:</strong> Information about your device, including IP address, browser type, and operating system.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Use of Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To process and fulfill your orders</li>
            <li>To send order confirmations and updates</li>
            <li>To respond to your inquiries and customer support requests</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
            <li>To prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Cookies</h2>
          <p>
            Our website uses cookies to enhance your experience. These are small files stored on your device that help us remember your preferences and understand how you use our services.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal information. Contact us at privacy@inkosi.local to exercise these rights.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website with an updated "Last updated" date.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:<br />
            Email: privacy@inkosi.local<br />
            Address: 5 Helen Joseph Street, Johannesburg, Gauteng
          </p>
        </section>
      </div>
    </div>
  )
}

export default Privacy
