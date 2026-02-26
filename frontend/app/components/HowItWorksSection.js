"use client";

const steps = [
    {
        num: "01",
        title: "Upload Your Resume",
        description: "Drop your resume in PDF, DOCX, or TXT format. Our parser handles all major formats.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
        ),
    },
    {
        num: "02",
        title: "AI Analyzes Skills",
        description: "Our AI extracts skills, experience, and career goals to build a rich candidate profile.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
        ),
    },
    {
        num: "03",
        title: "Smart Matching",
        description: "Compare your profile against thousands of listings using our matching algorithm.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
        ),
    },
    {
        num: "04",
        title: "Get Recommendations",
        description: "Receive a curated list ranked by relevance, with detailed match insights.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        ),
    },
];

export default function HowItWorksSection() {
    return (
        <section style={s.section}>
            <div style={s.inner}>
                <div style={s.headerGroup}>
                    <span className="section-label">How It Works</span>
                    <h2 style={s.title}>
                        From resume to recommendations<br />
                        <span className="gradient-text">in four simple steps</span>
                    </h2>
                </div>

                <div style={s.stepsGrid}>
                    {steps.map((step, i) => (
                        <div key={step.num} className="animate-fade-in-up" style={{ ...s.stepItem, animationDelay: `${i * 120}ms` }}>
                            <div style={s.stepNum}>
                                <span className="gradient-text" style={s.numText}>{step.num}</span>
                            </div>
                            <div style={s.stepIcon}>{step.icon}</div>
                            <h3 style={s.stepTitle}>{step.title}</h3>
                            <p style={s.stepDesc}>{step.description}</p>
                            {i < steps.length - 1 && <div style={s.connector} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const s = {
    section: {
        background: "var(--background-secondary)",
        borderTop: "1px solid var(--surface-border)",
        borderBottom: "1px solid var(--surface-border)",
    },
    inner: { maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" },
    headerGroup: { textAlign: "center", marginBottom: "56px" },
    title: {
        fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800,
        lineHeight: 1.15, letterSpacing: "-0.02em",
        color: "var(--foreground)", marginTop: "16px",
    },
    stepsGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px", position: "relative",
    },
    stepItem: {
        textAlign: "center", padding: "24px", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
    },
    connector: {
        position: "absolute", top: "56px", right: "-12px",
        width: "24px", height: "2px", background: "var(--surface-border)", zIndex: 0,
    },
    stepNum: { marginBottom: "4px" },
    numText: { fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.05em" },
    stepIcon: {
        width: "56px", height: "56px", borderRadius: "var(--radius-lg)",
        background: "var(--primary-light)", color: "var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "8px",
    },
    stepTitle: { fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)" },
    stepDesc: {
        fontSize: "0.88rem", color: "var(--foreground-secondary)",
        lineHeight: 1.7, maxWidth: "260px",
    },
};
