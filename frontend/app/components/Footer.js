import Link from "next/link";

export default function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>
                {/* Top section */}
                <div style={styles.topRow}>
                    {/* Brand */}
                    <div style={styles.brandCol}>
                        <Link href="/" style={styles.logo}>
                            <span style={{ fontSize: "1.4rem" }}>🔍</span>
                            <span className="gradient-text" style={styles.logoText}>
                                CareerLens
                            </span>
                        </Link>
                        <p style={styles.brandDesc}>
                            AI-powered internship recommendations. Upload your resume and
                            discover opportunities tailored to your skills and goals.
                        </p>
                    </div>

                    {/* Links columns */}
                    <div style={styles.linksRow}>
                        <div style={styles.linkCol}>
                            <h4 style={styles.colTitle}>Product</h4>
                            <Link href="/upload" style={styles.footerLink}>
                                Upload Resume
                            </Link>
                            <Link href="/recommendations" style={styles.footerLink}>
                                Recommendations
                            </Link>
                            <Link href="/about" style={styles.footerLink}>
                                About
                            </Link>
                        </div>
                        <div style={styles.linkCol}>
                            <h4 style={styles.colTitle}>Resources</h4>
                            <a href="#" style={styles.footerLink}>
                                Career Tips
                            </a>
                            <a href="#" style={styles.footerLink}>
                                Resume Guide
                            </a>
                            <a href="#" style={styles.footerLink}>
                                FAQ
                            </a>
                        </div>
                        <div style={styles.linkCol}>
                            <h4 style={styles.colTitle}>Connect</h4>
                            <a href="#" style={styles.footerLink}>
                                GitHub
                            </a>
                            <a href="#" style={styles.footerLink}>
                                Twitter
                            </a>
                            <a href="#" style={styles.footerLink}>
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* Bottom */}
                <div style={styles.bottom}>
                    <p style={styles.copyright}>
                        © 2026 CareerLens. All rights reserved.
                    </p>
                    <div style={styles.bottomLinks}>
                        <a href="#" style={styles.footerLink}>
                            Privacy
                        </a>
                        <a href="#" style={styles.footerLink}>
                            Terms
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        borderTop: "1px solid var(--surface-border)",
        background: "var(--background-secondary)",
        padding: "0 24px",
    },
    inner: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "64px 0 32px",
    },
    topRow: {
        display: "flex",
        gap: "64px",
        flexWrap: "wrap",
    },
    brandCol: {
        flex: "1 1 300px",
        minWidth: "250px",
    },
    logo: {
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        marginBottom: "16px",
    },
    logoText: {
        fontSize: "1.25rem",
        fontWeight: 800,
        letterSpacing: "-0.02em",
    },
    brandDesc: {
        color: "var(--foreground-secondary)",
        fontSize: "0.9rem",
        lineHeight: 1.7,
        maxWidth: "320px",
    },
    linksRow: {
        display: "flex",
        gap: "48px",
        flexWrap: "wrap",
        flex: "1 1 auto",
    },
    linkCol: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minWidth: "120px",
    },
    colTitle: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "var(--foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "4px",
    },
    footerLink: {
        color: "var(--foreground-secondary)",
        textDecoration: "none",
        fontSize: "0.9rem",
        transition: "color var(--transition-fast)",
    },
    divider: {
        height: "1px",
        background: "var(--surface-border)",
        margin: "40px 0 24px",
    },
    bottom: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
    },
    copyright: {
        color: "var(--foreground-muted)",
        fontSize: "0.85rem",
    },
    bottomLinks: {
        display: "flex",
        gap: "24px",
    },
};
