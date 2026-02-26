"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SkillGapPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [inputMode, setInputMode] = useState("text"); // "text" or "file"
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            const valid = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
            if (valid.includes(file.type) || file.name.match(/\.(pdf|docx|txt)$/i)) {
                setResumeFile(file);
                setError(null);
            } else {
                setError("Please upload a PDF, DOCX, or TXT file.");
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        setError(null);

        if (!jobDescription.trim()) {
            setError("Please enter a job description.");
            return;
        }
        if (inputMode === "text" && !resumeText.trim()) {
            setError("Please paste your resume text.");
            return;
        }
        if (inputMode === "file" && !resumeFile) {
            setError("Please upload a resume file.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("job_description", jobDescription);

            if (inputMode === "file" && resumeFile) {
                formData.append("resume_file", resumeFile);
            } else {
                formData.append("resume_text", resumeText);
            }

            const res = await fetch(`${API_BASE_URL}/skill-gap/analyze`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || `Analysis failed (${res.status})`);
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "var(--success)";
        if (score >= 50) return "var(--primary)";
        if (score >= 30) return "var(--warning)";
        return "var(--error)";
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return "Excellent Match";
        if (score >= 50) return "Good Match";
        if (score >= 30) return "Partial Match";
        return "Low Match";
    };

    return (
        <section style={s.page}>
            <div style={s.container}>
                {/* Page Header */}
                <div className="animate-fade-in" style={s.pageHeader}>
                    <div style={s.badgeRow}>
                        <span className="section-label">
                            AI-Powered Analysis
                        </span>
                    </div>
                    <h1 style={s.pageTitle}>
                        Skill <span className="gradient-text">Gap</span> Detection
                    </h1>
                    <p style={s.pageSubtitle}>
                        Compare your resume against any job description to find missing skills,
                        match percentage, and get actionable recommendations.
                    </p>
                </div>

                {/* Error Box */}
                {error && (
                    <div className="animate-fade-in" style={s.errorBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Input Section — Two Columns */}
                <div className="animate-fade-in-up delay-100" style={s.inputGrid}>
                    {/* LEFT — Job Description */}
                    <div className="card" style={s.inputCard}>
                        <div style={s.cardHeader}>
                            <div style={s.cardIconWrap}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                    <path d="M7 7h10" />
                                    <path d="M7 12h10" />
                                    <path d="M7 17h4" />
                                </svg>
                            </div>
                            <div>
                                <h2 style={s.cardTitle}>Job Description</h2>
                                <p style={s.cardDesc}>Paste the full job posting here</p>
                            </div>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder={"Paste the job description here...\n\nExample:\nWe are looking for a Full Stack Developer proficient in React, Node.js, Python, and AWS. Experience with Docker, CI/CD, and Agile methodologies is preferred..."}
                            style={s.textarea}
                            className="auth-input"
                            rows={14}
                        />
                        <div style={s.charCount}>
                            {jobDescription.length} characters
                        </div>
                    </div>

                    {/* RIGHT — Resume */}
                    <div className="card" style={s.inputCard}>
                        <div style={s.cardHeader}>
                            <div style={{ ...s.cardIconWrap, background: "var(--accent-light)", color: "var(--accent)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <h2 style={s.cardTitle}>Your Resume</h2>
                                <p style={s.cardDesc}>Paste text or upload a file</p>
                            </div>
                        </div>

                        {/* Toggle between text and file */}
                        <div style={s.toggleRow}>
                            <button
                                onClick={() => setInputMode("text")}
                                style={{
                                    ...s.toggleBtn,
                                    background: inputMode === "text" ? "var(--primary-light)" : "transparent",
                                    color: inputMode === "text" ? "var(--primary)" : "var(--foreground-secondary)",
                                    borderColor: inputMode === "text" ? "var(--primary)" : "var(--surface-border)",
                                    fontWeight: inputMode === "text" ? 600 : 500,
                                }}
                                className="profile-radio-btn"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Paste Text
                            </button>
                            <button
                                onClick={() => setInputMode("file")}
                                style={{
                                    ...s.toggleBtn,
                                    background: inputMode === "file" ? "var(--primary-light)" : "transparent",
                                    color: inputMode === "file" ? "var(--primary)" : "var(--foreground-secondary)",
                                    borderColor: inputMode === "file" ? "var(--primary)" : "var(--surface-border)",
                                    fontWeight: inputMode === "file" ? 600 : 500,
                                }}
                                className="profile-radio-btn"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Upload File
                            </button>
                        </div>

                        {inputMode === "text" ? (
                            <>
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder={"Paste your resume content here...\n\nInclude your skills, experience, education, and projects."}
                                    style={s.textarea}
                                    className="auth-input"
                                    rows={11}
                                />
                                <div style={s.charCount}>
                                    {resumeText.length} characters
                                </div>
                            </>
                        ) : (
                            <div
                                onDrop={handleFileDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileRef.current?.click()}
                                style={s.dropZone}
                                className="upload-zone"
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileSelect}
                                    style={{ display: "none" }}
                                />
                                {resumeFile ? (
                                    <div style={s.fileSelected}>
                                        <div style={s.fileIconWrap}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <p style={s.fileName}>{resumeFile.name}</p>
                                        <p style={s.fileSize}>{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                                            style={s.removeFileBtn}
                                        >
                                            Change File
                                        </button>
                                    </div>
                                ) : (
                                    <div style={s.dropContent}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--foreground-muted)" }}>
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <p style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.95rem" }}>
                                            Drop your resume here
                                        </p>
                                        <p style={{ color: "var(--foreground-muted)", fontSize: "0.82rem" }}>
                                            or click to browse — PDF, DOCX, TXT
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Analyze Button */}
                <div className="animate-fade-in-up delay-200" style={s.analyzeRow}>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="btn btn-primary"
                        style={s.analyzeBtn}
                    >
                        {loading ? (
                            <>
                                <span style={s.spinner} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                Analyze Skill Gap
                            </>
                        )}
                    </button>
                </div>

                {/* ═══ Results Section ═══ */}
                {result && (
                    <div className="animate-fade-in-up" style={s.resultsWrap}>
                        {/* Score Header */}
                        <div className="card" style={s.scoreCard}>
                            <div style={s.scoreVisual}>
                                <div style={{
                                    ...s.scoreRing,
                                    borderColor: getScoreColor(result.match_score),
                                }}>
                                    <span style={{
                                        fontSize: "2.2rem",
                                        fontWeight: 800,
                                        color: getScoreColor(result.match_score),
                                        lineHeight: 1,
                                    }}>
                                        {result.match_score}%
                                    </span>
                                </div>
                                <div style={s.scoreInfo}>
                                    <span style={{
                                        ...s.scoreBadge,
                                        background: getScoreColor(result.match_score),
                                    }}>
                                        {getScoreLabel(result.match_score)}
                                    </span>
                                    <p style={s.scoreDesc}>
                                        {result.total_matched} of {result.total_jd_skills} required skills found in your resume
                                    </p>
                                </div>
                            </div>

                            {/* Mini Stats */}
                            <div style={s.miniStats}>
                                <div style={s.miniStat}>
                                    <span style={{ ...s.miniStatNum, color: "var(--primary)" }}>{result.total_jd_skills}</span>
                                    <span style={s.miniStatLabel}>Required</span>
                                </div>
                                <div style={s.miniStatDivider} />
                                <div style={s.miniStat}>
                                    <span style={{ ...s.miniStatNum, color: "var(--success)" }}>{result.total_matched}</span>
                                    <span style={s.miniStatLabel}>Matched</span>
                                </div>
                                <div style={s.miniStatDivider} />
                                <div style={s.miniStat}>
                                    <span style={{ ...s.miniStatNum, color: "var(--error)" }}>{result.total_missing}</span>
                                    <span style={s.miniStatLabel}>Missing</span>
                                </div>
                                <div style={s.miniStatDivider} />
                                <div style={s.miniStat}>
                                    <span style={{ ...s.miniStatNum, color: "var(--accent)" }}>{result.total_resume_skills}</span>
                                    <span style={s.miniStatLabel}>Your Skills</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills Detail Grid */}
                        <div style={s.detailGrid}>
                            {/* Matched Skills */}
                            <div className="card" style={s.detailCard}>
                                <div style={s.detailHeader}>
                                    <div style={{ ...s.detailIcon, background: "var(--success-light)", color: "var(--success)" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={s.detailTitle}>Matched Skills</h3>
                                        <p style={s.detailDesc}>Skills found in both JD and your resume</p>
                                    </div>
                                </div>
                                <div style={s.chipGrid}>
                                    {result.matched_skills.length > 0 ? (
                                        result.matched_skills.map((skill) => (
                                            <span key={skill} style={s.matchedChip}>{skill}</span>
                                        ))
                                    ) : (
                                        <p style={s.emptyText}>No matching skills found</p>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="card" style={s.detailCard}>
                                <div style={s.detailHeader}>
                                    <div style={{ ...s.detailIcon, background: "var(--error-light)", color: "var(--error)" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={s.detailTitle}>Missing Skills (Gap)</h3>
                                        <p style={s.detailDesc}>Add these to strengthen your resume</p>
                                    </div>
                                </div>
                                <div style={s.chipGrid}>
                                    {result.missing_skills.length > 0 ? (
                                        result.missing_skills.map((skill) => (
                                            <span key={skill} style={s.missingChip}>{skill}</span>
                                        ))
                                    ) : (
                                        <p style={s.emptyText}>No gaps — great match! 🎉</p>
                                    )}
                                </div>
                            </div>

                            {/* Extra Skills */}
                            <div className="card" style={s.detailCard}>
                                <div style={s.detailHeader}>
                                    <div style={{ ...s.detailIcon, background: "var(--accent-light)", color: "var(--accent)" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={s.detailTitle}>Extra Skills</h3>
                                        <p style={s.detailDesc}>Your skills not in the JD — still valuable</p>
                                    </div>
                                </div>
                                <div style={s.chipGrid}>
                                    {result.extra_skills.length > 0 ? (
                                        result.extra_skills.map((skill) => (
                                            <span key={skill} style={s.extraChip}>{skill}</span>
                                        ))
                                    ) : (
                                        <p style={s.emptyText}>All your skills are in the JD</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="card" style={s.recsCard}>
                            <div style={s.detailHeader}>
                                <div style={{ ...s.detailIcon, background: "var(--warning-light)", color: "var(--warning)" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 12 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={s.detailTitle}>Recommendations</h3>
                                    <p style={s.detailDesc}>Actionable steps to improve your chances</p>
                                </div>
                            </div>
                            <div style={s.recsList}>
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} style={s.recItem}>
                                        <span style={s.recNumber}>{i + 1}</span>
                                        <p style={s.recText}>{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px 100px",
        position: "relative",
        zIndex: 1,
    },

    // Header
    pageHeader: {
        textAlign: "center",
        marginBottom: "40px",
    },
    badgeRow: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 18px",
        borderRadius: "var(--radius-full)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        fontSize: "0.82rem",
        fontWeight: 600,
    },
    badgeDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "var(--primary)",
        animation: "pulse-glow 2s infinite",
    },
    pageTitle: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 800,
        color: "var(--foreground)",
        letterSpacing: "-0.03em",
        marginBottom: "12px",
    },
    pageSubtitle: {
        fontSize: "1.05rem",
        color: "var(--foreground-secondary)",
        maxWidth: "600px",
        margin: "0 auto",
        lineHeight: 1.7,
    },

    // Error
    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 20px",
        borderRadius: "var(--radius-md)",
        background: "var(--error-light)",
        color: "var(--error)",
        fontSize: "0.88rem",
        fontWeight: 500,
        marginBottom: "20px",
        maxWidth: "700px",
        margin: "0 auto 20px",
    },

    // Input Grid
    inputGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "24px",
    },
    inputCard: {
        padding: "28px",
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        marginBottom: "20px",
    },
    cardIconWrap: {
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
    cardTitle: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "2px",
    },
    cardDesc: {
        fontSize: "0.82rem",
        color: "var(--foreground-muted)",
    },

    // Textarea
    textarea: {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        fontSize: "0.9rem",
        lineHeight: 1.6,
        resize: "vertical",
        outline: "none",
        fontFamily: "inherit",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
    charCount: {
        textAlign: "right",
        fontSize: "0.75rem",
        color: "var(--foreground-muted)",
        marginTop: "6px",
    },

    // Toggle
    toggleRow: {
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
    },
    toggleBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        borderRadius: "var(--radius-full)",
        border: "1.5px solid",
        cursor: "pointer",
        fontSize: "0.85rem",
        transition: "all 200ms ease",
        background: "none",
    },

    // Drop zone
    dropZone: {
        minHeight: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    dropContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    fileSelected: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
    },
    fileIconWrap: {
        width: "56px",
        height: "56px",
        borderRadius: "var(--radius-md)",
        background: "var(--success-light)",
        color: "var(--success)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    fileName: {
        fontSize: "0.92rem",
        fontWeight: 600,
        color: "var(--foreground)",
    },
    fileSize: {
        fontSize: "0.78rem",
        color: "var(--foreground-muted)",
    },
    removeFileBtn: {
        padding: "6px 16px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground-secondary)",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 200ms ease",
    },

    // Analyze button
    analyzeRow: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "48px",
    },
    analyzeBtn: {
        padding: "16px 48px",
        fontSize: "1.05rem",
        borderRadius: "var(--radius-full)",
    },
    spinner: {
        width: "20px",
        height: "20px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
    },

    // Results
    resultsWrap: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },

    // Score Card
    scoreCard: {
        padding: "36px 32px",
    },
    scoreVisual: {
        display: "flex",
        alignItems: "center",
        gap: "28px",
        marginBottom: "28px",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    scoreRing: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        border: "5px solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        flexShrink: 0,
    },
    scoreInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    scoreBadge: {
        display: "inline-flex",
        padding: "6px 18px",
        borderRadius: "var(--radius-full)",
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: 600,
        width: "fit-content",
    },
    scoreDesc: {
        fontSize: "0.95rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.6,
    },

    // Mini Stats
    miniStats: {
        display: "flex",
        justifyContent: "space-around",
        paddingTop: "24px",
        borderTop: "1px solid var(--surface-border)",
    },
    miniStat: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
    },
    miniStatNum: {
        fontSize: "1.4rem",
        fontWeight: 800,
    },
    miniStatLabel: {
        fontSize: "0.75rem",
        color: "var(--foreground-muted)",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    miniStatDivider: {
        width: "1px",
        background: "var(--surface-border)",
        alignSelf: "stretch",
    },

    // Detail Grid
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
    },
    detailCard: {
        padding: "24px",
    },
    detailHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
    },
    detailIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    detailTitle: {
        fontSize: "1rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "2px",
    },
    detailDesc: {
        fontSize: "0.78rem",
        color: "var(--foreground-muted)",
    },
    chipGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    matchedChip: {
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--success-light)",
        color: "var(--success)",
        fontSize: "0.82rem",
        fontWeight: 600,
    },
    missingChip: {
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--error-light)",
        color: "var(--error)",
        fontSize: "0.82rem",
        fontWeight: 600,
    },
    extraChip: {
        padding: "6px 14px",
        borderRadius: "var(--radius-full)",
        background: "var(--accent-light)",
        color: "var(--accent)",
        fontSize: "0.82rem",
        fontWeight: 600,
    },
    emptyText: {
        color: "var(--foreground-muted)",
        fontSize: "0.85rem",
        fontStyle: "italic",
    },

    // Recommendations
    recsCard: {
        padding: "28px",
    },
    recsList: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    recItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
    },
    recNumber: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: "var(--gradient-primary)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.78rem",
        fontWeight: 700,
        flexShrink: 0,
    },
    recText: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.6,
    },
};
