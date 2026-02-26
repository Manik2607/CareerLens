"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user ?? null);
        };
        checkUser();
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });
        return () => authListener?.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/upload", label: "Upload" },
        { href: "/recommendations", label: "Jobs" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/tracker", label: "Tracker" },
        { href: "/saved", label: "Saved" },
        { href: "/skill-gap", label: "Skill Gap" },
        { href: "/profile", label: "Profile" },
        { href: "/about", label: "About" },
    ];

    return (
        <>
            <nav style={{
                ...s.nav,
                background: scrolled ? "var(--navbar-bg)" : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                borderBottom: scrolled ? "1px solid var(--navbar-border)" : "1px solid transparent",
                boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.04)" : "none",
            }}>
                <div style={s.inner}>
                    {/* Logo */}
                    <Link href="/" style={s.logo}>
                        <div style={s.logoMark}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <span style={s.logoName}>Career<span style={{ color: "var(--primary)" }}>Lens</span></span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="desktop-links" style={s.links}>
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    ...s.link,
                                    color: pathname === link.href ? "var(--primary)" : "var(--foreground-secondary)",
                                    fontWeight: pathname === link.href ? 600 : 500,
                                }}
                            >
                                {link.label}
                                {pathname === link.href && <span style={s.activeBar} />}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div style={s.right}>
                        {/* Theme toggle */}
                        <button onClick={toggleTheme} style={s.themeBtn} aria-label="Toggle theme">
                            {theme === "dark" ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                </svg>
                            )}
                        </button>

                        {user ? (
                            <div style={s.userArea}>
                                <div style={s.avatar}>
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                <span style={s.userName}>
                                    {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                                </span>
                                <button onClick={handleLogout} style={s.logoutBtn}>
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div style={s.authBtns}>
                                <Link href="/login" style={s.loginBtn}>Log in</Link>
                                <Link href="/signup" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={s.hamburger}
                            aria-label="Toggle menu"
                        >
                            <span style={{ ...s.hLine, transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                            <span style={{ ...s.hLine, opacity: mobileOpen ? 0 : 1 }} />
                            <span style={{ ...s.hLine, transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div style={s.mobileOverlay} onClick={() => setMobileOpen(false)}>
                    <div style={s.mobileMenu} onClick={e => e.stopPropagation()}>
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} style={{
                                ...s.mobileLink,
                                color: pathname === link.href ? "var(--primary)" : "var(--foreground)",
                                fontWeight: pathname === link.href ? 600 : 500,
                            }}>
                                {link.label}
                            </Link>
                        ))}
                        {!user && (
                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <Link href="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Log in</Link>
                                <Link href="/signup" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div style={{ height: "64px" }} />
        </>
    );
}

const s = {
    nav: {
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000,
        height: "64px", padding: "0 24px",
        transition: "all 250ms ease",
    },
    inner: {
        maxWidth: "1200px", margin: "0 auto", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: {
        display: "flex", alignItems: "center", gap: "10px",
        textDecoration: "none", flexShrink: 0,
    },
    logoMark: {
        width: "36px", height: "36px", borderRadius: "10px",
        background: "var(--primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    logoName: {
        fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground)",
        letterSpacing: "-0.03em",
    },
    links: {
        display: "flex", alignItems: "center", gap: "4px",
    },
    link: {
        position: "relative", textDecoration: "none", fontSize: "0.88rem",
        padding: "8px 14px", borderRadius: "var(--radius-md)",
        transition: "all 150ms ease",
    },
    activeBar: {
        position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)",
        width: "16px", height: "2px", borderRadius: "1px", background: "var(--primary)",
    },
    right: {
        display: "flex", alignItems: "center", gap: "12px", flexShrink: 0,
    },
    themeBtn: {
        width: "36px", height: "36px", borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)", background: "var(--surface)",
        color: "var(--foreground-secondary)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms ease",
    },
    userArea: {
        display: "flex", alignItems: "center", gap: "10px",
    },
    avatar: {
        width: "30px", height: "30px", borderRadius: "var(--radius-md)",
        background: "var(--accent)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: "0.8rem",
    },
    userName: {
        fontSize: "0.85rem", color: "var(--foreground-secondary)", fontWeight: 500,
    },
    logoutBtn: {
        padding: "6px 14px", fontSize: "0.8rem", borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)", background: "transparent",
        color: "var(--foreground-muted)", cursor: "pointer",
        transition: "all 150ms ease",
    },
    authBtns: {
        display: "flex", alignItems: "center", gap: "8px",
    },
    loginBtn: {
        color: "var(--foreground-secondary)", textDecoration: "none",
        fontSize: "0.88rem", fontWeight: 500, padding: "8px 16px",
        borderRadius: "var(--radius-md)", transition: "color 150ms ease",
    },
    hamburger: {
        display: "none", flexDirection: "column", gap: "5px", padding: "8px",
        background: "transparent", border: "none", cursor: "pointer",
    },
    hLine: {
        display: "block", width: "20px", height: "2px",
        background: "var(--foreground)", borderRadius: "1px",
        transition: "all 200ms ease",
    },
    mobileOverlay: {
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
    },
    mobileMenu: {
        position: "absolute", top: "64px", right: "16px",
        width: "280px", background: "var(--card-bg)",
        border: "1px solid var(--card-border)", borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: "16px",
        display: "flex", flexDirection: "column", gap: "4px",
    },
    mobileLink: {
        textDecoration: "none", padding: "12px 16px", fontSize: "0.95rem",
        borderRadius: "var(--radius-md)", transition: "background 150ms ease",
    },
};
