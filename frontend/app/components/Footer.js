import Link from "next/link";

export default function Footer() {
    return (
        <footer style={s.footer}>
            <div style={s.inner}>
                <div style={s.topRow}>
                    {/* Brand */}
                    <div style={s.brandCol}>
                        <Link href="/" style={s.logo}>
                            <div style={s.logoMark}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                            </div>
                            <span style={s.logoText}>Career<span style={{ color: "var(--primary)" }}>Lens</span></span>
                        </Link>
                        <p style={s.brandDesc}>
                            AI-powered internship recommendations. Upload your resume and
                            discover opportunities tailored to your skills.
                        </p>
                    </div>

                    {/* Links */}
                    <div style={s.linksRow}>
                        <div style={s.linkCol}>
                            <h4 style={s.colTitle}>Product</h4>
                            <Link href="/upload" style={s.footerLink}>Upload Resume</Link>
                            <Link href="/recommendations" style={s.footerLink}>Recommendations</Link>
                            <Link href="/skill-gap" style={s.footerLink}>Skill Gap</Link>
                        </div>
                        <div style={s.linkCol}>
                            <h4 style={s.colTitle}>Resources</h4>
                            <Link href="/about" style={s.footerLink}>About</Link>
                            <a href="#" style={s.footerLink}>Career Tips</a>
                            <a href="#" style={s.footerLink}>Resume Guide</a>
                        </div>
                        <div style={s.linkCol}>
                            <h4 style={s.colTitle}>Connect</h4>
                            <a href="#" style={s.footerLink}>GitHub</a>
                            <a href="#" style={s.footerLink}>Twitter</a>
                            <a href="#" style={s.footerLink}>LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div style={s.divider} />

                <div style={s.bottom}>
                    <p style={s.copyright}>&copy; 2026 CareerLens. All rights reserved.</p>
                    <div style={s.bottomLinks}>
                        <a href="#" style={s.footerLink}>Privacy</a>
                        <a href="#" style={s.footerLink}>Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const s = {
    footer: {
        borderTop: "1px solid var(--surface-border)",
        background: "var(--background-secondary)", padding: "0 24px",
    },
    inner: { maxWidth: "1200px", margin: "0 auto", padding: "56px 0 28px" },
    topRow: { display: "flex", gap: "56px", flexWrap: "wrap" },
    brandCol: { flex: "1 1 280px", minWidth: "240px" },
    logo: {
        display: "inline-flex", alignItems: "center", gap: "10px",
        textDecoration: "none", marginBottom: "14px",
    },
    logoMark: {
        width: "32px", height: "32px", borderRadius: "8px",
        background: "var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    logoText: {
        fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)",
        letterSpacing: "-0.02em",
    },
    brandDesc: {
        color: "var(--foreground-secondary)", fontSize: "0.88rem",
        lineHeight: 1.7, maxWidth: "300px",
    },
    linksRow: { display: "flex", gap: "40px", flexWrap: "wrap", flex: "1 1 auto" },
    linkCol: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "110px" },
    colTitle: {
        fontSize: "0.78rem", fontWeight: 700, color: "var(--foreground)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px",
    },
    footerLink: {
        color: "var(--foreground-secondary)", textDecoration: "none",
        fontSize: "0.88rem", transition: "color 150ms ease",
    },
    divider: { height: "1px", background: "var(--surface-border)", margin: "36px 0 20px" },
    bottom: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px",
    },
    copyright: { color: "var(--foreground-muted)", fontSize: "0.82rem" },
    bottomLinks: { display: "flex", gap: "20px" },
};
