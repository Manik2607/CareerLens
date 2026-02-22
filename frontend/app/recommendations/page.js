"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const WORK_TYPE_OPTIONS = ["All", "Remote", "In-office", "Hybrid"];
const SORT_OPTIONS = [
    { value: "match", label: "Match %" },
    { value: "recent", label: "Most Recent" },
    { value: "salary", label: "Salary (High → Low)" },
];

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

function getMatchColor(match) {
    if (match >= 90) return "var(--success)";
    if (match >= 80) return "var(--primary)";
    if (match >= 70) return "var(--accent)";
    return "var(--warning)";
}

function getMatchBg(match) {
    if (match >= 90) return "var(--success-light)";
    if (match >= 80) return "var(--primary-light)";
    if (match >= 70) return "var(--accent-light)";
    return "var(--warning-light)";
}

function getTypeBadgeColor(type) {
    switch (type) {
        case "Remote":
            return { bg: "var(--success-light)", color: "var(--success)" };
        case "In-office":
        case "On-site":
            return { bg: "var(--primary-light)", color: "var(--primary)" };
        case "Hybrid":
            return { bg: "var(--accent-light)", color: "var(--accent)" };
        default:
            return { bg: "var(--surface-hover)", color: "var(--foreground-secondary)" };
    }
}

export default function RecommendationsPage() {
    const router = useRouter();

    // Auth
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data
    const [recommendations, setRecommendations] = useState([]);
    const [userSkills, setUserSkills] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [activeWorkType, setActiveWorkType] = useState("All");
    const [locationFilter, setLocationFilter] = useState("");
    const [minScore, setMinScore] = useState(0);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [sortBy, setSortBy] = useState("match");

    // Scrape panel
    const [showScrapePanel, setShowScrapePanel] = useState(false);
    const [scrapeCategories, setScrapeCategories] = useState([]);
    const [scrapeWorkType, setScrapeWorkType] = useState("");
    const [scrapeLocation, setScrapeLocation] = useState("");
    const [scraping, setScraping] = useState(false);
    const [scrapeMessage, setScrapeMessage] = useState("");

    // Advanced filters toggle
    const [showFilters, setShowFilters] = useState(false);

    // ── Load user, preferences, and recommendations ──
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUser(user);

            // Load preferences to pre-fill filters
            try {
                const prefs = await fetchAPI(`/preferences/${user.id}`);
                if (prefs) {
                    if (prefs.work_mode && prefs.work_mode !== "") {
                        // Map preference work_mode → filter work type
                        const wm = prefs.work_mode;
                        if (WORK_TYPE_OPTIONS.map(o => o.toLowerCase()).includes(wm.toLowerCase())) {
                            setActiveWorkType(wm);
                        }
                    }
                    if (prefs.preferred_location) {
                        setLocationFilter(prefs.preferred_location);
                    }
                    if (prefs.target_roles && prefs.target_roles.length > 0) {
                        setScrapeCategories(prefs.target_roles);
                    }
                }
            } catch (err) {
                console.error("Could not load preferences:", err);
            }

            // Load resume skills for the skills filter
            try {
                const profile = await fetchAPI(`/profile/${user.id}`);
                if (profile?.latest_resume?.skills) {
                    setUserSkills(profile.latest_resume.skills);
                }
            } catch (err) {
                console.error("Could not load profile:", err);
            }

            fetchRecommendations(user.id);
        };
        init();
    }, []);

    const fetchRecommendations = async (userId) => {
        setLoading(true);
        try {
            const data = await fetchAPI(`/recommendations/${userId}?limit=50`);

            const formatted = data.map(item => ({
                id: item.internship.id,
                company: item.internship.company,
                role: item.internship.role,
                location: item.internship.location || "Unknown",
                type: item.internship.work_type || "Unknown",
                match: item.match_score,
                skills: item.internship.skills || [],
                matched_skills: item.matched_skills || [],
                description: item.internship.description || "No description available",
                posted: item.internship.posted_at ? new Date(item.internship.posted_at).toLocaleDateString() : "Recently",
                posted_raw: item.internship.posted_at || "",
                salary: item.internship.salary || "Unpaid",
                apply_url: item.internship.apply_url
            }));
            setRecommendations(formatted);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
        } finally {
            setLoading(false);
        }
    };

    // ── Client-side filtering & sorting ──
    const filtered = recommendations
        .filter((r) => {
            // Work type
            if (activeWorkType !== "All" && r.type !== activeWorkType) return false;
            // Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (
                    !r.role.toLowerCase().includes(q) &&
                    !r.company.toLowerCase().includes(q) &&
                    !r.description.toLowerCase().includes(q)
                ) return false;
            }
            // Location
            if (locationFilter) {
                if (!r.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
            }
            // Min score
            if (r.match < minScore) return false;
            // Skills
            if (selectedSkills.length > 0) {
                const rSkills = r.skills.map(s => s.toLowerCase());
                const descLower = r.description.toLowerCase();
                const hasSkill = selectedSkills.some(sk =>
                    rSkills.includes(sk.toLowerCase()) || descLower.includes(sk.toLowerCase())
                );
                if (!hasSkill) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "match") return b.match - a.match;
            if (sortBy === "recent") return (b.posted_raw || "").localeCompare(a.posted_raw || "");
            if (sortBy === "salary") {
                const extractNum = (s) => { const m = s.replace(/[^\d]/g, ""); return m ? parseInt(m) : 0; };
                return extractNum(b.salary) - extractNum(a.salary);
            }
            return 0;
        });

    // ── Scrape handler ──
    const handleScrape = async () => {
        setScraping(true);
        setScrapeMessage("");
        try {
            const body = {
                categories: scrapeCategories.length > 0 ? scrapeCategories : [],
                work_type: scrapeWorkType || null,
                location: scrapeLocation || null,
            };
            const res = await fetchAPI("/internships/scrape", {
                method: "POST",
                body,
            });
            setScrapeMessage(`📡 Scraping started for: ${(res.categories || []).join(", ")}`);
            // Re-fetch after a delay to show new results
            setTimeout(() => {
                if (user) fetchRecommendations(user.id);
            }, 8000);
        } catch (err) {
            setScrapeMessage("❌ Failed to start scraping.");
        } finally {
            setTimeout(() => setScraping(false), 3000);
        }
    };

    const toggleScrapeCategory = (key) => {
        setScrapeCategories(prev =>
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    const toggleSkillFilter = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setActiveWorkType("All");
        setLocationFilter("");
        setMinScore(0);
        setSelectedSkills([]);
        setSortBy("match");
    };

    const activeFilterCount = [
        activeWorkType !== "All" ? 1 : 0,
        locationFilter ? 1 : 0,
        minScore > 0 ? 1 : 0,
        selectedSkills.length > 0 ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* ── Header ── */}
                <div className="animate-fade-in" style={styles.header}>
                    <span style={styles.badge}>🎯 Recommendations</span>
                    <h1 style={styles.title}>
                        Your personalized <span className="gradient-text">matches</span>
                    </h1>
                    <p style={styles.subtitle}>
                        Based on your resume analysis, here are the internships that best
                        match your skills and experience.
                    </p>
                </div>

                {/* ── Search Bar ── */}
                <div className="animate-fade-in delay-100" style={styles.searchContainer}>
                    <div style={styles.searchWrapper}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by role, company, or keyword..."
                            style={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                style={styles.clearBtn}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Quick Filters Bar ── */}
                <div className="animate-fade-in delay-200" style={styles.toolbar}>
                    <div style={styles.toolbarLeft}>
                        <div style={styles.filterGroup}>
                            {WORK_TYPE_OPTIONS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveWorkType(filter)}
                                    style={{
                                        ...styles.filterBtn,
                                        background:
                                            activeWorkType === filter
                                                ? "var(--primary)"
                                                : "var(--surface)",
                                        color:
                                            activeWorkType === filter
                                                ? "#ffffff"
                                                : "var(--foreground-secondary)",
                                        borderColor:
                                            activeWorkType === filter
                                                ? "var(--primary)"
                                                : "var(--surface-border)",
                                    }}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                ...styles.filterToggleBtn,
                                background: showFilters || activeFilterCount > 0
                                    ? "var(--primary-light)"
                                    : "var(--surface)",
                                color: showFilters || activeFilterCount > 0
                                    ? "var(--primary)"
                                    : "var(--foreground-secondary)",
                                borderColor: showFilters || activeFilterCount > 0
                                    ? "var(--primary)"
                                    : "var(--surface-border)",
                            }}
                        >
                            ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </button>
                    </div>

                    <div style={styles.toolbarRight}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.sortSelect}
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Advanced Filters Panel ── */}
                {showFilters && (
                    <div className="card animate-fade-in" style={styles.filtersPanel}>
                        <div style={styles.filtersPanelHeader}>
                            <h3 style={styles.filtersPanelTitle}>🔧 Advanced Filters</h3>
                            <button
                                onClick={clearFilters}
                                style={styles.clearAllBtn}
                            >
                                Clear All
                            </button>
                        </div>

                        <div style={styles.filtersGrid}>
                            {/* Location */}
                            <div style={styles.filterField}>
                                <label style={styles.filterLabel}>📍 Location</label>
                                <input
                                    type="text"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    placeholder="e.g. Bangalore, Delhi, Remote..."
                                    style={styles.filterInput}
                                />
                            </div>

                            {/* Min Match Score */}
                            <div style={styles.filterField}>
                                <label style={styles.filterLabel}>
                                    📊 Min Match Score: <strong>{minScore}%</strong>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))}
                                    style={styles.slider}
                                />
                                <div style={styles.sliderLabels}>
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills Filter */}
                        {userSkills.length > 0 && (
                            <div style={{ marginTop: "16px" }}>
                                <label style={styles.filterLabel}>🛠 Filter by Skills</label>
                                <div style={styles.skillsFilterGrid}>
                                    {userSkills.map((skill) => {
                                        const active = selectedSkills.includes(skill);
                                        return (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkillFilter(skill)}
                                                style={{
                                                    ...styles.skillFilterChip,
                                                    background: active ? "var(--primary)" : "var(--surface)",
                                                    color: active ? "#ffffff" : "var(--foreground-secondary)",
                                                    borderColor: active ? "var(--primary)" : "var(--surface-border)",
                                                }}
                                            >
                                                {active && "✓ "}{skill}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Scrape Panel Toggle ── */}
                <div className="animate-fade-in delay-200" style={{ marginBottom: "20px" }}>
                    <button
                        onClick={() => setShowScrapePanel(!showScrapePanel)}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.88rem", padding: "10px 20px" }}
                    >
                        {showScrapePanel ? "▲ Hide Scrape Options" : "📡 Fetch New Internships"}
                    </button>
                </div>

                {/* ── Scrape Panel ── */}
                {showScrapePanel && (
                    <div className="card animate-fade-in" style={styles.scrapePanel}>
                        <h3 style={styles.scrapePanelTitle}>📡 Scrape New Internships</h3>
                        <p style={styles.scrapePanelDesc}>
                            Select categories and filters to scrape fresh internships from Internshala.
                        </p>

                        {/* Category pills */}
                        <label style={styles.filterLabel}>Categories</label>
                        <div style={styles.scrapeCategoriesGrid}>
                            {ROLE_CATEGORIES.map(({ key, label, icon }) => {
                                const active = scrapeCategories.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleScrapeCategory(key)}
                                        style={{
                                            ...styles.scrapeCategoryChip,
                                            background: active ? "var(--primary-light)" : "var(--surface)",
                                            borderColor: active ? "var(--primary)" : "var(--surface-border)",
                                            color: active ? "var(--primary)" : "var(--foreground-secondary)",
                                        }}
                                    >
                                        <span>{icon}</span> {label}
                                        {active && <span style={{ fontWeight: 700 }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Scrape filters row */}
                        <div style={styles.scrapeFiltersRow}>
                            <div style={styles.filterField}>
                                <label style={styles.filterLabel}>Work Type</label>
                                <select
                                    value={scrapeWorkType}
                                    onChange={(e) => setScrapeWorkType(e.target.value)}
                                    style={styles.filterInput}
                                >
                                    <option value="">Any</option>
                                    <option value="remote">Remote / WFH</option>
                                    <option value="in-office">In-office</option>
                                </select>
                            </div>
                            <div style={styles.filterField}>
                                <label style={styles.filterLabel}>Location</label>
                                <input
                                    type="text"
                                    value={scrapeLocation}
                                    onChange={(e) => setScrapeLocation(e.target.value)}
                                    placeholder="e.g. Bangalore, Delhi..."
                                    style={styles.filterInput}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleScrape}
                                disabled={scraping}
                                style={{ padding: "10px 28px", fontSize: "0.9rem" }}
                            >
                                {scraping ? "⏳ Scraping..." : "🚀 Start Scraping"}
                            </button>
                            {scrapeCategories.length === 0 && (
                                <span style={{ fontSize: "0.82rem", color: "var(--foreground-muted)" }}>
                                    No categories selected — defaults will be used
                                </span>
                            )}
                        </div>

                        {scrapeMessage && (
                            <div style={styles.scrapeToast}>{scrapeMessage}</div>
                        )}
                    </div>
                )}

                {/* ── Results Count ── */}
                <p className="animate-fade-in delay-200" style={styles.resultCount}>
                    Showing <strong>{filtered.length}</strong> internship
                    {filtered.length !== 1 ? "s" : ""}
                    {activeFilterCount > 0 && (
                        <span style={{ color: "var(--primary)", marginLeft: "8px" }}>
                            ({activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active)
                        </span>
                    )}
                </p>

                {/* ── Cards ── */}
                {loading ? (
                    <div style={styles.loadingState}>
                        <div style={styles.spinner} />
                        <p style={{ color: "var(--foreground-secondary)" }}>Loading recommendations...</p>
                    </div>
                ) : (
                    <div style={styles.cardList}>
                        {filtered.map((rec, i) => {
                            const typeBadge = getTypeBadgeColor(rec.type);
                            return (
                                <div
                                    key={rec.id}
                                    className="card animate-fade-in-up"
                                    style={{
                                        ...styles.recCard,
                                        animationDelay: `${(i + 2) * 80}ms`,
                                    }}
                                >
                                    <div style={styles.cardTop}>
                                        <div style={styles.companyRow}>
                                            <div style={styles.companyAvatar}>
                                                {rec.company.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 style={styles.roleName}>{rec.role}</h3>
                                                <p style={styles.companyName}>{rec.company}</p>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                ...styles.matchBadge,
                                                background: getMatchBg(rec.match),
                                                color: getMatchColor(rec.match),
                                            }}
                                        >
                                            {rec.match}% match
                                        </div>
                                    </div>

                                    <p style={styles.recDesc}>{rec.description}</p>

                                    <div style={styles.metaRow}>
                                        <span style={styles.metaItem}>📍 {rec.location}</span>
                                        <span
                                            style={{
                                                ...styles.typeBadge,
                                                background: typeBadge.bg,
                                                color: typeBadge.color,
                                            }}
                                        >
                                            {rec.type}
                                        </span>
                                        <span style={styles.metaItem}>💰 {rec.salary}</span>
                                        <span style={styles.metaItem}>🕐 {rec.posted}</span>
                                    </div>

                                    {/* Skills with matched highlighting */}
                                    <div style={styles.skillsRow}>
                                        {rec.skills.map((skill, idx) => {
                                            const isMatched = rec.matched_skills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                                            return (
                                                <span
                                                    key={`${rec.id}-skill-${idx}`}
                                                    style={{
                                                        ...styles.skillChip,
                                                        background: isMatched ? "var(--success-light)" : "var(--primary-light)",
                                                        color: isMatched ? "var(--success)" : "var(--primary)",
                                                    }}
                                                >
                                                    {isMatched && "✓ "}{skill}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <div style={styles.cardActions}>
                                        <a
                                            href={rec.apply_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{ ...styles.applyBtn, textDecoration: 'none', display: 'inline-block' }}
                                        >
                                            Apply Now
                                        </a>
                                        <button className="btn btn-ghost" style={styles.saveBtn}>
                                            ♡ Save
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && filtered.length === 0 && (
                    <div style={styles.emptyState}>
                        <span style={{ fontSize: "3rem" }}>🔍</span>
                        <h3 style={styles.emptyTitle}>No matches found</h3>
                        <p style={styles.emptyDesc}>
                            Try adjusting your filters or{" "}
                            <Link
                                href="/upload"
                                style={{ color: "var(--primary)", textDecoration: "none" }}
                            >
                                upload a different resume
                            </Link>
                            .
                        </p>
                        {activeFilterCount > 0 && (
                            <button
                                className="btn btn-secondary"
                                onClick={clearFilters}
                                style={{ marginTop: "12px" }}
                            >
                                Clear all filters
                            </button>
                        )}
                        {!user && (
                            <p style={{ marginTop: '10px' }}>
                                Please <Link href="/login" style={{ color: 'var(--primary)' }}>login</Link> to see personalized recommendations.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════ */
/*  Styles                                           */
/* ══════════════════════════════════════════════════ */
const styles = {
    page: {
        minHeight: "100vh",
        paddingTop: "72px",
    },
    container: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "48px 24px 100px",
    },
    header: {
        textAlign: "center",
        marginBottom: "36px",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 18px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
        marginBottom: "20px",
    },
    title: {
        fontSize: "clamp(2rem, 4vw, 2.8rem)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--foreground)",
        marginBottom: "16px",
    },
    subtitle: {
        fontSize: "1.1rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
        maxWidth: "520px",
        margin: "0 auto",
    },

    /* Search */
    searchContainer: {
        marginBottom: "20px",
    },
    searchWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    searchIcon: {
        position: "absolute",
        left: "16px",
        fontSize: "1rem",
        pointerEvents: "none",
        zIndex: 1,
    },
    searchInput: {
        width: "100%",
        padding: "14px 44px 14px 44px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.95rem",
        outline: "none",
        transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    },
    clearBtn: {
        position: "absolute",
        right: "14px",
        background: "none",
        border: "none",
        color: "var(--foreground-muted)",
        cursor: "pointer",
        fontSize: "0.9rem",
        padding: "4px",
    },

    /* Toolbar */
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "16px",
    },
    toolbarLeft: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
    },
    toolbarRight: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    },
    filterGroup: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
    },
    filterBtn: {
        padding: "7px 16px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        fontSize: "0.82rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all var(--transition-fast)",
    },
    filterToggleBtn: {
        padding: "7px 16px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        fontSize: "0.82rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all var(--transition-fast)",
    },
    sortSelect: {
        padding: "8px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.82rem",
        cursor: "pointer",
    },

    /* Advanced Filters Panel */
    filtersPanel: {
        padding: "24px",
        marginBottom: "20px",
    },
    filtersPanelHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    filtersPanelTitle: {
        fontSize: "1rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    clearAllBtn: {
        background: "none",
        border: "none",
        color: "var(--primary)",
        cursor: "pointer",
        fontSize: "0.82rem",
        fontWeight: 600,
    },
    filtersGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
    },
    filterField: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    filterLabel: {
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "var(--foreground-secondary)",
        marginBottom: "2px",
    },
    filterInput: {
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.88rem",
        outline: "none",
    },
    slider: {
        width: "100%",
        accentColor: "var(--primary)",
        cursor: "pointer",
    },
    sliderLabels: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.72rem",
        color: "var(--foreground-muted)",
    },
    skillsFilterGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginTop: "6px",
    },
    skillFilterChip: {
        padding: "5px 12px",
        borderRadius: "var(--radius-full)",
        border: "1px solid",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all var(--transition-fast)",
    },

    /* Scrape Panel */
    scrapePanel: {
        padding: "24px",
        marginBottom: "24px",
    },
    scrapePanelTitle: {
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "6px",
    },
    scrapePanelDesc: {
        fontSize: "0.88rem",
        color: "var(--foreground-secondary)",
        marginBottom: "16px",
        lineHeight: 1.6,
    },
    scrapeCategoriesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
        gap: "8px",
        marginBottom: "16px",
    },
    scrapeCategoryChip: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        border: "2px solid",
        fontSize: "0.82rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 150ms ease",
    },
    scrapeFiltersRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginTop: "8px",
    },
    scrapeToast: {
        marginTop: "12px",
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.85rem",
        fontWeight: 600,
    },

    /* Results */
    resultCount: {
        fontSize: "0.88rem",
        color: "var(--foreground-muted)",
        marginBottom: "20px",
    },

    /* Loading */
    loadingState: {
        textAlign: "center",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },
    spinner: {
        width: "36px",
        height: "36px",
        border: "3px solid var(--surface-border)",
        borderTop: "3px solid var(--primary)",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
    },

    /* Cards */
    cardList: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },
    recCard: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        flexWrap: "wrap",
    },
    companyRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },
    companyAvatar: {
        width: "48px",
        height: "48px",
        borderRadius: "var(--radius-md)",
        background: "var(--gradient-primary)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        fontWeight: 700,
        flexShrink: 0,
    },
    roleName: {
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    companyName: {
        fontSize: "0.88rem",
        color: "var(--foreground-secondary)",
        marginTop: "2px",
    },
    matchBadge: {
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.85rem",
        fontWeight: 700,
        flexShrink: 0,
    },
    recDesc: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
    },
    metaItem: {
        fontSize: "0.8rem",
        color: "var(--foreground-muted)",
    },
    typeBadge: {
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.76rem",
        fontWeight: 600,
    },
    skillsRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
    },
    skillChip: {
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.76rem",
        fontWeight: 600,
    },
    cardActions: {
        display: "flex",
        gap: "12px",
        marginTop: "2px",
    },
    applyBtn: {
        padding: "10px 24px",
        fontSize: "0.86rem",
    },
    saveBtn: {
        padding: "10px 16px",
        fontSize: "0.86rem",
    },

    /* Empty */
    emptyState: {
        textAlign: "center",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    emptyTitle: {
        fontSize: "1.3rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    emptyDesc: {
        fontSize: "0.95rem",
        color: "var(--foreground-secondary)",
    },
};
