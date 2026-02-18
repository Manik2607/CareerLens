"use client";

import Link from "next/link";

export default function HeroSection() {
    return (
        <section style={styles.hero}>
            {/* Decorative blobs */}
            <div
                className="hero-blob"
                style={{
                    width: "500px",
                    height: "500px",
                    background: "var(--primary)",
                    top: "-100px",
                    right: "-150px",
                }}
            />
            <div
                className="hero-blob"
                style={{
                    width: "400px",
                    height: "400px",
                    background: "var(--accent)",
                    bottom: "-50px",
                    left: "-100px",
                }}
            />
            <div
                className="hero-blob"
                style={{
                    width: "300px",
                    height: "300px",
                    background: "#a855f7",
                    top: "40%",
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            />

            <div style={styles.container}>
                <div style={styles.content}>
                    {/* Badge */}
                    <div className="animate-fade-in" style={styles.badge}>
                        <span style={styles.badgeDot} />
                        AI-Powered Career Matching
                    </div>

                    {/* Heading */}
                    <h1 className="animate-fade-in-up" style={styles.heading}>
                        Find Your Perfect
                        <br />
                        <span className="gradient-text">Internship</span> Match
                    </h1>

                    {/* Subheading */}
                    <p className="animate-fade-in-up delay-200" style={styles.subheading}>
                        Upload your resume and let our AI analyze your skills, experience,
                        and goals to recommend the most relevant internship opportunities —
                        personalized just for you.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fade-in-up delay-300" style={styles.ctaRow}>
                        <Link href="/upload" className="btn btn-primary" style={styles.ctaPrimary}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Your Resume
                        </Link>
                        <Link href="/about" className="btn btn-secondary">
                            Learn More
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="animate-fade-in-up delay-500" style={styles.trustRow}>
                        <div style={styles.trustItem}>
                            <span style={styles.trustIcon}>✨</span>
                            <span style={styles.trustLabel}>AI-Powered Analysis</span>
                        </div>
                        <div style={styles.trustDivider} />
                        <div style={styles.trustItem}>
                            <span style={styles.trustIcon}>🔒</span>
                            <span style={styles.trustLabel}>Secure & Private</span>
                        </div>
                        <div style={styles.trustDivider} />
                        <div style={styles.trustItem}>
                            <span style={styles.trustIcon}>⚡</span>
                            <span style={styles.trustLabel}>Instant Results</span>
                        </div>
                    </div>
                </div>

                {/* Hero visual */}
                <div className="animate-fade-in-up delay-400" style={styles.visualWrap}>
                    <div style={styles.mockCard} className="card">
                        <div style={styles.mockHeader}>
                            <div style={styles.mockDots}>
                                <span style={{ ...styles.dot, background: "#ef4444" }} />
                                <span style={{ ...styles.dot, background: "#f59e0b" }} />
                                <span style={{ ...styles.dot, background: "#10b981" }} />
                            </div>
                            <span style={styles.mockTitle}>resume_analysis.ai</span>
                        </div>
                        <div style={styles.mockBody}>
                            <div style={styles.skillsGrid}>
                                {["React", "Python", "Machine Learning", "TypeScript", "Node.js", "SQL"].map(
                                    (skill) => (
                                        <span key={skill} style={styles.skillChip}>
                                            {skill}
                                        </span>
                                    )
                                )}
                            </div>
                            <div style={styles.matchBar}>
                                <div style={styles.matchLabel}>
                                    <span>Match Score</span>
                                    <span style={{ color: "var(--success)", fontWeight: 700 }}>
                                        94%
                                    </span>
                                </div>
                                <div style={styles.progressBg}>
                                    <div style={styles.progressFill} />
                                </div>
                            </div>
                            <div style={styles.matchBar}>
                                <div style={styles.matchLabel}>
                                    <span>Skills Relevance</span>
                                    <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                                        87%
                                    </span>
                                </div>
                                <div style={styles.progressBg}>
                                    <div style={{ ...styles.progressFill, width: "87%", background: "var(--gradient-primary)" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const styles = {
    hero: {
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: "72px",
    },
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "64px 24px",
        display: "flex",
        alignItems: "center",
        gap: "64px",
        position: "relative",
        zIndex: 1,
        flexWrap: "wrap",
    },
    content: {
        flex: "1 1 480px",
        minWidth: "320px",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 18px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
        marginBottom: "24px",
    },
    badgeDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "var(--primary)",
        animation: "pulse-glow 2s infinite",
    },
    heading: {
        fontSize: "clamp(2.5rem, 5vw, 4rem)",
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        color: "var(--foreground)",
        marginBottom: "24px",
    },
    subheading: {
        fontSize: "1.15rem",
        lineHeight: 1.7,
        color: "var(--foreground-secondary)",
        maxWidth: "520px",
        marginBottom: "36px",
    },
    ctaRow: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "48px",
    },
    ctaPrimary: {
        padding: "14px 32px",
        fontSize: "1rem",
    },
    trustRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
    },
    trustItem: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    trustIcon: {
        fontSize: "1rem",
    },
    trustLabel: {
        fontSize: "0.85rem",
        color: "var(--foreground-muted)",
        fontWeight: 500,
    },
    trustDivider: {
        width: "1px",
        height: "20px",
        background: "var(--surface-border)",
    },
    visualWrap: {
        flex: "1 1 420px",
        minWidth: "300px",
        display: "flex",
        justifyContent: "center",
    },
    mockCard: {
        width: "100%",
        maxWidth: "440px",
        padding: 0,
        overflow: "hidden",
    },
    mockHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        borderBottom: "1px solid var(--surface-border)",
    },
    mockDots: {
        display: "flex",
        gap: "6px",
    },
    dot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
    },
    mockTitle: {
        fontSize: "0.8rem",
        color: "var(--foreground-muted)",
        fontFamily: "var(--font-geist-mono), monospace",
    },
    mockBody: {
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    skillsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    skillChip: {
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.8rem",
        fontWeight: 600,
    },
    matchBar: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    matchLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.85rem",
        color: "var(--foreground-secondary)",
    },
    progressBg: {
        height: "8px",
        borderRadius: "var(--radius-full)",
        background: "var(--surface-hover)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        width: "94%",
        borderRadius: "var(--radius-full)",
        background: "linear-gradient(90deg, var(--success), #34d399)",
        transition: "width 1s ease-out",
    },
};
