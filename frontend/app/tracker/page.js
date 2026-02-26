"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"];
const STATUS_COLORS = {
    Applied: { bg: "var(--primary-light)", color: "var(--primary)", hex: "#e85d26" },
    Interview: { bg: "var(--warning-light)", color: "var(--warning)", hex: "#fdb833" },
    Offer: { bg: "var(--success-light)", color: "var(--success)", hex: "#22c55e" },
    Rejected: { bg: "var(--error-light)", color: "var(--error)", hex: "#ef4444" },
    Withdrawn: { bg: "var(--surface-hover)", color: "var(--foreground-muted)", hex: "#94a3b8" },
};

export default function TrackerPage() {
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [editingId, setEditingId] = useState(null);
    const [editNotes, setEditNotes] = useState("");
    const [toast, setToast] = useState("");

    useEffect(() => {
        const init = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) { setLoading(false); return; }
            setUser(u);
            loadApplications(u.id);
        };
        init();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const loadApplications = async (uid) => {
        setLoading(true);
        try {
            const data = await fetchAPI(`/applications/${uid}`);
            setApplications(data || []);
        } catch (err) {
            /* table may not exist yet */
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appId, newStatus) => {
        if (!user) return;
        setApplications(prev => prev.map(a =>
            a.id === appId ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a
        ));
        showToast(`Status updated to "${newStatus}"`);
        try {
            await fetchAPI(`/applications/${user.id}/${appId}`, {
                method: "PUT",
                body: { status: newStatus },
            });
        } catch (err) {
            /* silently handled */
        }
    };

    const saveNotes = async (appId) => {
        if (!user) return;
        setApplications(prev => prev.map(a =>
            a.id === appId ? { ...a, notes: editNotes } : a
        ));
        setEditingId(null);
        showToast("Notes saved");
        try {
            await fetchAPI(`/applications/${user.id}/${appId}`, {
                method: "PUT",
                body: { notes: editNotes },
            });
        } catch (err) {
            /* silently handled */
        }
    };

    const removeApp = async (appId) => {
        if (!user) return;
        setApplications(prev => prev.filter(a => a.id !== appId));
        showToast("Application removed from tracker");
        try {
            await fetchAPI(`/applications/${user.id}/${appId}`, { method: "DELETE" });
        } catch (err) {
            /* silently handled */
        }
    };

    const filtered = filterStatus === "All"
        ? applications
        : applications.filter(a => a.status === filterStatus);

    const statusCounts = {};
    STATUSES.forEach(st => { statusCounts[st] = applications.filter(a => a.status === st).length; });

    // ── Not logged in ──
    if (!user && !loading) {
        return (
            <div style={st.page}><div style={st.container}>
                <div style={st.emptyWrap}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <h2 style={st.emptyTitle}>Sign in to track applications</h2>
                    <p style={st.emptyDesc}>Keep track of every application from submission to offer.</p>
                    <Link href="/login" className="btn btn-primary" style={{ padding: "12px 32px" }}>Log In</Link>
                </div>
            </div></div>
        );
    }

    return (
        <div style={st.page}>
            <div style={st.container}>
                {/* Toast notification */}
                {toast && (
                    <div style={st.toast}>{toast}</div>
                )}

                <div className="animate-fade-in" style={st.header}>
                    <span className="section-label">Tracker</span>
                    <h1 style={st.title}>Application <span className="gradient-text">tracker</span></h1>
                    <p style={st.subtitle}>Track every application from submission to offer. Update statuses as companies respond.</p>
                </div>

                {/* ── Status summary cards ── */}
                <div className="animate-fade-in-up delay-100" style={st.summaryRow}>
                    {STATUSES.map(status => {
                        const sc = STATUS_COLORS[status];
                        const isActive = filterStatus === status;
                        return (
                            <button key={status} onClick={() => setFilterStatus(isActive ? "All" : status)}
                                style={{
                                    ...st.summaryCard,
                                    borderColor: isActive ? sc.color : "var(--surface-border)",
                                    background: isActive ? sc.bg : "var(--card-bg)",
                                }}
                            >
                                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: sc.color }}>{statusCounts[status]}</span>
                                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--foreground-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{status}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Filter tabs ── */}
                <div className="animate-fade-in delay-200" style={st.filterBar}>
                    <div style={st.filterGroup}>
                        {["All", ...STATUSES].map(f => (
                            <button key={f} onClick={() => setFilterStatus(f)} style={{
                                ...st.filterBtn,
                                background: filterStatus === f ? "var(--primary)" : "var(--surface)",
                                color: filterStatus === f ? "#fff" : "var(--foreground-secondary)",
                                borderColor: filterStatus === f ? "var(--primary)" : "var(--surface-border)",
                            }}>
                                {f}{f !== "All" ? ` (${statusCounts[f]})` : ` (${applications.length})`}
                            </button>
                        ))}
                    </div>
                    <span style={st.resultCount}>Showing {filtered.length} of {applications.length}</span>
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div style={st.loadingWrap}>
                        <div style={st.spinner} />
                        <p style={{ color: "var(--foreground-secondary)" }}>Loading applications...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="animate-fade-in" style={st.emptyWrap}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        <h3 style={st.emptyTitle}>{filterStatus === "All" ? "No applications tracked yet" : `No ${filterStatus.toLowerCase()} applications`}</h3>
                        <p style={st.emptyDesc}>
                            Go to <Link href="/recommendations" style={{ color: "var(--primary)", fontWeight: 600 }}>Jobs</Link> and
                            click "Apply" on internships to start tracking.
                        </p>
                    </div>
                ) : (
                    <div style={st.list}>
                        {filtered.map((app, i) => {
                            const intern = app.internships || {};
                            const sc = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
                            const isEditing = editingId === app.id;

                            return (
                                <div key={app.id} className="card animate-fade-in-up" style={{ ...st.card, animationDelay: `${i * 50}ms` }}>
                                    {/* Top: Company info + Status badge */}
                                    <div style={st.cardTop}>
                                        <div style={st.companyRow}>
                                            <div style={st.avatar}>{(intern.company || "?")[0]}</div>
                                            <div>
                                                <h3 style={st.role}>{intern.role || "Unknown Role"}</h3>
                                                <p style={st.company}>{intern.company || "Unknown Company"}</p>
                                            </div>
                                        </div>
                                        <span style={{ ...st.statusBadge, background: sc.bg, color: sc.color }}>{app.status}</span>
                                    </div>

                                    {/* Meta info */}
                                    <div style={st.meta}>
                                        {intern.location && (
                                            <span style={st.metaItem}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", verticalAlign: "middle" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {intern.location}
                                            </span>
                                        )}
                                        {intern.work_type && <span style={st.metaItem}>{intern.work_type}</span>}
                                        {intern.salary && <span style={st.metaItem}>{intern.salary}</span>}
                                        <span style={st.metaItem}>
                                            Applied {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                        {app.updated_at && app.updated_at !== app.applied_at && (
                                            <span style={st.metaItem}>
                                                Updated {new Date(app.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status selector - click to update */}
                                    <div style={st.statusRow}>
                                        <span style={st.label}>Update status:</span>
                                        <div style={st.statusBtns}>
                                            {STATUSES.map(s => {
                                                const stc = STATUS_COLORS[s];
                                                const active = app.status === s;
                                                return (
                                                    <button key={s} onClick={() => { if (!active) updateStatus(app.id, s); }} style={{
                                                        ...st.statusBtn,
                                                        background: active ? stc.bg : "transparent",
                                                        color: active ? stc.color : "var(--foreground-muted)",
                                                        borderColor: active ? stc.color : "var(--surface-border)",
                                                        fontWeight: active ? 700 : 400,
                                                        cursor: active ? "default" : "pointer",
                                                    }}>
                                                        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><path d="M20 6 9 17l-5-5"/></svg>}
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes section */}
                                    <div style={st.notesArea}>
                                        <span style={st.label}>Notes:</span>
                                        {isEditing ? (
                                            <div style={st.notesEdit}>
                                                <textarea
                                                    value={editNotes}
                                                    onChange={e => setEditNotes(e.target.value)}
                                                    style={st.notesInput}
                                                    placeholder="Add interview details, follow-up dates, contact info..."
                                                    rows={3}
                                                />
                                                <div style={st.notesActions}>
                                                    <button className="btn btn-primary" style={st.noteSaveBtn} onClick={() => saveNotes(app.id)}>Save Notes</button>
                                                    <button className="btn btn-ghost" style={st.noteSaveBtn} onClick={() => setEditingId(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setEditingId(app.id); setEditNotes(app.notes || ""); }} style={st.notesToggle}>
                                                {app.notes || "Click to add notes..."}
                                            </button>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div style={st.cardActions}>
                                        {intern.apply_url && (
                                            <a href={intern.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={st.applyLink}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                                Apply
                                            </a>
                                        )}
                                        <button onClick={() => removeApp(app.id)} style={st.deleteBtn}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* How tracker works info */}
                {!loading && applications.length > 0 && (
                    <div className="card animate-fade-in" style={{ ...st.infoCard, marginTop: "32px" }}>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>How the Tracker Works</h4>
                        <ul style={st.infoList}>
                            <li>Click <strong>"Apply"</strong> on the Jobs page to track an internship and open the company's application page.</li>
                            <li>Update the status here as the company responds — <strong>Interview, Offer, or Rejected</strong>.</li>
                            <li>Add <strong>notes</strong> to keep track of interview dates, contact info, or follow-ups.</li>
                            <li>Your Dashboard automatically reflects all status changes and activity.</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

const st = {
    page: { minHeight: "100vh" },
    container: { maxWidth: "850px", margin: "0 auto", padding: "40px 24px 100px", position: "relative" },
    header: { textAlign: "center", marginBottom: "28px" },
    title: { fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: "16px", marginBottom: "10px" },
    subtitle: { fontSize: "1rem", color: "var(--foreground-secondary)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto" },
    toast: { position: "fixed", top: "90px", right: "24px", padding: "12px 24px", borderRadius: "var(--radius-md)", background: "var(--primary)", color: "#fff", fontSize: "0.88rem", fontWeight: 600, zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", animation: "fadeIn 200ms ease" },
    summaryRow: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px" },
    summaryCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "16px 8px", borderRadius: "var(--radius-md)", border: "2px solid", cursor: "pointer", background: "none", transition: "all 200ms ease" },
    filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" },
    filterGroup: { display: "flex", gap: "6px", flexWrap: "wrap" },
    filterBtn: { padding: "6px 14px", borderRadius: "var(--radius-full)", border: "1px solid", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease", background: "none" },
    resultCount: { fontSize: "0.82rem", color: "var(--foreground-muted)" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "80px 24px" },
    spinner: { width: "32px", height: "32px", border: "3px solid var(--surface-border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin-slow 0.8s linear infinite" },
    emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 24px", textAlign: "center" },
    emptyTitle: { fontSize: "1.2rem", fontWeight: 700, color: "var(--foreground)" },
    emptyDesc: { fontSize: "0.92rem", color: "var(--foreground-secondary)", lineHeight: 1.7 },
    list: { display: "flex", flexDirection: "column", gap: "16px" },
    card: { padding: "24px", display: "flex", flexDirection: "column", gap: "14px" },
    cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
    companyRow: { display: "flex", alignItems: "center", gap: "14px" },
    avatar: { width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "var(--gradient-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0 },
    role: { fontSize: "1rem", fontWeight: 700, color: "var(--foreground)" },
    company: { fontSize: "0.85rem", color: "var(--foreground-secondary)", marginTop: "2px" },
    statusBadge: { padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: "0.82rem", fontWeight: 700, flexShrink: 0 },
    meta: { display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" },
    metaItem: { fontSize: "0.8rem", color: "var(--foreground-muted)", display: "inline-flex", alignItems: "center" },
    label: { fontSize: "0.82rem", fontWeight: 600, color: "var(--foreground-secondary)", marginBottom: "6px", display: "block" },
    statusRow: { borderTop: "1px solid var(--surface-border)", paddingTop: "14px" },
    statusBtns: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" },
    statusBtn: { padding: "5px 12px", borderRadius: "var(--radius-full)", border: "1.5px solid", fontSize: "0.76rem", cursor: "pointer", transition: "all 150ms ease", background: "none", display: "inline-flex", alignItems: "center" },
    notesArea: { borderTop: "1px solid var(--surface-border)", paddingTop: "12px" },
    notesToggle: { background: "none", border: "none", color: "var(--foreground-muted)", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", padding: "6px 0 0 0", fontStyle: "italic", width: "100%" },
    notesEdit: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" },
    notesInput: { width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--foreground)", fontSize: "0.88rem", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6 },
    notesActions: { display: "flex", gap: "8px" },
    noteSaveBtn: { padding: "7px 16px", fontSize: "0.82rem" },
    cardActions: { display: "flex", gap: "10px", alignItems: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "14px" },
    applyLink: { padding: "9px 20px", fontSize: "0.84rem", textDecoration: "none", display: "inline-flex", alignItems: "center" },
    deleteBtn: { fontSize: "0.82rem", color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", marginLeft: "auto" },
    infoCard: { padding: "20px 24px" },
    infoList: { listStyleType: "disc", paddingLeft: "20px", fontSize: "0.85rem", color: "var(--foreground-secondary)", lineHeight: 1.8, margin: 0 },
};
