"use client";

const steps = [
    {
        number: "01",
        icon: "📄",
        title: "Upload Your Resume",
        description:
            "Drop your resume in PDF, DOCX, or TXT format. Our parser handles all major formats seamlessly.",
    },
    {
        number: "02",
        icon: "🧠",
        title: "AI Analysis",
        description:
            "Our AI extracts your skills, experience, education, and career goals to build a rich candidate profile.",
    },
    {
        number: "03",
        icon: "🔍",
        title: "Smart Matching",
        description:
            "We compare your profile against thousands of internship listings using our proprietary matching algorithm.",
    },
    {
        number: "04",
        icon: "🎉",
        title: "Get Recommendations",
        description:
            "Receive a curated list of internship opportunities ranked by relevance, with detailed match insights.",
    },
];

export default function HowItWorksSection() {
    return (
        <section style={styles.section}>
            <div style={styles.headerGroup}>
                <span style={styles.sectionBadge}>How It Works</span>
                <h2 style={styles.sectionTitle}>
                    From resume to recommendations
                    <br />
                    <span className="gradient-text">in four simple steps</span>
                </h2>
            </div>

            <div style={styles.stepsGrid}>
                {steps.map((step, i) => (
                    <div
                        key={step.number}
                        className="animate-fade-in-up"
                        style={{
                            ...styles.stepItem,
                            animationDelay: `${i * 150}ms`,
                        }}
                    >
                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div style={styles.connector} />
                        )}

                        <div style={styles.stepNumber}>
                            <span className="gradient-text" style={styles.numberText}>
                                {step.number}
                            </span>
                        </div>
                        <div style={styles.stepIcon}>{step.icon}</div>
                        <h3 style={styles.stepTitle}>{step.title}</h3>
                        <p style={styles.stepDesc}>{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "100px 24px",
        background: "var(--background-secondary)",
        borderRadius: "var(--radius-xl)",
        marginLeft: "max(24px, calc((100% - 1200px) / 2))",
        marginRight: "max(24px, calc((100% - 1200px) / 2))",
    },
    headerGroup: {
        textAlign: "center",
        marginBottom: "64px",
    },
    sectionBadge: {
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: "var(--radius-full)",
        background: "var(--accent-light)",
        color: "var(--accent)",
        fontSize: "0.8rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "16px",
    },
    sectionTitle: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--foreground)",
    },
    stepsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "32px",
        position: "relative",
    },
    stepItem: {
        textAlign: "center",
        padding: "24px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    connector: {
        position: "absolute",
        top: "60px",
        right: "-16px",
        width: "32px",
        height: "2px",
        background: "var(--surface-border)",
        zIndex: 0,
    },
    stepNumber: {
        marginBottom: "4px",
    },
    numberText: {
        fontSize: "1rem",
        fontWeight: 800,
        letterSpacing: "0.05em",
    },
    stepIcon: {
        fontSize: "2.5rem",
        marginBottom: "8px",
    },
    stepTitle: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    stepDesc: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
        maxWidth: "280px",
    },
};
