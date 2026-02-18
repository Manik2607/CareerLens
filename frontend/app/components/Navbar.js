"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="glass-navbar" style={styles.navbar}>
            <div style={styles.inner}>
                {/* Logo */}
                <Link href="/" style={styles.logo}>
                    <span style={styles.logoIcon}>🔍</span>
                    <span className="gradient-text" style={styles.logoText}>
                        CareerLens
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div style={styles.desktopNav}>
                    <Link href="/" style={styles.navLink}>
                        Home
                    </Link>
                    <Link href="/upload" style={styles.navLink}>
                        Upload Resume
                    </Link>
                    <Link href="/recommendations" style={styles.navLink}>
                        Recommendations
                    </Link>
                    <Link href="/about" style={styles.navLink}>
                        About
                    </Link>
                </div>

                {/* Right side */}
                <div style={styles.rightSection}>
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        style={styles.themeToggle}
                        aria-label="Toggle theme"
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        <span style={styles.themeIcon}>
                            {theme === "light" ? "🌙" : "☀️"}
                        </span>
                    </button>

                    {/* CTA */}
                    <Link href="/upload" className="btn btn-primary" style={styles.ctaBtn}>
                        Get Started
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={styles.hamburger}
                        aria-label="Toggle menu"
                    >
                        <span
                            style={{
                                ...styles.hamburgerLine,
                                transform: mobileOpen
                                    ? "rotate(45deg) translate(5px, 5px)"
                                    : "none",
                            }}
                        />
                        <span
                            style={{
                                ...styles.hamburgerLine,
                                opacity: mobileOpen ? 0 : 1,
                            }}
                        />
                        <span
                            style={{
                                ...styles.hamburgerLine,
                                transform: mobileOpen
                                    ? "rotate(-45deg) translate(5px, -5px)"
                                    : "none",
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="glass" style={styles.mobileMenu}>
                    <Link
                        href="/"
                        style={styles.mobileLink}
                        onClick={() => setMobileOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/upload"
                        style={styles.mobileLink}
                        onClick={() => setMobileOpen(false)}
                    >
                        Upload Resume
                    </Link>
                    <Link
                        href="/recommendations"
                        style={styles.mobileLink}
                        onClick={() => setMobileOpen(false)}
                    >
                        Recommendations
                    </Link>
                    <Link
                        href="/about"
                        style={styles.mobileLink}
                        onClick={() => setMobileOpen(false)}
                    >
                        About
                    </Link>
                </div>
            )}
        </nav>
    );
}

const styles = {
    navbar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 24px",
    },
    inner: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        flexShrink: 0,
    },
    logoIcon: {
        fontSize: "1.6rem",
    },
    logoText: {
        fontSize: "1.35rem",
        fontWeight: 800,
        letterSpacing: "-0.02em",
    },
    desktopNav: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    navLink: {
        padding: "8px 16px",
        borderRadius: "var(--radius-full)",
        color: "var(--foreground-secondary)",
        textDecoration: "none",
        fontSize: "0.9rem",
        fontWeight: 500,
        transition: "all var(--transition-fast)",
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    themeToggle: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all var(--transition-fast)",
    },
    themeIcon: {
        fontSize: "1.1rem",
        lineHeight: 1,
    },
    ctaBtn: {
        padding: "8px 20px",
        fontSize: "0.85rem",
    },
    hamburger: {
        display: "none",
        flexDirection: "column",
        gap: "5px",
        padding: "8px",
        background: "none",
        border: "none",
        cursor: "pointer",
    },
    hamburgerLine: {
        width: "22px",
        height: "2px",
        background: "var(--foreground)",
        borderRadius: "2px",
        transition: "all var(--transition-fast)",
    },
    mobileMenu: {
        position: "absolute",
        top: "72px",
        left: "16px",
        right: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        boxShadow: "var(--card-shadow)",
    },
    mobileLink: {
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        color: "var(--foreground)",
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: 500,
        transition: "background var(--transition-fast)",
    },
};

// Add responsive styles via CSS-in-JS media query handling in globals.css
// We'll add a @media block to handle hiding desktop nav on mobile
