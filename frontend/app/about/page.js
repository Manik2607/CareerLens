"use client";

export default function AboutPage() {
    return (
        <div style={s.page}>
            {/* Hero */}
            <section style={s.hero}>
                <div style={s.heroBg} aria-hidden="true" />
                <div style={s.heroContent} className="animate-fade-in">
                    <span className="section-label">About Us</span>
                    <h1 style={s.heroTitle}>Built for students,<br/>by people who <span className="gradient-text">get it</span></h1>
                    <p style={s.heroSub}>CareerLens was born from the frustration of scrolling through hundreds of irrelevant internship listings. We built the tool we wished we had.</p>
                </div>
            </section>

            {/* Mission */}
            <section style={s.section}>
                <div style={s.missionCard} className="card animate-fade-in-up">
                    <div style={s.missionIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <h2 style={s.missionTitle}>Our Mission</h2>
                    <p style={s.missionText}>To bridge the gap between students and the right career opportunities by leveraging intelligent matching, honest ATS feedback, and actionable skill-gap analysis — all completely free.</p>
                </div>
            </section>

            {/* Tech Stack */}
            <section style={s.section}>
                <h2 style={s.sectionTitle}>How it works under the hood</h2>
                <p style={s.sectionSub}>Three core engines power every recommendation.</p>
                <div style={s.techGrid} className="animate-fade-in-up delay-200">
                    {TECH.map(t => (
                        <div key={t.title} className="card card-interactive" style={s.techCard}>
                            <div style={s.techIcon}>{t.icon}</div>
                            <h3 style={s.techTitle}>{t.title}</h3>
                            <p style={s.techDesc}>{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section style={s.section}>
                <h2 style={s.sectionTitle}>What we stand for</h2>
                <div style={s.valuesGrid} className="animate-fade-in-up delay-400">
                    {VALUES.map(v => (
                        <div key={v.title} style={s.valueItem}>
                            <div style={s.valueDot} />
                            <div>
                                <h4 style={s.valueTitle}>{v.title}</h4>
                                <p style={s.valueDesc}>{v.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={s.ctaSection} className="animate-fade-in-up">
                <div className="card" style={s.ctaCard}>
                    <h2 style={s.ctaTitle}>Ready to find your match?</h2>
                    <p style={s.ctaDesc}>Upload your resume and let CareerLens do the heavy lifting.</p>
                    <a href="/upload" className="btn btn-primary" style={s.ctaBtn}>Get Started — It&apos;s Free</a>
                </div>
            </section>
        </div>
    );
}

const TECH = [
    {
        title: "AI Resume Parser",
        desc: "Extracts skills, experience, and education from any resume format using NLP techniques.",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
        title: "Matching Engine",
        desc: "Scores every internship against your resume, skills, and preferences for relevant results.",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
    {
        title: "Live Scraper",
        desc: "Pulls fresh internship listings from major job platforms so you never miss an opportunity.",
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"/></svg>,
    },
];

const VALUES = [
    { title: "Precision", desc: "Every recommendation is backed by a quantified match score — no random listings." },
    { title: "Privacy", desc: "Your resume data is processed and never shared with third parties." },
    { title: "Accessibility", desc: "100% free, forever. No premium tiers, no paywalls, no credit cards." },
    { title: "Speed", desc: "From upload to matched recommendations in under 30 seconds." },
];

const s = {
    page: { minHeight: "100vh" },
    hero: { position: "relative", padding: "80px 24px 60px", textAlign: "center", overflow: "hidden" },
    heroBg: {
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(circle at 50% 0%, var(--primary-light) 0%, transparent 60%)", opacity: 0.5,
    },
    heroContent: { position: "relative", zIndex: 1, maxWidth: "640px", margin: "0 auto" },
    heroTitle: { fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: "16px", marginBottom: "16px" },
    heroSub: { fontSize: "1.05rem", color: "var(--foreground-secondary)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto" },
    section: { maxWidth: "900px", margin: "0 auto", padding: "48px 24px 0" },
    sectionTitle: { fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", textAlign: "center", marginBottom: "6px" },
    sectionSub: { fontSize: "0.95rem", color: "var(--foreground-secondary)", textAlign: "center", marginBottom: "32px" },
    missionCard: { padding: "40px", textAlign: "center", maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    missionIcon: { width: "56px", height: "56px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" },
    missionTitle: { fontSize: "1.25rem", fontWeight: 800, color: "var(--foreground)" },
    missionText: { fontSize: "0.95rem", color: "var(--foreground-secondary)", lineHeight: 1.75, maxWidth: "480px" },
    techGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" },
    techCard: { padding: "28px", display: "flex", flexDirection: "column", gap: "10px" },
    techIcon: { width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" },
    techTitle: { fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" },
    techDesc: { fontSize: "0.85rem", color: "var(--foreground-secondary)", lineHeight: 1.65 },
    valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginTop: "8px" },
    valueItem: { display: "flex", gap: "14px", alignItems: "flex-start" },
    valueDot: { width: "10px", height: "10px", minWidth: "10px", borderRadius: "50%", background: "var(--primary)", marginTop: "6px" },
    valueTitle: { fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" },
    valueDesc: { fontSize: "0.84rem", color: "var(--foreground-secondary)", lineHeight: 1.6 },
    ctaSection: { maxWidth: "640px", margin: "0 auto", padding: "64px 24px 100px" },
    ctaCard: { padding: "48px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    ctaTitle: { fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)" },
    ctaDesc: { fontSize: "0.95rem", color: "var(--foreground-secondary)" },
    ctaBtn: { padding: "13px 32px", fontSize: "0.95rem", marginTop: "8px" },
};
