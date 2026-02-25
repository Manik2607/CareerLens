"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { fetchAPI } from "../../lib/api";
import Link from "next/link";

const ROLE_CATEGORIES = [
    { key: "web development", label: "Web Development", icon: "🌐" },
    { key: "python", label: "Python", icon: "🐍" },
    { key: "machine learning", label: "Machine Learning", icon: "🤖" },
    { key: "data science", label: "Data Science", icon: "📊" },
    { key: "frontend development", label: "Frontend", icon: "🎨" },
    { key: "backend development", label: "Backend", icon: "⚙️" },
    { key: "mobile app development", label: "Mobile Dev", icon: "📱" },
    { key: "devops", label: "DevOps", icon: "🔧" },
];

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scraping, setScraping] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [skills, setSkills] = useState([]);
    const [targetRoles, setTargetRoles] = useState([]);
    const [workMode, setWorkMode] = useState("Remote");
    const [preferredLocation, setPreferredLocation] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUser(user);
            loadProfile(user.id);
        };
        getUser();
    }, []);

    const loadProfile = async (userId) => {
        try {
            const data = await fetchAPI(`/profile/${userId}`);
            setProfile(data);
            setSkills(data.latest_resume?.skills || []);
            setTargetRoles(data.preferences?.target_roles || []);
            setWorkMode(data.preferences?.work_mode || "Remote");
            setPreferredLocation(data.preferences?.preferred_location || "");
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        const skill = newSkill.trim().toLowerCase();
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    const toggleRole = (roleKey) => {
        setTargetRoles(prev =>
            prev.includes(roleKey)
                ? prev.filter(r => r !== roleKey)
                : [...prev, roleKey]
        );
    };

    const saveSkills = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetchAPI(`/profile/${user.id}/skills`, {
                method: "PUT",
                body: { skills }
            });
            showMessage("✅ Skills updated!");
        } catch (err) {
            showMessage("❌ Failed to save skills");
        } finally {
            setSaving(false);
        }
    };

    const savePreferences = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetchAPI(`/preferences/${user.id}`, {
                method: "POST",
                body: {
                    internship_type: profile?.preferences?.internship_type || "",
                    work_mode: workMode,
                    preferred_location: preferredLocation,
                    target_roles: targetRoles,
                }
            });
            showMessage("✅ Preferences saved!");
        } catch (err) {
            showMessage("❌ Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    const triggerScrape = async () => {
        setScraping(true);
        try {
            const categoriesParam = targetRoles.length > 0 ? "" : "";
            // Trigger scrape via the internships endpoint
            await fetchAPI(`/internships/scrape`, { method: "POST" });
            showMessage("📡 Scraping started! New internships will appear in recommendations shortly.");
        } catch (err) {
            showMessage("❌ Scraping failed");
        } finally {
            setTimeout(() => setScraping(false), 3000);
        }
    };

    const showMessage = (msg) => {
        setSaveMessage(msg);
        setTimeout(() => setSaveMessage(""), 4000);
    };

    const getATSColor = (score) => {
        if (score >= 80) return "var(--success)";
        if (score >= 60) return "var(--primary)";
        if (score >= 40) return "var(--warning)";
        return "var(--error)";
    };

    if (loading) {
        return (
            <div style={s.page}>
                <div style={s.container}>
                    <div style={{ textAlign: "center", padding: "80px 24px" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
                        <p style={{ color: "var(--foreground-secondary)" }}>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={s.page}>
                <div style={s.container}>
                    <div style={{ textAlign: "center", padding: "80px 24px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
                        <h2 style={{ color: "var(--foreground)", marginBottom: "12px" }}>Sign in to view your profile</h2>
                        <p style={{ color: "var(--foreground-secondary)", marginBottom: "24px" }}>
                            Your profile shows your skills, preferences, and career data.
                        </p>
                        <Link href="/login" className="btn btn-primary">Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                {/* Toast Message */}
                {saveMessage && (
                    <div style={s.toast} className="animate-fade-in">
                        {saveMessage}
                    </div>
                )}

                {/* ── Profile Header ── */}
                <div className="card animate-fade-in" style={s.headerCard}>
                    <div style={s.headerRow}>
                        <div style={s.avatarLarge}>
                            {profile?.user?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 style={s.userName}>
                                {profile?.user?.full_name || user.email?.split("@")[0]}
                            </h1>
                            <p style={s.userEmail}>{user.email}</p>
                            <p style={s.memberSince}>
                                Member since {profile?.user?.created_at
                                    ? new Date(profile.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                    : "recently"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={s.statsRow}>
                        <div style={s.statItem}>
                            <span style={s.statValue}>{skills.length}</span>
                            <span style={s.statLabel}>Skills</span>
                        </div>
                        <div style={s.statDivider}></div>
                        <div style={s.statItem}>
                            <span style={s.statValue}>{profile?.stats?.resumes_uploaded || 0}</span>
                            <span style={s.statLabel}>Resumes</span>
                        </div>
                        <div style={s.statDivider}></div>
                        <div style={s.statItem}>
                            <span style={{
                                ...s.statValue,
                                color: getATSColor(profile?.latest_resume?.ats_score || 0)
                            }}>
                                {profile?.latest_resume?.ats_score || "—"}
                            </span>
                            <span style={s.statLabel}>ATS Score</span>
                        </div>
                        <div style={s.statDivider}></div>
                        <div style={s.statItem}>
                            <span style={s.statValue}>{targetRoles.length}</span>
                            <span style={s.statLabel}>Target Roles</span>
                        </div>
                    </div>
                </div>

                {/* ── Skills Section ── */}
                <div className="card animate-fade-in delay-100" style={s.section}>
                    <div style={s.sectionHeader}>
                        <div>
                            <h2 style={s.sectionTitle}>🛠 Your Skills</h2>
                            <p style={s.sectionDesc}>
                                Skills extracted from your resume. Add or remove to fine-tune your recommendations.
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={saveSkills}
                            disabled={saving}
                            style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                        >
                            {saving ? "Saving..." : "Save Skills"}
                        </button>
                    </div>

                    {/* Skill Chips */}
                    <div style={s.skillsGrid}>
                        {skills.map((skill) => (
                            <span key={skill} style={s.skillChip}>
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    style={s.removeBtn}
                                    title="Remove skill"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                        {skills.length === 0 && (
                            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
                                No skills yet. Upload a resume or add them manually below.
                            </p>
                        )}
                    </div>

                    {/* Add Skill Input */}
                    <div style={s.addSkillRow}>
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a new skill (e.g. React, Docker)..."
                            style={s.skillInput}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={addSkill}
                            disabled={!newSkill.trim()}
                            style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                        >
                            + Add
                        </button>
                    </div>
                </div>

                {/* ── Target Roles ── */}
                <div className="card animate-fade-in delay-200" style={s.section}>
                    <div style={s.sectionHeader}>
                        <div>
                            <h2 style={s.sectionTitle}>🎯 Target Roles</h2>
                            <p style={s.sectionDesc}>
                                Select the roles you're applying for. We'll scrape internships matching these categories.
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={savePreferences}
                            disabled={saving}
                            style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                        >
                            {saving ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>

                    <div style={s.rolesGrid}>
                        {ROLE_CATEGORIES.map(({ key, label, icon }) => {
                            const active = targetRoles.includes(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleRole(key)}
                                    style={{
                                        ...s.roleCard,
                                        background: active ? "var(--primary-light)" : "var(--surface)",
                                        borderColor: active ? "var(--primary)" : "var(--surface-border)",
                                        color: active ? "var(--primary)" : "var(--foreground-secondary)",
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{label}</span>
                                    {active && <span style={s.checkmark}>✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Refresh Internships Button */}
                    <div style={{ marginTop: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={triggerScrape}
                            disabled={scraping}
                            style={{ padding: "10px 24px", fontSize: "0.88rem" }}
                        >
                            {scraping ? "⏳ Scraping..." : "🔄 Refresh Internships"}
                        </button>
                        <span style={{ fontSize: "0.82rem", color: "var(--foreground-muted)" }}>
                            Scrape the latest internships from Internshala
                        </span>
                    </div>
                </div>

                {/* ── Career Preferences ── */}
                <div className="card animate-fade-in delay-300" style={s.section}>
                    <h2 style={s.sectionTitle}>⚙️ Career Preferences</h2>

                    <div style={s.prefsGrid}>
                        <div style={s.prefField}>
                            <label style={s.label}>Work Mode</label>
                            <select
                                value={workMode}
                                onChange={(e) => setWorkMode(e.target.value)}
                                style={s.select}
                            >
                                <option value="Remote">Remote</option>
                                <option value="On-site">On-site</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div style={s.prefField}>
                            <label style={s.label}>Preferred Location</label>
                            <input
                                type="text"
                                value={preferredLocation}
                                onChange={(e) => setPreferredLocation(e.target.value)}
                                placeholder="e.g. Bangalore, Remote"
                                style={s.textInput}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Resume Summary ── */}
                <div className="card animate-fade-in delay-400" style={s.section}>
                    <h2 style={s.sectionTitle}>📄 Resume</h2>

                    {profile?.latest_resume ? (
                        <div style={s.resumeCard}>
                            <div style={s.resumeIcon}>📄</div>
                            <div style={{ flex: 1 }}>
                                <p style={s.resumeFileName}>{profile.latest_resume.file_name}</p>
                                <p style={s.resumeMeta}>
                                    Uploaded {new Date(profile.latest_resume.created_at).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric"
                                    })}
                                </p>
                            </div>
                            <div style={s.atsGauge}>
                                <div style={{
                                    ...s.atsCircle,
                                    borderColor: getATSColor(profile.latest_resume.ats_score),
                                    color: getATSColor(profile.latest_resume.ats_score),
                                }}>
                                    {profile.latest_resume.ats_score}
                                </div>
                                <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>ATS</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "32px" }}>
                            <p style={{ color: "var(--foreground-muted)", marginBottom: "16px" }}>
                                No resume uploaded yet.
                            </p>
                        </div>
                    )}
                    <Link
                        href="/upload"
                        className="btn btn-secondary"
                        style={{ marginTop: "16px", display: "inline-flex", textDecoration: "none" }}
                    >
                        {profile?.latest_resume ? "📤 Upload New Resume" : "📤 Upload Resume"}
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ── Styles ── */
const s = {
    page: {
        minHeight: "100vh",
        paddingTop: "72px",
    },
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px 100px",
        position: "relative",
    },
    toast: {
        position: "fixed",
        top: "85px",
        right: "24px",
        padding: "12px 24px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--card-shadow-hover)",
        fontSize: "0.9rem",
        fontWeight: 600,
        zIndex: 9999,
        color: "var(--foreground)",
    },

    // Header
    headerCard: {
        padding: "32px",
        marginBottom: "24px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "28px",
    },
    avatarLarge: {
        width: "72px",
        height: "72px",
        borderRadius: "var(--radius-lg)",
        background: "var(--gradient-primary)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        fontWeight: 700,
        flexShrink: 0,
    },
    userName: {
        fontSize: "1.6rem",
        fontWeight: 800,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
    },
    userEmail: {
        fontSize: "0.92rem",
        color: "var(--foreground-secondary)",
        marginTop: "2px",
    },
    memberSince: {
        fontSize: "0.82rem",
        color: "var(--foreground-muted)",
        marginTop: "4px",
    },
    statsRow: {
        display: "flex",
        gap: "0",
        justifyContent: "space-around",
        padding: "20px 0 0",
        borderTop: "1px solid var(--surface-border)",
    },
    statItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
    },
    statValue: {
        fontSize: "1.5rem",
        fontWeight: 800,
        color: "var(--foreground)",
    },
    statLabel: {
        fontSize: "0.78rem",
        color: "var(--foreground-muted)",
        fontWeight: 500,
    },
    statDivider: {
        width: "1px",
        background: "var(--surface-border)",
        alignSelf: "stretch",
    },

    // Sections
    section: {
        padding: "28px",
        marginBottom: "24px",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap",
    },
    sectionTitle: {
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "6px",
    },
    sectionDesc: {
        fontSize: "0.88rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.6,
    },

    // Skills
    skillsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "16px",
    },
    skillChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
    },
    removeBtn: {
        background: "none",
        border: "none",
        color: "var(--primary)",
        cursor: "pointer",
        fontSize: "0.75rem",
        padding: "0 2px",
        opacity: 0.6,
        lineHeight: 1,
    },
    addSkillRow: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    },
    skillInput: {
        flex: 1,
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        outline: "none",
    },

    // Roles
    rolesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
    },
    roleCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "16px 12px",
        borderRadius: "var(--radius-md)",
        border: "2px solid",
        cursor: "pointer",
        transition: "all 150ms ease",
        position: "relative",
    },
    checkmark: {
        position: "absolute",
        top: "8px",
        right: "8px",
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "var(--primary)",
    },

    // Preferences
    prefsGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginTop: "16px",
    },
    prefField: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "var(--foreground-secondary)",
    },
    select: {
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        cursor: "pointer",
    },
    textInput: {
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        outline: "none",
    },

    // Resume
    resumeCard: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-hover)",
        border: "1px solid var(--surface-border)",
    },
    resumeIcon: {
        fontSize: "2rem",
        flexShrink: 0,
    },
    resumeFileName: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--foreground)",
    },
    resumeMeta: {
        fontSize: "0.82rem",
        color: "var(--foreground-muted)",
        marginTop: "2px",
    },
    atsGauge: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
    },
    atsCircle: {
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        border: "3px solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        fontWeight: 800,
    },
};
