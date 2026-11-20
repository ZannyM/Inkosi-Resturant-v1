import './LegalPage.css'

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h1>Terms of Service</h1>
        <p className="legal-subtitle">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using Inkosi Restaurant's website and services, you agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Inkosi Restaurant's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the website</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Disclaimer</h2>
          <p>
            The materials on Inkosi Restaurant's website are provided on an 'as is' basis. Inkosi Restaurant makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Limitations</h2>
          <p>
            In no event shall Inkosi Restaurant or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Inkosi Restaurant's website.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Inkosi Restaurant's website could include technical, typographical, or photographic errors. Inkosi Restaurant does not warrant that any of the materials on the website are accurate, complete, or current. Inkosi Restaurant may make changes to the materials contained on its website at any time without notice.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Links</h2>
          <p>
            Inkosi Restaurant has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Inkosi Restaurant of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Modifications</h2>
          <p>
            Inkosi Restaurant may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Ordering and Payment</h2>
          <p>
            All orders are subject to acceptance and availability. Prices are subject to change without notice. We reserve the right to refuse or cancel any order. Payment must be received before orders are prepared and delivered.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:<br />
            Email: legal@inkosi.local<br />
            Address: 5 Helen Joseph Street, Johannesburg, Gauteng
          </p>
        </section>
      </div>
    </div>
  )
}

export default Terms
