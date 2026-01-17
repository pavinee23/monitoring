"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f8f9fa;
          color: #333;
        }

        .hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
        }

        .logo-hero {
          width: 450px;
          height: 220px;
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #ffffff;
          border-radius: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .logo-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .emoji-hero {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255, 255, 255, 0.2);
          animation: pulse 2s infinite;
        }

        .hero h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .hero h2 {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #fbbf24;
        }

        .tagline {
          font-size: 20px;
          margin-bottom: 40px;
          opacity: 0.95;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-custom-primary {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #1e3a8a;
          box-shadow: 0 6px 25px rgba(251, 191, 36, 0.5);
          font-size: 20px;
          font-weight: 700;
          padding: 18px 45px;
          border-radius: 50px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-custom-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 35px rgba(251, 191, 36, 0.7);
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }

        .btn-custom-secondary {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 3px solid white;
          backdrop-filter: blur(15px);
          font-size: 20px;
          font-weight: 700;
          padding: 18px 45px;
          border-radius: 50px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-custom-secondary:hover {
          background: white;
          color: #1e3a8a;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 35px rgba(255, 255, 255, 0.4);
        }

        .features {
          padding: 80px 20px;
          background: white;
        }

        .section-title {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 60px;
          color: #1e3a8a;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: #f8f9fa;
          padding: 40px 30px;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .feature-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1e3a8a;
        }

        .feature-desc {
          color: #666;
          line-height: 1.6;
        }

        .products {
          padding: 80px 20px;
          background: #f8f9fa;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .product-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }

        .product-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .product-body {
          padding: 30px 20px;
          text-align: center;
        }

        .product-image {
          width: 100%;
          height: 350px;
          object-fit: contain;
          padding: 20px;
          background: #f8f9fa;
        }

        .contact {
          padding: 80px 20px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          height: 100%;
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        }

        .contact-card h3 {
          color: #1e3a8a;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 3px solid #fbbf24;
        }

        .contact-card p {
          color: #334155;
          line-height: 1.8;
          font-size: 16px;
        }

        .contact-card .fw-bold {
          color: #1e3a8a;
          font-size: 20px;
        }

        .contact-card a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .contact-card a:hover {
          color: #1e3a8a;
          text-decoration: underline;
        }

        .announcement-bar {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: white;
          padding: 18px 0;
          text-align: center;
          font-weight: 800;
          font-size: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .announcement-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 3s infinite;
        }

        .announcement-content {
          display: inline-block;
          white-space: nowrap;
          animation: scrollText 10s linear infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes scrollText {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        footer {
          background: #1e293b;
          color: #94a3b8;
          padding: 40px 20px;
          text-align: center;
        }

        footer a {
          color: #fbbf24;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .logo-hero {
            width: 280px;
            height: 180px;
          }

          .hero h1 {
            font-size: 32px;
          }

          .hero h2 {
            font-size: 24px;
          }

          .section-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div>
        {/* Announcement Bar */}
        <div className="announcement-bar" translate="no" suppressHydrationWarning>
          <div className="announcement-content" translate="no" suppressHydrationWarning>
            <span translate="no" suppressHydrationWarning>🎉 New Update: K-SAVER Max now available for industrial applications!</span>
            <a href="#products" style={{ color: 'white', marginLeft: '10px' }} translate="no" suppressHydrationWarning>Learn More →</a>
          </div>
        </div>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="logo-hero">
              <img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="emoji-hero">⚡</div>
            <h1>ENERGY YOU CAN TRUST</h1>
            <h2>&quot;SAVINGS&quot; YOU CAN SEE</h2>
            <p className="tagline">
              Cut your Electric Bill from day one!<br />
              Advanced power-saving technology with proven results
            </p>
            <div className="cta-buttons">
              <a href="https://strong-dory-enabled.ngrok-free.app" className="btn-custom-primary">
                Login to Monitoring
              </a>
              <a href="#products" className="btn-custom-secondary">
                View Products
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <h2 className="section-title">Why Choose K Energy Save?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3 className="feature-title">Proven Technology</h3>
              <p className="feature-desc">Validated power saving device with global exports. Certified, eco-friendly, and patented solutions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <h3 className="feature-title">Eco Friendly</h3>
              <p className="feature-desc">Environmentally conscious solutions that reduce carbon footprint while saving energy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Power Quality</h3>
              <p className="feature-desc">Improves power quality and system reliability, extending equipment lifespan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3 className="feature-title">Certified Reliability</h3>
              <p className="feature-desc">Patented solutions trusted across industrial and commercial sectors worldwide.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Global Impact</h3>
              <p className="feature-desc">Exported power-saving devices benefiting multiple countries internationally.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">7-15% Savings</h3>
              <p className="feature-desc">Reduces power consumption by blocking excess power and improving efficiency.</p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="products">
          <h2 className="section-title">Our Products</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-header">
                <h3 className="product-name">K-SAVER 10</h3>
                <p style={{ margin: 0 }}>For Small Business</p>
              </div>
              <img src="/k-saver-10.png" alt="K-SAVER 10" className="product-image" />
              <div className="product-body">
                <p className="feature-desc">Perfect for retail stores, small offices, and small-scale businesses</p>
              </div>
            </div>
            <div className="product-card">
              <div className="product-header">
                <h3 className="product-name">K-SAVER 30</h3>
                <p style={{ margin: 0 }}>For Medium Business</p>
              </div>
              <img src="/k-saver-30.png" alt="K-SAVER 30" className="product-image" />
              <div className="product-body">
                <p className="feature-desc">Ideal for restaurants, hotels, and medium-sized operations</p>
              </div>
            </div>
            <div className="product-card">
              <div className="product-header">
                <h3 className="product-name">K-SAVER Max</h3>
                <p style={{ margin: 0 }}>For Industrial Use</p>
              </div>
              <img src="/k-saver-max.png" alt="K-SAVER Max" className="product-image" />
              <div className="product-body">
                <p className="feature-desc">Designed for factories, warehouses, and large-scale facilities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact">
          <h2 className="section-title" style={{ color: 'white' }}>Contact Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="contact-card">
              <h3>🇹🇭 Thailand Office</h3>
              <div style={{ textAlign: 'left' }}>
                <p className="fw-bold">K Energy Save Co., Ltd.</p>
                <p>
                  <strong>Address:</strong><br />
                  84 Chaloem Phrakiat Rama 9 Soi 34<br />
                  Nong Bon, Prawet<br />
                  Bangkok 10250, Thailand
                </p>
                <p><strong>Tel:</strong> <a href="tel:+6620808916">+66 2 0808916</a></p>
                <p><strong>Email:</strong> <a href="mailto:info@kenergy-save.com">info@kenergy-save.com</a></p>
              </div>
            </div>
            <div className="contact-card">
              <h3>🇰🇷 Korea Office</h3>
              <div style={{ textAlign: 'left' }}>
                <p className="fw-bold">K Energy Save Co., Ltd.</p>
                <p>
                  <strong>Address:</strong><br />
                  2F, 16-10, 166beon-gil, Elseso-ro<br />
                  Gunpo-si, Gyeonggi-do<br />
                  South Korea
                </p>
                <p><strong>Tel:</strong> <a href="tel:+82314271380">+82 31-427-1380</a></p>
                <p><strong>Email:</strong> <a href="mailto:info@zera-energy.com">info@zera-energy.com</a></p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <p style={{ marginBottom: '10px' }}>&copy; 2025 K Energy Save Co., Ltd. All rights reserved.</p>
          <p style={{ margin: 0 }}>Powered by <a href="https://kenergy-save.com">K Energy Save</a></p>
        </footer>
      </div>
    </>
  )
}
