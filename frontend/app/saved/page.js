"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function SavedPage() {
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const [toast, setToast] = useState("");

    useEffect(() => {
        const init = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) { setLoading(false); return; }
            setUser(u);
            await Promise.all([
                loadBookmarks(u.id),
                loadAppliedIds(u.id),
            ]);
        };
        init();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const loadBookmarks = async (uid) => {
        setLoading(true);
        try {
            const data = await fetchAPI(`/bookmarks/${uid}`);
            setBookmarks(data || []);
        } catch (err) {
            /* table may not exist yet */
        } finally {
            setLoading(false);
        }
    };

    const loadAppliedIds = async (uid) => {
        try {
            const apps = await fetchAPI(`/applications/${uid}`);
            if (apps) setAppliedIds(new Set(apps.map(a => a.internship_id)));
        } catch (e) { /* table may not exist yet */ }
    };

    const removeBookmark = async (internshipId) => {
        if (!user) return;
        setBookmarks(prev => prev.filter(b => b.internship_id !== internshipId));
        showToast("Bookmark removed");
        try {
            await fetchAPI(`/bookmarks/${user.id}/${internshipId}`, { method: "DELETE" });
        } catch (err) {
            /* silently handled */
        }
    };

    const applyToInternship = async (internshipId, applyUrl) => {
        if (!user) return;
        setAppliedIds(prev => new Set(prev).add(internshipId));
        showToast("Application tracked! Opening listing...");
        if (applyUrl) {
            window.open(applyUrl, "_blank", "noopener,noreferrer");
        }
        try {
            await fetchAPI(`/applications/${user.id}`, {
                method: "POST",
                body: { internship_id: internshipId, status: "Applied" },
            });
        } catch (err) {
            /* silently handled */
        }
    };

    // ── Not logged in ──
    if (!user && !loading) {
        return (
            <div style={s.page}><div style={s.container}>
                <div style={s.emptyWrap}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <h2 style={s.emptyTitle}>Sign in to view saved internships</h2>
                    <p style={s.emptyDesc}>Save internships from the Jobs page and review them here.</p>
                    <Link href="/login" className="btn btn-primary" style={{ padding: "12px 32px" }}>Log In</Link>
                </div>
            </div></div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                {/* Toast notification */}
                {toast && <div style={s.toast}>{toast}</div>}

                <div className="animate-fade-in" style={s.header}>
                    <span className="section-label">Saved</span>
                    <h1 style={s.title}>Your <span className="gradient-text">bookmarked</span> internships</h1>
                    <p style={s.subtitle}>Internships you've saved for later. Apply when you're ready.</p>
                </div>

                {loading ? (
                    <div style={s.loadingWrap}>
                        <div style={s.spinner} />
                        <p style={{ color: "var(--foreground-secondary)" }}>Loading saved internships...</p>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="animate-fade-in" style={s.emptyWrap}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                        <h3 style={s.emptyTitle}>No saved internships yet</h3>
                        <p style={s.emptyDesc}>
                            Go to <Link href="/recommendations" style={{ color: "var(--primary)", fontWeight: 600 }}>Jobs</Link> and
                            click the bookmark icon to save internships here.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="animate-fade-in" style={s.count}>
                            <strong>{bookmarks.length}</strong> saved internship{bookmarks.length !== 1 ? "s" : ""}
                        </p>
                        <div style={s.list}>
                            {bookmarks.map((bm, i) => {
                                const intern = bm.internships || {};
                                const alreadyApplied = appliedIds.has(bm.internship_id);

                                return (
                                    <div key={bm.id} className="card animate-fade-in-up" style={{ ...s.card, animationDelay: `${i * 60}ms` }}>
                                        <div style={s.cardTop}>
                                            <div style={s.companyRow}>
                                                <div style={s.avatar}>{(intern.company || "?")[0]}</div>
                                                <div>
                                                    <h3 style={s.role}>{intern.role || "Unknown Role"}</h3>
                                                    <p style={s.company}>{intern.company || "Unknown"}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeBookmark(bm.internship_id)} style={s.removeBtn} title="Remove bookmark">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                                            </button>
                                        </div>

                                        {intern.description && (
                                            <p style={s.desc}>{intern.description.length > 200 ? intern.description.slice(0, 200) + "..." : intern.description}</p>
                                        )}

                                        <div style={s.meta}>
                                            {intern.location && (
                                                <span style={s.metaItem}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px", verticalAlign: "middle" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                    {intern.location}
                                                </span>
                                            )}
                                            {intern.work_type && <span style={s.badge}>{intern.work_type}</span>}
                                            {intern.salary && <span style={s.metaItem}>{intern.salary}</span>}
                                        </div>

                                        {intern.skills && intern.skills.length > 0 && (
                                            <div style={s.skills}>
                                                {intern.skills.slice(0, 8).map(sk => (
                                                    <span key={sk} style={s.skillChip}>{sk}</span>
                                                ))}
                                                {intern.skills.length > 8 && (
                                                    <span style={{ ...s.skillChip, background: "var(--surface-hover)", color: "var(--foreground-muted)" }}>
                                                        +{intern.skills.length - 8} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div style={s.actions}>
                                            {alreadyApplied ? (
                                                <span style={s.appliedBadge}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M20 6 9 17l-5-5"/></svg>
                                                    Applied
                                                </span>
                                            ) : (
                                                <button className="btn btn-primary" style={s.applyBtn} onClick={() => applyToInternship(bm.internship_id, intern.apply_url)}>
                                                    Apply
                                                </button>
                                            )}
                                            <Link href="/tracker" style={s.trackerLink}>View in Tracker</Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const s = {
    page: { minHeight: "100vh" },
    container: { maxWidth: "800px", margin: "0 auto", padding: "40px 24px 100px", position: "relative" },
    header: { textAlign: "center", marginBottom: "32px" },
    title: { fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: "16px", marginBottom: "10px" },
    subtitle: { fontSize: "1rem", color: "var(--foreground-secondary)", lineHeight: 1.7 },
    toast: { position: "fixed", top: "90px", right: "24px", padding: "12px 24px", borderRadius: "var(--radius-md)", background: "var(--primary)", color: "#fff", fontSize: "0.88rem", fontWeight: 600, zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
    count: { fontSize: "0.88rem", color: "var(--foreground-muted)", marginBottom: "16px" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "80px 24px" },
    spinner: { width: "32px", height: "32px", border: "3px solid var(--surface-border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" },
    emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 24px", textAlign: "center" },
    emptyTitle: { fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" },
    emptyDesc: { fontSize: "0.92rem", color: "var(--foreground-secondary)", lineHeight: 1.7 },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    card: { padding: "24px", display: "flex", flexDirection: "column", gap: "12px" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    companyRow: { display: "flex", alignItems: "center", gap: "14px" },
    avatar: { width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--gradient-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0 },
    role: { fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" },
    company: { fontSize: "0.85rem", color: "var(--foreground-secondary)", marginTop: "2px" },
    removeBtn: { background: "transparent", border: "none", cursor: "pointer", padding: "4px" },
    desc: { fontSize: "0.88rem", color: "var(--foreground-secondary)", lineHeight: 1.65 },
    meta: { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" },
    metaItem: { fontSize: "0.8rem", color: "var(--foreground-muted)", display: "inline-flex", alignItems: "center" },
    badge: { padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--success-light)", color: "var(--success)", fontSize: "0.75rem", fontWeight: 600 },
    skills: { display: "flex", flexWrap: "wrap", gap: "6px" },
    skillChip: { padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--primary-light)", color: "var(--primary)", fontSize: "0.76rem", fontWeight: 600 },
    actions: { display: "flex", gap: "12px", alignItems: "center", marginTop: "4px", borderTop: "1px solid var(--surface-border)", paddingTop: "14px" },
    applyBtn: { padding: "9px 22px", fontSize: "0.85rem" },
    appliedBadge: { padding: "9px 22px", borderRadius: "var(--radius-full)", background: "var(--success-light)", color: "var(--success)", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center" },
    trackerLink: { fontSize: "0.84rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600 },
};
