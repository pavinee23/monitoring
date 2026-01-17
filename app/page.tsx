import Script from 'next/script'
import './landing.css'

export default function HomePage() {
  return (
    <>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <i className="bi bi-megaphone-fill"></i>
          <span>🎉 New Update: K-SAVER Max now available for industrial applications!</span>
          <a href="#products">Learn More →</a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center position-relative" style={{ zIndex: 1 }}>
              <div className="logo-hero mx-auto">
                <img src="/k-energy-save-logo.jpg" alt="K Energy Save" className="img-fluid" />
              </div>
              <div className="emoji-hero mx-auto">⚡</div>
              <h1 className="hero-title">ENERGY YOU CAN TRUST</h1>
              <h2 className="hero-subtitle">&quot;SAVINGS&quot; YOU CAN SEE</h2>
              <p className="hero-tagline">Cut your Electric Bill from day one!<br />Advanced power-saving technology with proven results</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <a href="https://strong-dory-enabled.ngrok-free.app" className="btn btn-custom-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login to Monitoring
                </a>
                <a href="#products" className="btn btn-custom-secondary">
                  <i className="bi bi-grid-3x3-gap me-2"></i>View Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose K Energy Save?</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">🔬</div>
                <h3 className="feature-title">Proven Technology</h3>
                <p className="feature-desc">Validated power saving device with global exports. Certified, eco-friendly, and patented solutions.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <h3 className="feature-title">Eco Friendly</h3>
                <p className="feature-desc">Environmentally conscious solutions that reduce carbon footprint while saving energy.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Power Quality</h3>
                <p className="feature-desc">Improves power quality and system reliability, extending equipment lifespan.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3 className="feature-title">Certified Reliability</h3>
                <p className="feature-desc">Patented solutions trusted across industrial and commercial sectors worldwide.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3 className="feature-title">Global Impact</h3>
                <p className="feature-desc">Exported power-saving devices benefiting multiple countries internationally.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3 className="feature-title">7-15% Savings</h3>
                <p className="feature-desc">Reduces power consumption by blocking excess power and improving efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title">Our Products</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="product-card">
                <div className="product-header">
                  <h3 className="product-name">K-SAVER 10</h3>
                  <p className="mb-0">For Small Business</p>
                </div>
                <img src="/k-saver-10.png" alt="K-SAVER 10" className="product-image" />
                <div className="product-body">
                  <p className="feature-desc mb-3">Perfect for retail stores, small offices, and small-scale businesses</p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                    <i className="bi bi-lightning-charge-fill text-warning"></i>
                    <small>Efficient & Reliable</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="product-card">
                <div className="product-header">
                  <h3 className="product-name">K-SAVER 30</h3>
                  <p className="mb-0">For Medium Business</p>
                </div>
                <img src="/k-saver-30.png" alt="K-SAVER 30" className="product-image" />
                <div className="product-body">
                  <p className="feature-desc mb-3">Ideal for restaurants, hotels, and medium-sized businesses</p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                    <i className="bi bi-lightning-charge-fill text-warning"></i>
                    <small>Optimized Performance</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="product-card">
                <div className="product-header">
                  <h3 className="product-name">K-SAVER Max</h3>
                  <p className="mb-0">For Industrial</p>
                </div>
                <img src="/k-saver-max.png" alt="K-SAVER Max" className="product-image" />
                <div className="product-body">
                  <p className="feature-desc mb-3">Suitable for factories, industrial plants, and large-scale enterprises</p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                    <i className="bi bi-lightning-charge-fill text-warning"></i>
                    <small>Maximum Capacity</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title text-white">Contact Us</h2>
          </div>
          <div className="row g-4">
            {/* Thailand Office */}
            <div className="col-lg-6">
              <div className="contact-card">
                <h3><i className="bi bi-geo-alt-fill me-2"></i>🇹🇭 Thailand Office</h3>
                <div className="text-start">
                  <p className="fw-bold mb-3">K Energy Save Co., Ltd.</p>
                  <p className="mb-2"><i className="bi bi-building me-2"></i>84 Chaloem Phrakiat Rama 9 Soi 34</p>
                  <p className="mb-3">Nong Bon, Prawet<br />Bangkok 10250, Thailand</p>
                  <p className="mb-2">
                    <i className="bi bi-telephone-fill me-2"></i>
                    <a href="tel:+6620808916">+66 2 080 8916</a>
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-envelope-fill me-2"></i>
                    <a href="mailto:info@kenergy-save.com">info@kenergy-save.com</a>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Korea Office */}
            <div className="col-lg-6">
              <div className="contact-card">
                <h3><i className="bi bi-geo-alt-fill me-2"></i>🇰🇷 Korea Office</h3>
                <div className="text-start">
                  <p className="fw-bold mb-3">Zera-Energy</p>
                  <p className="mb-2"><i className="bi bi-building me-2"></i>2F, 16-10, 166beon-gil</p>
                  <p className="mb-3">Elseso-ro, Gunpo-si<br />Gyeonggi-do, Korea</p>
                  <p className="mb-2">
                    <i className="bi bi-telephone-fill me-2"></i>
                    <a href="tel:+82314271380">+82 31-427-1380</a>
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-envelope-fill me-2"></i>
                    <a href="mailto:info@zera-energy.com">info@zera-energy.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p className="mb-2">&copy; 2025 K Energy Save Co., Ltd. All rights reserved.</p>
              <p className="mb-0">Powered by <a href="https://kenergy-save.com">K Energy Save</a></p>
            </div>
          </div>
        </div>
      </footer>

      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" />
    </>
  )
}


