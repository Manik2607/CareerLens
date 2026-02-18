"use client";

const features = [
    {
        icon: "🤖",
        title: "AI Resume Analysis",
        description:
            "Our AI engine deeply analyzes your resume — extracting skills, experience levels, and career interests to build a comprehensive profile.",
        color: "var(--primary)",
        bgColor: "var(--primary-light)",
    },
    {
        icon: "🎯",
        title: "Smart Job Matching",
        description:
            "Advanced matching algorithms compare your profile against thousands of internship listings to find the most relevant opportunities.",
        color: "var(--accent)",
        bgColor: "var(--accent-light)",
    },
    {
        icon: "📊",
        title: "Skills Gap Analysis",
        description:
            "Understand what skills you need to develop. Get actionable insights on how to strengthen your profile for your dream roles.",
        color: "var(--success)",
        bgColor: "var(--success-light)",
    },
    {
        icon: "⚡",
        title: "Instant Results",
        description:
            "No waiting around. Upload your resume and get personalized internship recommendations in seconds, not days.",
        color: "var(--warning)",
        bgColor: "var(--warning-light)",
    },
    {
        icon: "🔒",
        title: "Privacy First",
        description:
            "Your resume data is processed securely and never shared with third parties. Your privacy is our top priority.",
        color: "var(--error)",
        bgColor: "var(--error-light)",
    },
    {
        icon: "🌐",
        title: "Global Opportunities",
        description:
            "Access internship opportunities from companies worldwide. Filter by location, industry, or remote availability.",
        color: "#8b5cf6",
        bgColor: "rgba(139, 92, 246, 0.1)",
    },
];

export default function FeaturesSection() {
    return (
        <section style={styles.section}>
            <div style={styles.headerGroup}>
                <span style={styles.sectionBadge}>Features</span>
                <h2 style={styles.sectionTitle}>
                    Everything you need to
                    <br />
                    <span className="gradient-text">land your dream internship</span>
                </h2>
                <p style={styles.sectionDesc}>
                    CareerLens combines cutting-edge AI with a beautiful interface to make
                    your internship search effortless and effective.
                </p>
            </div>

            <div style={styles.grid}>
                {features.map((feature, i) => (
                    <div
                        key={feature.title}
                        className="card animate-fade-in-up"
                        style={{
                            ...styles.featureCard,
                            animationDelay: `${i * 100}ms`,
                        }}
                    >
                        <div
                            style={{
                                ...styles.iconWrap,
                                background: feature.bgColor,
                            }}
                        >
                            <span style={{ fontSize: "1.5rem" }}>{feature.icon}</span>
                        </div>
                        <h3 style={styles.featureTitle}>{feature.title}</h3>
                        <p style={styles.featureDesc}>{feature.description}</p>
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
    },
    headerGroup: {
        textAlign: "center",
        marginBottom: "64px",
    },
    sectionBadge: {
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
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
        marginBottom: "16px",
    },
    sectionDesc: {
        fontSize: "1.1rem",
        color: "var(--foreground-secondary)",
        maxWidth: "600px",
        margin: "0 auto",
        lineHeight: 1.7,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "24px",
    },
    featureCard: {
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    iconWrap: {
        width: "56px",
        height: "56px",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    featureTitle: {
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    featureDesc: {
        fontSize: "0.92rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
};
