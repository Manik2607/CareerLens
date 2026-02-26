"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const STATUS_COLORS = {
    Applied: "#e85d26",
    Interview: "#fdb833",
    Offer: "#22c55e",
    Rejected: "#ef4444",
    Withdrawn: "#94a3b8",
};

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const init = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) { setLoading(false); return; }
            setUser(u);
            loadDashboard(u.id);
        };
        init();
    }, []);

    const loadDashboard = async (uid) => {
        setLoading(true);
        setError("");
        try {
            const d = await fetchAPI(`/dashboard/${uid}`);
            setData(d);
        } catch (err) {
            /* silently handled — dashboard shows empty state */
        } finally {
            setLoading(false);
        }
    };

    // ── Not logged in ──
    if (!user && !loading) {
        return (
            <div style={st.page}><div style={st.container}>
                <div style={st.emptyWrap}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <h2 style={st.emptyTitle}>Sign in to view your dashboard</h2>
                    <p style={st.emptyDesc}>Analytics about your skills, applications and match performance.</p>
                    <Link href="/login" className="btn btn-primary" style={{ padding: "12px 32px" }}>Log In</Link>
                </div>
            </div></div>
        );
    }

    const funnel = data?.application_funnel || {};
    const matchOv = data?.match_overview || {};
    const skillsDist = data?.skills_distribution || [];
    const recentAct = data?.recent_activity || [];
    const topComp = data?.top_companies || [];

    const ownedSkills = skillsDist.filter(item => item.owned);
    const gapSkills = skillsDist.filter(item => !item.owned);
    const maxDemand = Math.max(1, ...skillsDist.map(item => item.demand));

    return (
        <div style={st.page}>
            <div style={st.container}>
                <div className="animate-fade-in" style={st.header}>
                    <span className="section-label">Dashboard</span>
                    <h1 style={st.title}>Your career <span className="gradient-text">analytics</span></h1>
                    <p style={st.subtitle}>Skills insights, application pipeline, and match performance — all in one view.</p>
                </div>

                {loading ? (
                    <div style={st.loadingWrap}>
                        <div style={st.spinner} />
                        <p style={{ color: "var(--foreground-secondary)" }}>Loading analytics...</p>
                    </div>
                ) : error ? (
                    <div className="animate-fade-in" style={st.emptyWrap}>
                        <p style={{ color: "var(--error)", fontWeight: 600 }}>{error}</p>
                        <button className="btn btn-primary" onClick={() => loadDashboard(user.id)} style={{ marginTop: "12px" }}>Retry</button>
                    </div>
                ) : (
                    <>
                        {/* ── Row 1: Stats Cards ── */}
                        <div className="animate-fade-in-up delay-100" style={st.statsRow}>
                            <div className="card" style={st.statCard}>
                                <span style={st.statLabel}>Total Applications</span>
                                <span style={st.statValue}>{funnel.total || 0}</span>
                            </div>
                            <div className="card" style={st.statCard}>
                                <span style={st.statLabel}>Avg Match Score</span>
                                <span style={{ ...st.statValue, color: "var(--primary)" }}>{matchOv.average_score ? `${matchOv.average_score}%` : "—"}</span>
                            </div>
                            <div className="card" style={st.statCard}>
                                <span style={st.statLabel}>Top Match</span>
                                <span style={{ ...st.statValue, color: "var(--success)" }}>{matchOv.top_score ? `${matchOv.top_score}%` : "—"}</span>
                            </div>
                            <div className="card" style={st.statCard}>
                                <span style={st.statLabel}>Offers</span>
                                <span style={{ ...st.statValue, color: "#22c55e" }}>{funnel.Offer || 0}</span>
                            </div>
                        </div>

                        {/* ── Row 2: Application Pipeline + Match Performance ── */}
                        <div style={st.twoCol} className="animate-fade-in-up delay-200">
                            {/* Pipeline funnel */}
                            <div className="card" style={st.sectionCard}>
                                <h3 style={st.sectionTitle}>Application Pipeline</h3>
                                <p style={st.sectionDesc}>Your applications by status</p>
                                {funnel.total > 0 ? (
                                    <div style={st.funnelBars}>
                                        {["Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map(status => {
                                            const count = funnel[status] || 0;
                                            const pct = funnel.total > 0 ? (count / funnel.total * 100) : 0;
                                            return (
                                                <div key={status} style={st.funnelRow}>
                                                    <div style={st.funnelLabel}>
                                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_COLORS[status], flexShrink: 0 }} />
                                                        <span style={st.funnelName}>{status}</span>
                                                    </div>
                                                    <div style={st.funnelBarTrack}>
                                                        <div style={{ ...st.funnelBarFill, width: `${Math.max(pct, 3)}%`, background: STATUS_COLORS[status] }} />
                                                    </div>
                                                    <span style={st.funnelCount}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={st.emptySection}>
                                        <p>No applications tracked yet.</p>
                                        <Link href="/recommendations" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem" }}>Start applying</Link>
                                    </div>
                                )}
                            </div>

                            {/* Match overview */}
                            <div className="card" style={st.sectionCard}>
                                <h3 style={st.sectionTitle}>Match Performance</h3>
                                <p style={st.sectionDesc}>How well you match available internships</p>
                                {matchOv.total_internships ? (
                                    <div style={st.matchGrid}>
                                        <div style={st.matchRing}>
                                            <svg width="130" height="130" viewBox="0 0 130 130">
                                                <circle cx="65" cy="65" r="55" fill="none" stroke="var(--surface-border)" strokeWidth="8" />
                                                <circle cx="65" cy="65" r="55" fill="none" stroke="var(--primary)" strokeWidth="8"
                                                    strokeDasharray={`${(matchOv.average_score / 100) * 345.6} 345.6`}
                                                    strokeLinecap="round" transform="rotate(-90 65 65)"
                                                    style={{ transition: "stroke-dasharray 1s ease" }} />
                                                <text x="65" y="60" textAnchor="middle" style={{ fontSize: "1.7rem", fontWeight: 800, fill: "var(--primary)" }}>{matchOv.average_score}%</text>
                                                <text x="65" y="78" textAnchor="middle" style={{ fontSize: "0.6rem", fontWeight: 600, fill: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AVG MATCH</text>
                                            </svg>
                                        </div>
                                        <div style={st.matchStats}>
                                            <div style={st.matchStat}>
                                                <span style={{ ...st.matchNum, color: "var(--success)" }}>{matchOv.above_80}</span>
                                                <span style={st.matchStatLabel}>Above 80%</span>
                                            </div>
                                            <div style={st.matchStat}>
                                                <span style={{ ...st.matchNum, color: "var(--primary)" }}>{matchOv.above_60}</span>
                                                <span style={st.matchStatLabel}>Above 60%</span>
                                            </div>
                                            <div style={st.matchStat}>
                                                <span style={st.matchNum}>{matchOv.total_internships}</span>
                                                <span style={st.matchStatLabel}>Total Listings</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={st.emptySection}>
                                        <p>Upload a resume to see match analytics.</p>
                                        <Link href="/upload" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem" }}>Upload Resume</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Row 3: Skills Distribution ── */}
                        <div className="card animate-fade-in-up delay-300" style={st.sectionCard}>
                            <h3 style={st.sectionTitle}>Skills Distribution</h3>
                            <p style={st.sectionDesc}>Your skills vs. market demand from saved and applied internships</p>
                            {skillsDist.length > 0 ? (
                                <div style={st.skillsChart}>
                                    {ownedSkills.length > 0 && (
                                        <>
                                            <p style={st.chipGroupLabel}>Your Skills</p>
                                            <div style={st.skillBars}>
                                                {ownedSkills.map(sk => (
                                                    <div key={sk.skill} style={st.skillBarRow}>
                                                        <span style={st.skillName}>{sk.skill}</span>
                                                        <div style={st.skillBarTrack}>
                                                            <div style={{ ...st.skillBarFill, width: `${Math.max((sk.demand / maxDemand) * 100, 6)}%`, background: "var(--primary)" }} />
                                                        </div>
                                                        <span style={st.skillDemand}>{sk.demand}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {gapSkills.length > 0 && (
                                        <>
                                            <p style={{ ...st.chipGroupLabel, marginTop: "20px" }}>In-Demand Skills You're Missing</p>
                                            <div style={st.skillBars}>
                                                {gapSkills.map(sk => (
                                                    <div key={sk.skill} style={st.skillBarRow}>
                                                        <span style={{ ...st.skillName, color: "var(--error)" }}>{sk.skill}</span>
                                                        <div style={st.skillBarTrack}>
                                                            <div style={{ ...st.skillBarFill, width: `${Math.max((sk.demand / maxDemand) * 100, 6)}%`, background: "var(--error)" }} />
                                                        </div>
                                                        <span style={st.skillDemand}>{sk.demand}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div style={st.emptySection}>
                                    <p>Upload a resume and save/apply to internships to see skill insights.</p>
                                </div>
                            )}
                        </div>

                        {/* ── Row 4: Recent Activity + Top Companies ── */}
                        <div style={st.twoCol} className="animate-fade-in-up delay-400">
                            <div className="card" style={st.sectionCard}>
                                <h3 style={st.sectionTitle}>Recent Activity</h3>
                                {recentAct.length > 0 ? (
                                    <div style={st.activityList}>
                                        {recentAct.map((act, i) => (
                                            <div key={i} style={st.actItem}>
                                                <div style={{ ...st.actDot, background: act.type === "bookmark" ? "var(--primary)" : "var(--success)" }} />
                                                <div>
                                                    <p style={st.actLabel}>{act.label}</p>
                                                    <span style={st.actTime}>{act.time ? new Date(act.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={st.emptySection}><p>No activity yet. Start saving and applying.</p></div>
                                )}
                            </div>

                            <div className="card" style={st.sectionCard}>
                                <h3 style={st.sectionTitle}>Top Companies</h3>
                                {topComp.length > 0 ? (
                                    <div style={st.companyList}>
                                        {topComp.map((c, i) => (
                                            <div key={i} style={st.companyRow}>
                                                <div style={st.companyAvatar}>{c.company[0]}</div>
                                                <span style={st.companyName}>{c.company}</span>
                                                <span style={st.companyCount}>{c.count} interaction{c.count !== 1 ? "s" : ""}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={st.emptySection}><p>Interact with internships to see company insights.</p></div>
                                )}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="animate-fade-in-up delay-400" style={st.quickLinks}>
                            <Link href="/recommendations" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.88rem", textDecoration: "none" }}>Browse Jobs</Link>
                            <Link href="/tracker" className="btn btn-secondary" style={{ padding: "10px 24px", fontSize: "0.88rem", textDecoration: "none" }}>View Tracker</Link>
                            <Link href="/saved" className="btn btn-ghost" style={{ padding: "10px 24px", fontSize: "0.88rem", textDecoration: "none" }}>Saved Internships</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const st = {
    page: { minHeight: "100vh" },
    container: { maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 100px" },
    header: { textAlign: "center", marginBottom: "32px" },
    title: { fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: "16px", marginBottom: "10px" },
    subtitle: { fontSize: "1rem", color: "var(--foreground-secondary)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "80px 24px" },
    spinner: { width: "32px", height: "32px", border: "3px solid var(--surface-border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" },
    emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 24px", textAlign: "center" },
    emptyTitle: { fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" },
    emptyDesc: { fontSize: "0.92rem", color: "var(--foreground-secondary)", lineHeight: 1.7 },
    emptySection: { fontSize: "0.88rem", color: "var(--foreground-muted)", fontStyle: "italic", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" },
    statCard: { padding: "20px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", textAlign: "center" },
    statLabel: { fontSize: "0.78rem", fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.04em" },
    statValue: { fontSize: "1.8rem", fontWeight: 800, color: "var(--foreground)" },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" },
    sectionCard: { padding: "28px", marginBottom: "20px" },
    sectionTitle: { fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" },
    sectionDesc: { fontSize: "0.82rem", color: "var(--foreground-muted)", marginBottom: "20px" },
    // Funnel
    funnelBars: { display: "flex", flexDirection: "column", gap: "12px" },
    funnelRow: { display: "flex", alignItems: "center", gap: "10px" },
    funnelLabel: { display: "flex", alignItems: "center", gap: "8px", width: "110px", flexShrink: 0 },
    funnelName: { fontSize: "0.82rem", color: "var(--foreground-secondary)", fontWeight: 500 },
    funnelBarTrack: { flex: 1, height: "8px", borderRadius: "4px", background: "var(--surface-hover)", overflow: "hidden" },
    funnelBarFill: { height: "100%", borderRadius: "4px", transition: "width 0.8s ease" },
    funnelCount: { fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", width: "28px", textAlign: "right" },
    // Match
    matchGrid: { display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", justifyContent: "center" },
    matchRing: { flexShrink: 0 },
    matchStats: { display: "flex", flexDirection: "column", gap: "14px" },
    matchStat: { display: "flex", flexDirection: "column", gap: "2px" },
    matchNum: { fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)" },
    matchStatLabel: { fontSize: "0.75rem", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.04em" },
    // Skills
    skillsChart: { marginTop: "4px" },
    chipGroupLabel: { fontSize: "0.78rem", fontWeight: 600, color: "var(--foreground-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" },
    skillBars: { display: "flex", flexDirection: "column", gap: "8px" },
    skillBarRow: { display: "flex", alignItems: "center", gap: "10px" },
    skillName: { fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground)", width: "120px", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    skillBarTrack: { flex: 1, height: "6px", borderRadius: "3px", background: "var(--surface-hover)", overflow: "hidden" },
    skillBarFill: { height: "100%", borderRadius: "3px", transition: "width 0.8s ease" },
    skillDemand: { fontSize: "0.78rem", fontWeight: 700, color: "var(--foreground-muted)", width: "28px", textAlign: "right" },
    // Activity
    activityList: { display: "flex", flexDirection: "column", gap: "12px" },
    actItem: { display: "flex", gap: "12px", alignItems: "flex-start" },
    actDot: { width: "8px", height: "8px", borderRadius: "50%", marginTop: "6px", flexShrink: 0 },
    actLabel: { fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.5 },
    actTime: { fontSize: "0.75rem", color: "var(--foreground-muted)" },
    // Companies
    companyList: { display: "flex", flexDirection: "column", gap: "10px" },
    companyRow: { display: "flex", alignItems: "center", gap: "12px" },
    companyAvatar: { width: "32px", height: "32px", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0 },
    companyName: { fontSize: "0.88rem", fontWeight: 600, color: "var(--foreground)", flex: 1 },
    companyCount: { fontSize: "0.78rem", color: "var(--foreground-muted)" },
    // Quick links
    quickLinks: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" },
};
