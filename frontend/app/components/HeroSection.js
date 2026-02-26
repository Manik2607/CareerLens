"use client";

import Link from "next/link";

export default function HeroSection() {
    return (
        <section style={s.hero}>
            {/* Decorative elements */}
            <div className="hero-blob" style={{ width: "600px", height: "600px", background: "var(--primary)", top: "-200px", right: "-200px" }} />
            <div className="hero-blob" style={{ width: "400px", height: "400px", background: "var(--accent)", bottom: "-100px", left: "-100px" }} />
            <div style={s.gridBg} />

            <div style={s.container}>
                <div style={s.content}>
                    {/* Label */}
                    <div className="animate-fade-in" style={s.label}>
                        <span style={s.labelDot} />
                        Trusted by 1,200+ students
                    </div>

                    {/* Heading */}
                    <h1 className="animate-fade-in-up" style={s.heading}>
                        Your career journey,{" "}
                        <span className="gradient-text">simplified.</span>
                    </h1>

                    {/* Subheading */}
                    <p className="animate-fade-in-up delay-200" style={s.sub}>
                        Upload your resume and get AI-matched to internships that fit
                        your skills. No endless scrolling — just the right opportunities.
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-in-up delay-300" style={s.ctaRow}>
                        <Link href="/upload" className="btn btn-primary" style={s.ctaMain}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Upload Resume
                        </Link>
                        <Link href="/about" className="btn btn-secondary">
                            How it works
                        </Link>
                    </div>

                    {/* Trust */}
                    <div className="animate-fade-in-up delay-500" style={s.trustRow}>
                        {["AI-Powered Matching", "Privacy First", "Instant Results"].map((t, i) => (
                            <span key={t} style={s.trustItem}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Visual card */}
                <div className="animate-fade-in-up delay-400" style={s.visualWrap}>
                    <div style={s.mockCard} className="card">
                        <div style={s.mockHeader}>
                            <div style={s.mockDots}>
                                <span style={{ ...s.dot, background: "#ef4444" }} />
                                <span style={{ ...s.dot, background: "#f59e0b" }} />
                                <span style={{ ...s.dot, background: "#10b981" }} />
                            </div>
                            <span style={s.mockTitle}>resume_analysis.ai</span>
                        </div>
                        <div style={s.mockBody}>
                            <div style={s.skillsGrid}>
                                {["React", "Python", "Machine Learning", "TypeScript", "Node.js", "SQL"].map(skill => (
                                    <span key={skill} style={s.skillChip}>{skill}</span>
                                ))}
                            </div>
                            <div style={s.matchBar}>
                                <div style={s.matchLabel}>
                                    <span>Match Score</span>
                                    <span style={{ color: "var(--success)", fontWeight: 700 }}>94%</span>
                                </div>
                                <div style={s.progressBg}><div style={{ ...s.progressFill, width: "94%" }} /></div>
                            </div>
                            <div style={s.matchBar}>
                                <div style={s.matchLabel}>
                                    <span>Skills Fit</span>
                                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>87%</span>
                                </div>
                                <div style={s.progressBg}><div style={{ ...s.progressFill, width: "87%", background: "var(--primary)" }} /></div>
                            </div>
                            <div style={s.matchBar}>
                                <div style={s.matchLabel}>
                                    <span>ATS Score</span>
                                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>72%</span>
                                </div>
                                <div style={s.progressBg}><div style={{ ...s.progressFill, width: "72%", background: "var(--accent)" }} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const s = {
    hero: {
        position: "relative", minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", overflow: "hidden",
        background: "var(--gradient-hero)",
    },
    gridBg: {
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(var(--surface-border) 1px, transparent 1px)",
        backgroundSize: "32px 32px", opacity: 0.4, pointerEvents: "none",
    },
    container: {
        maxWidth: "1200px", margin: "0 auto", padding: "48px 24px",
        display: "flex", alignItems: "center", gap: "64px",
        position: "relative", zIndex: 1, flexWrap: "wrap",
    },
    content: { flex: "1 1 480px", minWidth: "320px" },
    label: {
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "6px 16px", borderRadius: "var(--radius-full)",
        background: "var(--surface)", border: "1px solid var(--surface-border)",
        color: "var(--foreground-secondary)", fontSize: "0.82rem", fontWeight: 600,
        marginBottom: "24px",
    },
    labelDot: {
        width: "7px", height: "7px", borderRadius: "50%",
        background: "var(--success)", boxShadow: "0 0 6px rgba(45,159,111,0.4)",
    },
    heading: {
        fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 800,
        lineHeight: 1.08, letterSpacing: "-0.04em",
        color: "var(--foreground)", marginBottom: "20px",
    },
    sub: {
        fontSize: "1.1rem", lineHeight: 1.7,
        color: "var(--foreground-secondary)", maxWidth: "500px", marginBottom: "32px",
    },
    ctaRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" },
    ctaMain: { padding: "13px 28px", fontSize: "0.95rem" },
    trustRow: { display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" },
    trustItem: {
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "0.82rem", color: "var(--foreground-muted)", fontWeight: 500,
    },
    visualWrap: { flex: "1 1 420px", minWidth: "300px", display: "flex", justifyContent: "center" },
    mockCard: { width: "100%", maxWidth: "420px", padding: 0, overflow: "hidden" },
    mockHeader: {
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", borderBottom: "1px solid var(--surface-border)",
    },
    mockDots: { display: "flex", gap: "6px" },
    dot: { width: "9px", height: "9px", borderRadius: "50%" },
    mockTitle: { fontSize: "0.78rem", color: "var(--foreground-muted)", fontFamily: "monospace" },
    mockBody: { padding: "20px 18px", display: "flex", flexDirection: "column", gap: "16px" },
    skillsGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
    skillChip: {
        padding: "5px 12px", borderRadius: "var(--radius-full)",
        background: "var(--primary-light)", color: "var(--primary)",
        fontSize: "0.78rem", fontWeight: 600,
    },
    matchBar: { display: "flex", flexDirection: "column", gap: "6px" },
    matchLabel: { display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--foreground-secondary)" },
    progressBg: { height: "6px", borderRadius: "3px", background: "var(--surface-hover)", overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: "3px", background: "var(--success)", transition: "width 1s ease-out" },
};
