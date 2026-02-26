"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { fetchAPI } from "../../lib/api";
import Link from "next/link";

const ROLE_CATEGORIES = [
    { key: "web development", label: "Web Development" },
    { key: "python", label: "Python" },
    { key: "machine learning", label: "Machine Learning" },
    { key: "data science", label: "Data Science" },
    { key: "frontend development", label: "Frontend" },
    { key: "backend development", label: "Backend" },
    { key: "mobile app development", label: "Mobile Dev" },
    { key: "devops", label: "DevOps" },
];

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [skills, setSkills] = useState([]);
    const [targetRoles, setTargetRoles] = useState([]);
    const [newRole, setNewRole] = useState("");
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

    const addCustomRole = () => {
        const role = newRole.trim().toLowerCase();
        if (role && !targetRoles.includes(role)) {
            setTargetRoles([...targetRoles, role]);
            setNewRole("");
        }
    };

    const removeCustomRole = (roleToRemove) => {
        setTargetRoles(targetRoles.filter(r => r !== roleToRemove));
    };

    const handleRoleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addCustomRole();
        }
    };

    const saveSkills = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetchAPI(`/profile/${user.id}/skills`, {
                method: "PUT",
                body: { skills }
            });
            showMessage("Skills updated!");
        } catch (err) {
            showMessage("Failed to save skills");
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
            showMessage("Preferences saved!");
        } catch (err) {
            showMessage("Failed to save preferences");
        } finally {
            setSaving(false);
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

    const getATSLabel = (score) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Needs Work";
    };

    if (loading) {
        return (
            <section style={s.page}>
                <div style={s.container}>
                    <div style={s.loadingWrap}>
                        <div style={s.loadingSpinner} />
                        <p style={{ color: "var(--foreground-secondary)", fontSize: "0.95rem" }}>Loading your profile...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section style={s.page}>
                <div style={s.container}>
                    <div className="animate-fade-in" style={s.lockedWrap}>
                        <div style={s.lockedIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h2 style={s.lockedTitle}>Sign in to view your profile</h2>
                        <p style={s.lockedDesc}>
                            Access your skills, career preferences, and resume analysis — all in one place.
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{ padding: "14px 36px", fontSize: "1rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            Log In
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section style={s.page}>
            <div style={s.container}>
                {/* Toast Message */}
                {saveMessage && (
                    <div style={s.toast} className="animate-fade-in card">
                        {saveMessage}
                    </div>
                )}

                {/* Page Title */}
                <div className="animate-fade-in" style={s.pageHeader}>
                    <h1 style={s.pageTitle}>
                        My <span className="gradient-text">Profile</span>
                    </h1>
                    <p style={s.pageSubtitle}>Manage your skills, preferences, and career information</p>
                </div>

                {/* ── Profile Header Card ── */}
                <div className="card animate-fade-in-up delay-100" style={s.headerCard}>
                    <div style={s.headerTop}>
                        <div style={s.headerRow}>
                            <div style={s.avatarLarge}>
                                {profile?.user?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div style={s.headerInfo}>
                                <h2 style={s.userName}>
                                    {profile?.user?.full_name || user.email?.split("@")[0]}
                                </h2>
                                <div style={s.userMeta}>
                                    <span style={s.metaItem}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                        {user.email}
                                    </span>
                                    <span style={s.metaItem}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        Joined {profile?.user?.created_at
                                            ? new Date(profile.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                            : "recently"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={s.statsRow}>
                        <div style={s.statCard}>
                            <div style={s.statIconWrap}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span style={s.statValue}>{skills.length}</span>
                            <span style={s.statLabel}>Skills</span>
                        </div>
                        <div style={s.statCard}>
                            <div style={{
                                ...s.statIconWrap,
                                background: profile?.latest_resume?.ats_score >= 60 ? "var(--success-light)" : "var(--warning-light)",
                                color: profile?.latest_resume?.ats_score >= 60 ? "var(--success)" : "var(--warning)",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            <span style={{
                                ...s.statValue,
                                color: getATSColor(profile?.latest_resume?.ats_score || 0),
                            }}>
                                {profile?.latest_resume?.ats_score || "—"}
                            </span>
                            <span style={s.statLabel}>ATS Score</span>
                        </div>
                        <div style={s.statCard}>
                            <div style={{ ...s.statIconWrap, background: "var(--accent-light)", color: "var(--accent)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <span style={s.statValue}>{workMode}</span>
                            <span style={s.statLabel}>Work Mode</span>
                        </div>
                    </div>
                </div>

                {/* ── Two-Column Layout ── */}
                <div style={s.twoCol}>
                    {/* Left Column */}
                    <div style={s.colMain}>
                        {/* ── Skills Section ── */}
                        <div className="card animate-fade-in-up delay-200" style={s.section}>
                            <div style={s.sectionHeader}>
                                <div style={s.sectionTitleRow}>
                                    <div style={s.sectionIconWrap}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 style={s.sectionTitle}>Your Skills</h2>
                                        <p style={s.sectionDesc}>
                                            Add or remove skills to fine-tune your recommendations
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={saveSkills}
                                    disabled={saving}
                                    style={{ padding: "10px 22px", fontSize: "0.85rem" }}
                                >
                                    {saving ? (
                                        <>
                                            <span style={s.btnSpinner} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Skill Chips */}
                            <div style={s.skillsGrid}>
                                {skills.map((skill) => (
                                    <span key={skill} style={s.skillChip} className="profile-skill-chip">
                                        {skill}
                                        <button
                                            onClick={() => removeSkill(skill)}
                                            style={s.removeBtn}
                                            title="Remove skill"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                                {skills.length === 0 && (
                                    <div style={s.emptySkills}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-muted)" }}>
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                        <p style={{ color: "var(--foreground-muted)", fontSize: "0.88rem" }}>
                                            No skills yet — add them manually below
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Add Skill Input */}
                            <div style={s.addSkillRow}>
                                <div style={s.skillInputWrap}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s.skillInputIcon}>
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a skill and press Enter..."
                                        style={s.skillInput}
                                        className="auth-input"
                                    />
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={addSkill}
                                    disabled={!newSkill.trim()}
                                    style={{ padding: "10px 20px", fontSize: "0.88rem", whiteSpace: "nowrap" }}
                                >
                                    Add Skill
                                </button>
                            </div>
                        </div>

                        {/* ── Target Roles ── */}
                        <div className="card animate-fade-in-up delay-300" style={s.section}>
                            <div style={s.sectionHeader}>
                                <div style={s.sectionTitleRow}>
                                    <div style={{ ...s.sectionIconWrap, background: "var(--warning-light)", color: "var(--warning)" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="6" />
                                            <circle cx="12" cy="12" r="2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 style={s.sectionTitle}>Target Roles</h2>
                                        <p style={s.sectionDesc}>Select the roles you&apos;re interested in for tailored recommendations</p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={savePreferences}
                                    disabled={saving}
                                    style={{ padding: "10px 22px", fontSize: "0.85rem" }}
                                >
                                    {saving ? (
                                        <>
                                            <span style={s.btnSpinner} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>

                            <div style={s.rolesGrid}>
                                    {ROLE_CATEGORIES.map(({ key, label }) => {
                                    const active = targetRoles.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => toggleRole(key)}
                                            className="profile-role-card"
                                            style={{
                                                ...s.roleCard,
                                                background: active ? "var(--primary-light)" : "var(--surface)",
                                                borderColor: active ? "var(--primary)" : "var(--surface-border)",
                                                color: active ? "var(--primary)" : "var(--foreground-secondary)",
                                            }}
                                        >
                                            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{label}</span>
                                            {active && (
                                                <span style={s.checkmark}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom roles chips */}
                            {targetRoles.filter(r => !ROLE_CATEGORIES.some(c => c.key === r)).length > 0 && (
                                <div style={{ marginTop: "16px" }}>
                                    <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", fontWeight: 500, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Custom Roles</p>
                                    <div style={s.skillsGrid}>
                                        {targetRoles
                                            .filter(r => !ROLE_CATEGORIES.some(c => c.key === r))
                                            .map((role) => (
                                                <span key={role} style={{ ...s.skillChip, background: "var(--warning-light)", color: "var(--warning)" }} className="profile-skill-chip">
                                                    {role}
                                                    <button
                                                        onClick={() => removeCustomRole(role)}
                                                        style={{ ...s.removeBtn, color: "var(--warning)" }}
                                                        title="Remove role"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Add custom role input */}
                            <div style={{ ...s.addSkillRow, marginTop: "16px" }}>
                                <div style={s.skillInputWrap}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s.skillInputIcon}>
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        onKeyDown={handleRoleKeyDown}
                                        placeholder="Add a custom role (e.g. UI/UX Design)..."
                                        style={s.skillInput}
                                        className="auth-input"
                                    />
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={addCustomRole}
                                    disabled={!newRole.trim()}
                                    style={{ padding: "10px 20px", fontSize: "0.88rem", whiteSpace: "nowrap" }}
                                >
                                    Add Role
                                </button>
                            </div>
                        </div>

                        {/* ── Career Preferences ── */}
                        <div className="card animate-fade-in-up delay-400" style={s.section}>
                            <div style={s.sectionHeader}>
                                <div style={s.sectionTitleRow}>
                                    <div style={{ ...s.sectionIconWrap, background: "var(--accent-light)", color: "var(--accent)" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 style={s.sectionTitle}>Career Preferences</h2>
                                        <p style={s.sectionDesc}>Set your work preferences for better matches</p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={savePreferences}
                                    disabled={saving}
                                    style={{ padding: "10px 22px", fontSize: "0.85rem" }}
                                >
                                    {saving ? (
                                        <>
                                            <span style={s.btnSpinner} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>

                            <div style={s.prefsGrid}>
                                <div style={s.prefField}>
                                    <label style={s.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Work Mode
                                    </label>
                                    <div style={s.radioGroup}>
                                        {["Remote", "On-site", "Hybrid"].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setWorkMode(mode)}
                                                style={{
                                                    ...s.radioBtn,
                                                    background: workMode === mode ? "var(--primary-light)" : "var(--surface)",
                                                    borderColor: workMode === mode ? "var(--primary)" : "var(--surface-border)",
                                                    color: workMode === mode ? "var(--primary)" : "var(--foreground-secondary)",
                                                    fontWeight: workMode === mode ? 600 : 500,
                                                }}
                                                className="profile-radio-btn"
                                            >
                                                {workMode === mode && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={s.prefField}>
                                    <label style={s.label}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Preferred Location
                                    </label>
                                    <input
                                        type="text"
                                        value={preferredLocation}
                                        onChange={(e) => setPreferredLocation(e.target.value)}
                                        placeholder="e.g. Bangalore, Remote"
                                        style={s.textInput}
                                        className="auth-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Resume */}
                    <div style={s.colSide}>
                        <div className="card animate-fade-in-up delay-300" style={s.resumeSection}>
                            <div style={s.sectionTitleRow}>
                                <div style={{ ...s.sectionIconWrap, background: "var(--success-light)", color: "var(--success)" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h2 style={s.sectionTitle}>Resume</h2>
                            </div>

                            {profile?.latest_resume ? (
                                <div style={s.resumeContent}>
                                    {/* ATS Score Visual */}
                                    <div style={s.atsVisual}>
                                        <div style={{
                                            ...s.atsRing,
                                            borderColor: getATSColor(profile.latest_resume.ats_score),
                                        }}>
                                            <span style={{
                                                fontSize: "1.6rem",
                                                fontWeight: 800,
                                                color: getATSColor(profile.latest_resume.ats_score),
                                            }}>
                                                {profile.latest_resume.ats_score}
                                            </span>
                                            <span style={{ fontSize: "0.7rem", color: "var(--foreground-muted)", fontWeight: 500 }}>ATS Score</span>
                                        </div>
                                        <span style={{
                                            ...s.atsBadge,
                                            background: getATSColor(profile.latest_resume.ats_score),
                                        }}>
                                            {getATSLabel(profile.latest_resume.ats_score)}
                                        </span>
                                    </div>

                                    {/* File info */}
                                    <div style={s.resumeFileCard}>
                                        <div style={s.fileIconWrap}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={s.resumeFileName}>{profile.latest_resume.file_name}</p>
                                            <p style={s.resumeMeta}>
                                                Uploaded {new Date(profile.latest_resume.created_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={s.noResumeWrap}>
                                    <div style={s.noResumeIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.88rem", textAlign: "center" }}>
                                        No resume uploaded yet
                                    </p>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.78rem", textAlign: "center", opacity: 0.7 }}>
                                        Upload your resume from the Upload page to get ATS scores and recommendations
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="card animate-fade-in-up delay-400" style={s.quickActions}>
                            <h3 style={{ ...s.sectionTitle, fontSize: "1rem", marginBottom: "14px" }}>Quick Actions</h3>
                            <div style={s.actionsList}>
                                <Link href="/upload" style={s.actionItem} className="profile-action-item">
                                    <div style={{ ...s.actionIcon, background: "var(--primary-light)", color: "var(--primary)" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span style={s.actionLabel}>Upload Resume</span>
                                        <span style={s.actionDesc}>Analyze with AI</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-muted)", marginLeft: "auto" }}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                                <Link href="/recommendations" style={s.actionItem} className="profile-action-item">
                                    <div style={{ ...s.actionIcon, background: "var(--accent-light)", color: "var(--accent)" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.3-4.3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span style={s.actionLabel}>Recommendations</span>
                                        <span style={s.actionDesc}>View matched roles</span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-muted)", marginLeft: "auto" }}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Styles ── */
const s = {
    page: {
        position: "relative",
        minHeight: "100vh",
        paddingTop: "72px",
        overflow: "hidden",
    },
    container: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "48px 24px 100px",
        position: "relative",
        zIndex: 1,
    },

    // Loading & Locked
    loadingWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "100px 24px",
    },
    loadingSpinner: {
        width: "36px",
        height: "36px",
        border: "3px solid var(--surface-border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
    },
    lockedWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "80px 24px",
        textAlign: "center",
    },
    lockedIcon: {
        width: "72px",
        height: "72px",
        borderRadius: "var(--radius-lg)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px",
    },
    lockedTitle: {
        fontSize: "1.6rem",
        fontWeight: 800,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
    },
    lockedDesc: {
        fontSize: "1rem",
        color: "var(--foreground-secondary)",
        maxWidth: "400px",
        lineHeight: 1.6,
    },

    // Page Header
    pageHeader: {
        marginBottom: "32px",
    },
    pageTitle: {
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        fontWeight: 800,
        color: "var(--foreground)",
        letterSpacing: "-0.03em",
        marginBottom: "8px",
    },
    pageSubtitle: {
        fontSize: "1rem",
        color: "var(--foreground-secondary)",
    },

    // Toast
    toast: {
        position: "fixed",
        top: "85px",
        right: "24px",
        padding: "14px 24px",
        borderRadius: "var(--radius-md)",
        fontSize: "0.9rem",
        fontWeight: 600,
        zIndex: 9999,
        color: "var(--foreground)",
    },

    // Header Card
    headerCard: {
        padding: "32px",
        marginBottom: "28px",
    },
    headerTop: {
        marginBottom: "24px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    headerInfo: {
        flex: 1,
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
        boxShadow: "0 4px 16px var(--primary-glow)",
    },
    userName: {
        fontSize: "1.5rem",
        fontWeight: 800,
        color: "var(--foreground)",
        letterSpacing: "-0.02em",
        marginBottom: "8px",
    },
    userMeta: {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
    },
    metaItem: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.85rem",
        color: "var(--foreground-muted)",
    },

    // Stats
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        paddingTop: "24px",
        borderTop: "1px solid var(--surface-border)",
    },
    statCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "16px 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
    statIconWrap: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-sm)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: "1.4rem",
        fontWeight: 800,
        color: "var(--foreground)",
        lineHeight: 1,
    },
    statLabel: {
        fontSize: "0.75rem",
        color: "var(--foreground-muted)",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },

    // Two Column Layout
    twoCol: {
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "24px",
        alignItems: "start",
    },
    colMain: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    colSide: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "sticky",
        top: "96px",
    },

    // Sections
    section: {
        padding: "28px",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
    },
    sectionTitleRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },
    sectionIconWrap: {
        width: "44px",
        height: "44px",
        borderRadius: "var(--radius-md)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    sectionTitle: {
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "4px",
    },
    sectionDesc: {
        fontSize: "0.85rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.5,
    },

    // Skills
    skillsGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "20px",
        minHeight: "40px",
    },
    skillChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
        transition: "all 200ms ease",
    },
    removeBtn: {
        background: "none",
        border: "none",
        color: "var(--primary)",
        cursor: "pointer",
        padding: "2px",
        opacity: 0.5,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        transition: "opacity 200ms",
    },
    emptySkills: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "24px",
        width: "100%",
    },
    addSkillRow: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    },
    skillInputWrap: {
        flex: 1,
        position: "relative",
    },
    skillInputIcon: {
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--foreground-muted)",
        pointerEvents: "none",
    },
    skillInput: {
        width: "100%",
        padding: "11px 16px 11px 40px",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        outline: "none",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // Roles
    rolesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "10px",
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
        transition: "all 200ms ease",
        position: "relative",
        background: "none",
    },
    checkmark: {
        position: "absolute",
        top: "8px",
        right: "8px",
        color: "var(--primary)",
        display: "flex",
        alignItems: "center",
    },

    // Preferences
    prefsGrid: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    prefField: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "var(--foreground)",
    },
    radioGroup: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },
    radioBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 18px",
        borderRadius: "var(--radius-full)",
        border: "1.5px solid",
        cursor: "pointer",
        fontSize: "0.88rem",
        transition: "all 200ms ease",
        background: "none",
    },
    textInput: {
        padding: "11px 16px",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        outline: "none",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // Resume Section
    resumeSection: {
        padding: "24px",
    },
    resumeContent: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "20px",
    },
    atsVisual: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "20px 0",
    },
    atsRing: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        border: "4px solid",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        background: "var(--surface)",
    },
    atsBadge: {
        padding: "4px 14px",
        borderRadius: "var(--radius-full)",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
    },
    resumeFileCard: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
    },
    fileIconWrap: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-sm)",
        background: "var(--success-light)",
        color: "var(--success)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    resumeFileName: {
        fontSize: "0.88rem",
        fontWeight: 600,
        color: "var(--foreground)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    resumeMeta: {
        fontSize: "0.78rem",
        color: "var(--foreground-muted)",
        marginTop: "2px",
    },

    // No resume
    noResumeWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "32px 16px",
    },
    noResumeIcon: {
        width: "56px",
        height: "56px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px dashed var(--surface-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--foreground-muted)",
    },

    // Quick Actions
    quickActions: {
        padding: "24px",
    },
    actionsList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    actionItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        transition: "all 200ms ease",
        border: "1px solid transparent",
    },
    actionIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    actionLabel: {
        display: "block",
        fontSize: "0.88rem",
        fontWeight: 600,
        color: "var(--foreground)",
    },
    actionDesc: {
        display: "block",
        fontSize: "0.75rem",
        color: "var(--foreground-muted)",
    },

    // Button Spinner
    btnSpinner: {
        width: "14px",
        height: "14px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
    },
};
