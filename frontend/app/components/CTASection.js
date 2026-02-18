import Link from "next/link";

export default function CTASection() {
    return (
        <section style={styles.section}>
            <div style={styles.card} className="card">
                {/* Background gradient overlay */}
                <div style={styles.gradientBg} />

                <div style={styles.content}>
                    <h2 style={styles.title}>
                        Ready to discover your
                        <br />
                        <span className="gradient-text">perfect internship?</span>
                    </h2>
                    <p style={styles.desc}>
                        Join thousands of students who have found their dream internships
                        with CareerLens. It only takes a minute to get started.
                    </p>
                    <div style={styles.ctaRow}>
                        <Link
                            href="/upload"
                            className="btn btn-primary"
                            style={styles.ctaPrimary}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Resume Now
                        </Link>
                        <span style={styles.freeTag}>✨ 100% Free</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

const styles = {
    section: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px 100px",
    },
    card: {
        position: "relative",
        overflow: "hidden",
        padding: "80px 48px",
        textAlign: "center",
        borderRadius: "var(--radius-xl)",
    },
    gradientBg: {
        position: "absolute",
        inset: 0,
        background: "var(--gradient-hero)",
        opacity: 0.5,
        pointerEvents: "none",
    },
    content: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
    },
    title: {
        fontSize: "clamp(2rem, 4vw, 2.8rem)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--foreground)",
    },
    desc: {
        fontSize: "1.1rem",
        color: "var(--foreground-secondary)",
        maxWidth: "500px",
        lineHeight: 1.7,
    },
    ctaRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "8px",
    },
    ctaPrimary: {
        padding: "16px 36px",
        fontSize: "1.05rem",
    },
    freeTag: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        fontWeight: 500,
    },
};
