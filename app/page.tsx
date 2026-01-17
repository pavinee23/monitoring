"use client"

import React from 'react'

export default function HomePage() {
	return (
		<>
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
						<div className="col-lg-10 text-center" style={{ position: 'relative', zIndex: 1 }}>
							<div className="logo-hero mx-auto">
								<img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
							</div>
							<div className="emoji-hero mx-auto">⚡</div>
							<h1>ENERGY YOU CAN TRUST</h1>
							<h2>&quot;SAVINGS&quot; YOU CAN SEE</h2>
							<p className="tagline">
								Cut your Electric Bill from day one!<br />
								Advanced power-saving technology with proven results
							</p>
							<div className="d-flex gap-3 justify-content-center flex-wrap">
								<a href="https://strong-dory-enabled.ngrok-free.app/main-login" className="btn-custom-primary">
									🚀 Login to monitoring
								</a>
								<a href="#products" className="btn-custom-secondary">
									📦 View Products
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-5 bg-light">
				<div className="container py-5">
					<h2 className="section-title">Why Choose K Energy Save?</h2>
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
					<h2 className="section-title">Our Products</h2>
					<div className="row g-4">
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER 10</h3>
									<p className="mb-0">Residential Solution</p>
								</div>
								<img src="/k-saver-10.png" alt="K-SAVER 10" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">Perfect for homes and small offices</p>
									<p className="text-muted mb-0">Up to 10kW capacity</p>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER 30</h3>
									<p className="mb-0">Commercial Solution</p>
								</div>
								<img src="/k-saver-30.png" alt="K-SAVER 30" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">Ideal for commercial spaces</p>
									<p className="text-muted mb-0">Up to 30kW capacity</p>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="product-card">
								<div className="product-header">
									<h3 className="product-name">K-SAVER Max</h3>
									<p className="mb-0">Industrial Solution</p>
								</div>
								<img src="/k-saver-max.png" alt="K-SAVER Max" style={{ width: '100%', height: '350px', objectFit: 'contain', padding: '20px', background: '#f8f9fa' }} />
								<div className="p-4 text-center">
									<p className="mb-3">High-capacity industrial applications</p>
									<p className="text-muted mb-0">Customizable capacity</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="py-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
				<div className="container py-5">
					<h2 className="section-title text-white">Contact Us</h2>
					<div className="row g-4">
						<div className="col-lg-6">
							<div className="contact-card">
								<h3>🇹🇭 Thailand Office</h3>
								<p><strong>Address:</strong><br />123/45 Energy Tower, Bangkok 10110</p>
								<p><strong>Phone:</strong> <a href="tel:+66123456789">+66 12 345 6789</a></p>
								<p><strong>Email:</strong> <a href="mailto:thailand@kenergy-save.com">thailand@kenergy-save.com</a></p>
								<p><strong>Hours:</strong> Mon-Fri 9:00-18:00</p>
							</div>
						</div>
						<div className="col-lg-6">
							<div className="contact-card">
								<h3>🇰🇷 Korea Office</h3>
								<p><strong>Address:</strong><br />Seoul, South Korea</p>
								<p><strong>Phone:</strong> <a href="tel:+82123456789">+82 12 345 6789</a></p>
								<p><strong>Email:</strong> <a href="mailto:korea@kenergy-save.com">korea@kenergy-save.com</a></p>
								<p><strong>Hours:</strong> Mon-Fri 9:00-18:00</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-4" style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'center' }}>
				<div className="container">
					<p className="mb-2">&copy; 2025 K Energy Save Co., Ltd. All rights reserved.</p>
					<p className="mb-0">Powered by <a href="https://kenergy-save.com" style={{ color: '#fbbf24', textDecoration: 'none' }}>K Energy Save</a></p>
				</div>
			</footer>
		</>
	)
}
