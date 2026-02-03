"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

export default function PreInstallationReportPage() {
  const router = useRouter()
  const date = new Date().toLocaleDateString()

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Cover */}
        <section style={styles.cover}>
          <img src="/k-energy-save-logo.jpg" alt="logo" style={styles.logo} />
          <h1 style={styles.title}>Pre-Installation Report</h1>
          <p style={styles.subtitle}>K-SAVER & K-System — Deployment & User Guide</p>
          <div style={styles.meta}>Prepared: {date}</div>
          <div style={styles.actions}>
            <button onClick={() => window.print()} style={styles.primary}>Print / Export PDF</button>
            <button onClick={() => router.push('/')} style={styles.secondary}>Back to Home</button>
          </div>
        </section>

        {/* Table of Contents */}
        <nav style={styles.toc}>
          <h2 style={styles.h2}>Contents</h2>
          <ul>
            <li><a href="#overview">1. Overview & Scope</a></li>
            <li><a href="#site-prep">2. Site Preparation Checklist</a></li>
            <li><a href="#k-saver-manual">3. K-SAVER Manual</a></li>
            <li><a href="#k-system-app">4. K-System App Guide</a></li>
            <li><a href="#pre-installation">5. Pre-installation</a></li>
            <li><a href="#pre-installation-continued">6. Pre-installation — Continued</a></li>
            <li><a href="#appendix">7. Appendix & Resources</a></li>
          </ul>
        </nav>

        {/* Content */}
        <main style={styles.content}>
          <section id="overview" style={styles.section}>
            <h3>1. Overview & Scope</h3>
            <p>This report summarises pre-installation requirements, configuration steps and user guidance for the K-SAVER hardware and K-System application. It is intended for installers and site engineers.</p>
          </section>

          <section id="site-prep" style={styles.section}>
            <h3>2. Site Preparation Checklist</h3>
            <ul>
              <li>Power availability and earthing</li>
              <li>Network connectivity (static/dynamic IP, firewall rules)</li>
              <li>Mounting and space requirements</li>
              <li>Required credentials & contact details</li>
            </ul>
          </section>

          <section id="k-saver-manual" style={styles.section}>
            <h3>3. K-SAVER Manual</h3>
            <p>The K-SAVER manual contains hardware wiring diagrams, device configuration, firmware update steps and troubleshooting tips.</p>
            <p style={{ marginTop: 8 }}>
              <a href="/docs/K-SAVER-manual.pdf" target="_blank" rel="noreferrer" style={styles.link}>Download K-SAVER Manual (PDF)</a>
            </p>

            <div style={styles.subsection}>
              <h4>Installation</h4>
              <ol>
                <li>Verify incoming power and isolation</li>
                <li>Mount device and connect CT/voltage sensors as diagram</li>
                <li>Connect Ethernet and power up</li>
                <li>Access device web UI at the default IP for initial setup</li>
              </ol>
            </div>
          </section>

          <section id="k-system-app" style={styles.section}>
            <h3>4. K-System App Guide</h3>
            <p>This guide covers user login, site selection, device monitoring and report generation in the K-System web application.</p>
            <p style={{ marginTop: 8 }}>
              <a href="/docs/K-System-app-guide.pdf" target="_blank" rel="noreferrer" style={styles.link}>Download K-System App Guide (PDF)</a>
            </p>

            <div style={styles.subsection}>
              <h4>Quick Start</h4>
              <ol>
                <li>Open the web app and log in with provided credentials</li>
                <li>Select a site from the selector in the header</li>
                <li>Navigate to device monitoring to view live data</li>
                <li>Generate PDF reports from the Reports page</li>
              </ol>
            </div>
          </section>

          {/* Pre-installation (page 5) */}
          <section id="pre-installation" style={styles.section}>
            <h3>5. Pre-installation</h3>
            <p>Pre-installation checklist for on-site engineers. Includes power, network and mounting checks as well as required documents.</p>
            <ul>
              <li>Confirm power source, breakers and earthing</li>
              <li>Network connectivity: DHCP vs static IP, gateway, DNS</li>
              <li>Firewall rules: allow outbound to cloud endpoints</li>
              <li>Physical mounting and clearance for CTs and cabling</li>
              <li>Prepare site contact and safety permits</li>
            </ul>
            <p>For a guided checklist UI, open the interactive pages: <a href="/pre-installation">Pre-installation</a> and <a href="/pre-installation/continued">Pre-installation — Continued</a>.</p>
          </section>

          {/* Pre-installation Continued (page 6) */}
          <section id="pre-installation-continued" style={styles.section}>
            <h3>6. Pre-installation — Continued</h3>
            <p>Additional configuration notes and post-installation verification steps.</p>
            <ol>
              <li>Record device firmware and serial numbers</li>
              <li>Assign hostnames and static IPs if required</li>
              <li>Test connectivity to the cloud and sample data reporting</li>
              <li>Validate sensor wiring and verify measured values</li>
              <li>Capture photos and completion notes for the report</li>
            </ol>
            <p>Use the interactive continued checklist at <a href="/pre-installation/continued">Pre-installation — Continued</a> to capture notes on-site.</p>
          </section>

          <section id="appendix" style={styles.section}>
            <h3>5. Appendix & Resources</h3>
            <ul>
              <li><a className="link" href="/contact">Support & Contact</a></li>
              <li><a className="link" href="/privacy-policy">Privacy & Data Handling</a></li>
              <li>Firmware download and version history can be found in the documentation folder.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { padding: 24, display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 980, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' },
  cover: { textAlign: 'center', padding: '28px 12px', borderBottom: '1px solid #eef2ff' },
  logo: { width: 96, height: 96, objectFit: 'contain', borderRadius: 8, marginBottom: 12 },
  title: { margin: 0, fontSize: 28, color: '#0f172a' },
  subtitle: { marginTop: 6, color: '#4b5563' },
  meta: { marginTop: 10, color: '#6b7280' },
  actions: { marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' },
  primary: { background: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' },
  secondary: { background: '#fff', color: '#111827', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' },
  toc: { padding: '18px 0', borderBottom: '1px solid #f1f5f9' },
  h2: { margin: '0 0 8px 0' },
  content: { padding: '18px 0', maxHeight: '60vh', overflowY: 'auto' },
  section: { marginBottom: 18 },
  subsection: { marginTop: 8, paddingLeft: 12 },
  link: { color: '#2563eb', textDecoration: 'underline' }
}
