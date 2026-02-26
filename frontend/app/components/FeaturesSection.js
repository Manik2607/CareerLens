"use client";

const features = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
        ),
        title: "AI Resume Analysis",
        description: "Our engine deeply analyzes your resume — extracting skills, experience, and career interests to build a comprehensive profile.",
        color: "var(--primary)",
        bgColor: "var(--primary-light)",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
        ),
        title: "Smart Job Matching",
        description: "Advanced algorithms compare your profile against thousands of internship listings to surface the most relevant opportunities.",
        color: "var(--accent)",
        bgColor: "var(--accent-light)",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
        ),
        title: "Skills Gap Analysis",
        description: "Understand what skills you need to develop. Get actionable insights to strengthen your profile for dream roles.",
        color: "var(--success)",
        bgColor: "var(--success-light)",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
        ),
        title: "Instant Results",
        description: "No waiting. Upload your resume and get personalized recommendations in seconds — optimized for speed.",
        color: "var(--warning)",
        bgColor: "var(--warning-light)",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        ),
        title: "Privacy First",
        description: "Your resume data is processed securely and never shared. End-to-end protection of your personal info.",
        color: "var(--error)",
        bgColor: "var(--error-light)",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        ),
        title: "Multi-Platform Search",
        description: "Access internship opportunities scraped from Internshala, LinkedIn, and more — all in one dashboard.",
        color: "var(--accent)",
        bgColor: "var(--accent-light)",
    },
];

export default function FeaturesSection() {
    return (
        <section style={s.section}>
            <div style={s.headerGroup}>
                <span className="section-label">Features</span>
                <h2 style={s.title}>
                    Everything you need to<br />
                    <span className="gradient-text">land your dream internship</span>
                </h2>
                <p style={s.desc}>
                    CareerLens combines powerful AI with an intuitive interface to make
                    your internship search effortless and effective.
                </p>
            </div>
            <div style={s.grid}>
                {features.map((f, i) => (
                    <div key={f.title} className="card card-interactive animate-fade-in-up" style={{ ...s.featureCard, animationDelay: `${i * 80}ms` }}>
                        <div style={{ ...s.iconWrap, background: f.bgColor, color: f.color }}>{f.icon}</div>
                        <h3 style={s.featureTitle}>{f.title}</h3>
                        <p style={s.featureDesc}>{f.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

const s = {
    section: { maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" },
    headerGroup: { textAlign: "center", marginBottom: "56px" },
    title: {
        fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800,
        lineHeight: 1.15, letterSpacing: "-0.02em",
        color: "var(--foreground)", marginTop: "16px", marginBottom: "14px",
    },
    desc: {
        fontSize: "1.05rem", color: "var(--foreground-secondary)",
        maxWidth: "560px", margin: "0 auto", lineHeight: 1.7,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "20px",
    },
    featureCard: { padding: "28px", display: "flex", flexDirection: "column", gap: "14px" },
    iconWrap: {
        width: "48px", height: "48px", borderRadius: "var(--radius-md)",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    featureTitle: { fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)" },
    featureDesc: { fontSize: "0.9rem", color: "var(--foreground-secondary)", lineHeight: 1.7 },
};
