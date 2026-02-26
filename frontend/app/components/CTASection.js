import Link from "next/link";

export default function CTASection() {
    return (
        <section style={s.section}>
            <div style={s.card}>
                <div style={s.content}>
                    <h2 style={s.title}>
                        Ready to find your<br />
                        <span className="gradient-text">perfect internship?</span>
                    </h2>
                    <p style={s.desc}>
                        Join thousands of students who found their dream internships with CareerLens. 
                        It takes less than a minute.
                    </p>
                    <div style={s.ctaRow}>
                        <Link href="/upload" className="btn btn-primary" style={s.ctaMain}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Upload Resume Now
                        </Link>
                        <span style={s.freeTag}>100% Free — No credit card</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

const s = {
    section: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 100px" },
    card: {
        background: "var(--background-secondary)", border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-xl)", padding: "72px 48px", textAlign: "center",
        position: "relative", overflow: "hidden",
    },
    content: {
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
    },
    title: {
        fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800,
        lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)",
    },
    desc: {
        fontSize: "1.05rem", color: "var(--foreground-secondary)",
        maxWidth: "480px", lineHeight: 1.7,
    },
    ctaRow: {
        display: "flex", alignItems: "center", gap: "16px",
        flexWrap: "wrap", justifyContent: "center", marginTop: "8px",
    },
    ctaMain: { padding: "14px 32px", fontSize: "1rem" },
    freeTag: { fontSize: "0.85rem", color: "var(--foreground-muted)", fontWeight: 500 },
};
