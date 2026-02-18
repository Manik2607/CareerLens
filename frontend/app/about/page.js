import Link from "next/link";

const team = [
    {
        name: "AI Engine",
        icon: "🤖",
        desc: "Advanced NLP and machine learning models that understand your resume at a deep level.",
    },
    {
        name: "Matching Algorithm",
        icon: "🧬",
        desc: "Proprietary matching system that weighs skills, experience, and career goals for precise recommendations.",
    },
    {
        name: "Data Pipeline",
        icon: "🔄",
        desc: "Continuously updated internship database sourced from top companies worldwide.",
    },
];

const values = [
    {
        icon: "🎯",
        title: "Precision",
        desc: "We focus on quality over quantity — every recommendation is tailored to you.",
    },
    {
        icon: "🔒",
        title: "Privacy",
        desc: "Your data is yours. We never sell or share your personal information.",
    },
    {
        icon: "🌍",
        title: "Accessibility",
        desc: "Career opportunities should be available to everyone, everywhere.",
    },
    {
        icon: "⚡",
        title: "Speed",
        desc: "Get results in seconds, not days. No lengthy sign-up process required.",
    },
];

export default function AboutPage() {
    return (
        <div style={styles.page}>
            {/* Hero */}
            <section style={styles.heroSection}>
                <div className="animate-fade-in" style={styles.heroContent}>
                    <span style={styles.badge}>About Us</span>
                    <h1 style={styles.heroTitle}>
                        Bridging the gap between
                        <br />
                        <span className="gradient-text">talent and opportunity</span>
                    </h1>
                    <p style={styles.heroDesc}>
                        CareerLens was built with a simple mission: help students and early-career
                        professionals find the perfect internship by leveraging the power of AI.
                        No more scrolling through thousands of irrelevant listings.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section style={styles.section}>
                <div className="card animate-fade-in-up" style={styles.missionCard}>
                    <div style={styles.missionIcon}>💡</div>
                    <h2 style={styles.missionTitle}>Our Mission</h2>
                    <p style={styles.missionDesc}>
                        We believe finding the right internship shouldn&apos;t be a guessing game.
                        By combining your unique skills profile with intelligent matching, we
                        eliminate the noise and surface only the opportunities that truly matter
                        to your career growth.
                    </p>
                </div>
            </section>

            {/* How it&apos;s powered */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    Powered by <span className="gradient-text">cutting-edge tech</span>
                </h2>
                <div style={styles.techGrid}>
                    {team.map((item, i) => (
                        <div
                            key={item.name}
                            className="card animate-fade-in-up"
                            style={{
                                ...styles.techCard,
                                animationDelay: `${i * 100}ms`,
                            }}
                        >
                            <span style={styles.techIcon}>{item.icon}</span>
                            <h3 style={styles.techName}>{item.name}</h3>
                            <p style={styles.techDesc}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    Our <span className="gradient-text">values</span>
                </h2>
                <div style={styles.valuesGrid}>
                    {values.map((value, i) => (
                        <div
                            key={value.title}
                            className="animate-fade-in-up"
                            style={{
                                ...styles.valueItem,
                                animationDelay: `${i * 100}ms`,
                            }}
                        >
                            <div style={styles.valueIconWrap}>
                                <span style={{ fontSize: "1.5rem" }}>{value.icon}</span>
                            </div>
                            <div>
                                <h3 style={styles.valueTitle}>{value.title}</h3>
                                <p style={styles.valueDesc}>{value.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={styles.section}>
                <div className="card" style={styles.ctaCard}>
                    <h2 style={styles.ctaTitle}>
                        Ready to find your <span className="gradient-text">perfect match?</span>
                    </h2>
                    <p style={styles.ctaDesc}>
                        It takes less than a minute. Upload your resume and let our AI do the rest.
                    </p>
                    <Link href="/upload" className="btn btn-primary" style={styles.ctaBtn}>
                        Get Started Free
                    </Link>
                </div>
            </section>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        paddingTop: "72px",
    },
    heroSection: {
        padding: "64px 24px",
        textAlign: "center",
        background: "var(--gradient-hero)",
    },
    heroContent: {
        maxWidth: "720px",
        margin: "0 auto",
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
        marginBottom: "20px",
    },
    heroTitle: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--foreground)",
        marginBottom: "20px",
    },
    heroDesc: {
        fontSize: "1.1rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
        maxWidth: "580px",
        margin: "0 auto",
    },
    section: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "64px 24px",
    },
    sectionTitle: {
        fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--foreground)",
        textAlign: "center",
        marginBottom: "40px",
    },
    missionCard: {
        padding: "48px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },
    missionIcon: {
        fontSize: "3rem",
    },
    missionTitle: {
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    missionDesc: {
        fontSize: "1.05rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.8,
        maxWidth: "600px",
    },
    techGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "24px",
    },
    techCard: {
        padding: "32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    techIcon: {
        fontSize: "2.5rem",
    },
    techName: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    techDesc: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
    valuesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px",
    },
    valueItem: {
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        padding: "20px",
    },
    valueIconWrap: {
        width: "52px",
        height: "52px",
        borderRadius: "var(--radius-md)",
        background: "var(--primary-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    valueTitle: {
        fontSize: "1rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "6px",
    },
    valueDesc: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.6,
    },
    ctaCard: {
        padding: "64px 48px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        background: "var(--gradient-hero)",
    },
    ctaTitle: {
        fontSize: "1.8rem",
        fontWeight: 800,
        color: "var(--foreground)",
    },
    ctaDesc: {
        fontSize: "1rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
    ctaBtn: {
        padding: "14px 36px",
        fontSize: "1rem",
        marginTop: "8px",
    },
};
