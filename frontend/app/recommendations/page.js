"use client";

import { useState } from "react";
import Link from "next/link";

// Sample recommendation data (will be replaced by API data)
const sampleRecommendations = [
    {
        id: 1,
        company: "TechNova Inc.",
        role: "Frontend Engineering Intern",
        location: "San Francisco, CA",
        type: "Hybrid",
        match: 96,
        skills: ["React", "TypeScript", "CSS", "Git"],
        description:
            "Join our engineering team to build beautiful, performant web applications used by millions. Work alongside senior engineers on real product features.",
        posted: "2 days ago",
        salary: "$35-45/hr",
    },
    {
        id: 2,
        company: "DataFlow AI",
        role: "Machine Learning Intern",
        location: "New York, NY",
        type: "Remote",
        match: 91,
        skills: ["Python", "TensorFlow", "SQL", "Data Analysis"],
        description:
            "Help build and deploy ML models that power intelligent document processing. Gain hands-on experience with production ML systems.",
        posted: "5 days ago",
        salary: "$40-50/hr",
    },
    {
        id: 3,
        company: "CloudScale Systems",
        role: "Backend Engineering Intern",
        location: "Seattle, WA",
        type: "On-site",
        match: 87,
        skills: ["Node.js", "Python", "AWS", "Docker"],
        description:
            "Design and build scalable microservices that handle millions of requests. Cloud infrastructure experience is a plus.",
        posted: "1 week ago",
        salary: "$38-48/hr",
    },
    {
        id: 4,
        company: "DesignCraft Studio",
        role: "UI/UX Design Intern",
        location: "Austin, TX",
        type: "Remote",
        match: 82,
        skills: ["Figma", "CSS", "Design Systems", "Prototyping"],
        description:
            "Work with our design team to create intuitive, accessible interfaces for our SaaS platform. Strong visual design sense required.",
        posted: "3 days ago",
        salary: "$30-40/hr",
    },
    {
        id: 5,
        company: "SecureNet Labs",
        role: "Cybersecurity Intern",
        location: "Washington, DC",
        type: "Hybrid",
        match: 78,
        skills: ["Python", "Linux", "Networking", "Security"],
        description:
            "Assist in vulnerability assessments, penetration testing, and security audits. Learn from experienced security professionals.",
        posted: "1 week ago",
        salary: "$35-45/hr",
    },
    {
        id: 6,
        company: "MobileFirst Apps",
        role: "Mobile Development Intern",
        location: "Los Angeles, CA",
        type: "On-site",
        match: 74,
        skills: ["React Native", "JavaScript", "REST APIs", "Firebase"],
        description:
            "Build cross-platform mobile apps from scratch. Ship features to the App Store and Google Play.",
        posted: "4 days ago",
        salary: "$32-42/hr",
    },
];

const filterOptions = ["All", "Remote", "On-site", "Hybrid"];

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
        case "On-site":
            return { bg: "var(--primary-light)", color: "var(--primary)" };
        case "Hybrid":
            return { bg: "var(--accent-light)", color: "var(--accent)" };
        default:
            return { bg: "var(--surface-hover)", color: "var(--foreground-secondary)" };
    }
}

export default function RecommendationsPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const [sortBy, setSortBy] = useState("match");

    const filtered = sampleRecommendations
        .filter((r) => activeFilter === "All" || r.type === activeFilter)
        .sort((a, b) => {
            if (sortBy === "match") return b.match - a.match;
            return 0;
        });

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div className="animate-fade-in" style={styles.header}>
                    <span style={styles.badge}>
                        🎯 Recommendations
                    </span>
                    <h1 style={styles.title}>
                        Your personalized <span className="gradient-text">matches</span>
                    </h1>
                    <p style={styles.subtitle}>
                        Based on your resume analysis, here are the internships that best
                        match your skills and experience.
                    </p>
                </div>

                {/* Filters & Sort */}
                <div className="animate-fade-in delay-100" style={styles.toolbar}>
                    <div style={styles.filterGroup}>
                        {filterOptions.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    ...styles.filterBtn,
                                    background:
                                        activeFilter === filter
                                            ? "var(--primary)"
                                            : "var(--surface)",
                                    color:
                                        activeFilter === filter
                                            ? "#ffffff"
                                            : "var(--foreground-secondary)",
                                    borderColor:
                                        activeFilter === filter
                                            ? "var(--primary)"
                                            : "var(--surface-border)",
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={styles.sortSelect}
                    >
                        <option value="match">Sort by Match %</option>
                        <option value="recent">Sort by Recent</option>
                    </select>
                </div>

                {/* Results count */}
                <p className="animate-fade-in delay-200" style={styles.resultCount}>
                    Showing <strong>{filtered.length}</strong> internship
                    {filtered.length !== 1 ? "s" : ""}
                </p>

                {/* Cards */}
                <div style={styles.cardList}>
                    {filtered.map((rec, i) => {
                        const typeBadge = getTypeBadgeColor(rec.type);
                        return (
                            <div
                                key={rec.id}
                                className="card animate-fade-in-up"
                                style={{
                                    ...styles.recCard,
                                    animationDelay: `${(i + 2) * 100}ms`,
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

                                <div style={styles.skillsRow}>
                                    {rec.skills.map((skill) => (
                                        <span key={skill} style={styles.skillChip}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div style={styles.cardActions}>
                                    <button className="btn btn-primary" style={styles.applyBtn}>
                                        Apply Now
                                    </button>
                                    <button className="btn btn-ghost" style={styles.saveBtn}>
                                        ♡ Save
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={styles.emptyState}>
                        <span style={{ fontSize: "3rem" }}>🔍</span>
                        <h3 style={styles.emptyTitle}>No matches found</h3>
                        <p style={styles.emptyDesc}>
                            Try changing your filters or{" "}
                            <Link
                                href="/upload"
                                style={{ color: "var(--primary)", textDecoration: "none" }}
                            >
                                upload a different resume
                            </Link>
                            .
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        paddingTop: "72px",
    },
    container: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "48px 24px 100px",
    },
    header: {
        textAlign: "center",
        marginBottom: "40px",
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
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px",
    },
    filterGroup: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },
    filterBtn: {
        padding: "8px 18px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        fontSize: "0.85rem",
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
        fontSize: "0.85rem",
        cursor: "pointer",
    },
    resultCount: {
        fontSize: "0.9rem",
        color: "var(--foreground-muted)",
        marginBottom: "24px",
    },
    cardList: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    recCard: {
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
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
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    companyName: {
        fontSize: "0.9rem",
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
        fontSize: "0.92rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
    },
    metaItem: {
        fontSize: "0.82rem",
        color: "var(--foreground-muted)",
    },
    typeBadge: {
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.78rem",
        fontWeight: 600,
    },
    skillsRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    skillChip: {
        padding: "5px 12px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.78rem",
        fontWeight: 600,
    },
    cardActions: {
        display: "flex",
        gap: "12px",
        marginTop: "4px",
    },
    applyBtn: {
        padding: "10px 24px",
        fontSize: "0.88rem",
    },
    saveBtn: {
        padding: "10px 16px",
        fontSize: "0.88rem",
    },
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
