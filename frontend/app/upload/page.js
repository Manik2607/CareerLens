"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { uploadFile, fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [atsScore, setAtsScore] = useState(null);

    // Preferences functionality
    const [preferences, setPreferences] = useState({
        internship_type: "",
        work_mode: "Remote",
        preferred_location: ""
    });
    const [savingPrefs, setSavingPrefs] = useState(false);

    const fileInputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const validateFile = (f) => {
        if (!f) return false;
        const ext = "." + f.name.split(".").pop().toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
            setError(`Unsupported file type. Please upload ${ACCEPTED_EXTENSIONS.join(", ")} files.`);
            return false;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError("File too large. Maximum size is 10MB.");
            return false;
        }
        setError("");
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (validateFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        if (!user) {
            router.push("/login?message=Please log in to upload your resume");
            return;
        }

        setUploading(true);
        setError("");
        console.log('[UploadPage] Starting upload for user:', user.id);

        try {
            const data = await uploadFile(file, user.id);
            console.log('[UploadPage] Upload response data:', data);
            if (data.ats_score) setAtsScore(data.ats_score);
            setUploadComplete(true);
        } catch (err) {
            console.error('[UploadPage] Upload error:', err);
            const errMsg = err.message || "Upload failed. Please try again.";
            setError(errMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!user) return;
        setSavingPrefs(true);
        try {
            await fetchAPI(`/preferences/${user.id}`, {
                method: 'POST',
                body: preferences
            });
            router.push("/recommendations");
        } catch (err) {
            console.error(err);
            setError("Failed to save preferences");
        } finally {
            setSavingPrefs(false);
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const resetUpload = () => {
        setFile(null);
        setUploadComplete(false);
        setAtsScore(null);
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div className="animate-fade-in" style={styles.header}>
                    <span style={styles.badge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Resume
                    </span>
                    <h1 style={styles.title}>
                        Let&apos;s analyze your <span className="gradient-text">resume</span>
                    </h1>
                    <p style={styles.subtitle}>
                        Upload your resume and our AI will extract your skills, match you with
                        opportunities, and provide personalized recommendations.
                    </p>
                </div>

                {/* Upload zone */}
                {!uploadComplete ? (
                    <div className="animate-fade-in-up delay-200">
                        <div
                            className={`upload-zone ${dragging ? "dragging" : ""}`}
                            style={styles.uploadZone}
                            onDragOver={handleDrag}
                            onDragEnter={handleDragIn}
                            onDragLeave={handleDragOut}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_EXTENSIONS.join(",")}
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                                id="resume-upload"
                            />

                            {!file ? (
                                <div style={styles.uploadContent}>
                                    <div style={styles.uploadIconWrap}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <p style={styles.uploadTitle}>
                                        <strong>Click to upload</strong> or drag and drop
                                    </p>
                                    <p style={styles.uploadFormats}>
                                        PDF, DOCX, DOC, or TXT — Max 10MB
                                    </p>
                                </div>
                            ) : (
                                <div
                                    style={styles.filePreview}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div style={styles.fileIcon}>📄</div>
                                    <div style={styles.fileDetails}>
                                        <p style={styles.fileName}>{file.name}</p>
                                        <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetUpload();
                                        }}
                                        style={styles.removeBtn}
                                        aria-label="Remove file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div style={styles.errorMsg}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {file && (
                            <div style={styles.actionRow}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    style={{
                                        ...styles.uploadBtn,
                                        opacity: uploading ? 0.7 : 1,
                                        cursor: uploading ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <span style={styles.spinner} />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8" />
                                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                            </svg>
                                            Analyze Resume
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Success state with Preferences Form */
                    <div className="animate-fade-in-up" style={styles.successCard}>
                        <div className="card" style={{ ...styles.successInner, maxWidth: '600px' }}>
                            <div style={styles.successIcon}>🎉</div>
                            <h2 style={styles.successTitle}>Analysis Complete!</h2>
                            {atsScore !== null && (
                                <div style={{
                                    margin: '10px 0',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    background: atsScore > 70 ? 'var(--success-light)' : 'var(--warning-light)',
                                    color: atsScore > 70 ? 'var(--success)' : 'var(--warning)',
                                    fontWeight: 'bold'
                                }}>
                                    ATS Score: {atsScore}/100
                                </div>
                            )}
                            <p style={styles.successDesc}>
                                Your resume has been analyzed. To get better recommendations, tell us what you are looking for.
                            </p>

                            <div style={{ width: '100%', textAlign: 'left', marginTop: '20px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Interested Role (e.g. Frontend, ML)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface)' }}
                                        placeholder="Software Engineer"
                                        value={preferences.internship_type}
                                        onChange={(e) => setPreferences({ ...preferences, internship_type: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Preferred Work Mode</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface)' }}
                                        value={preferences.work_mode}
                                        onChange={(e) => setPreferences({ ...preferences, work_mode: e.target.value })}
                                    >
                                        <option value="Remote">Remote</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.successActions}>
                                <button
                                    className="btn btn-primary"
                                    style={styles.uploadBtn}
                                    onClick={handleSavePreferences}
                                    disabled={savingPrefs}
                                >
                                    {savingPrefs ? 'Saving...' : 'View Recommendations'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips */}
                {!uploadComplete && (
                    <div className="animate-fade-in-up delay-400" style={styles.tipsSection}>
                        <h3 style={styles.tipsTitle}>💡 Tips for best results</h3>
                        <div style={styles.tipsGrid}>
                            {[
                                {
                                    title: "Use clear formatting",
                                    desc: "Structured resumes with clear headings are analyzed more accurately.",
                                },
                                {
                                    title: "Include technical skills",
                                    desc: "List your programming languages, tools, and frameworks explicitly.",
                                },
                                {
                                    title: "Mention projects & experience",
                                    desc: "Personal projects and internship experience improve your match quality.",
                                },
                            ].map((tip) => (
                                <div key={tip.title} className="card" style={styles.tipCard}>
                                    <h4 style={styles.tipTitle}>{tip.title}</h4>
                                    <p style={styles.tipDesc}>{tip.desc}</p>
                                </div>
                            ))}
                        </div>
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
        maxWidth: "720px",
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
    uploadZone: {
        minHeight: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    uploadContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    uploadIconWrap: {
        width: "80px",
        height: "80px",
        borderRadius: "var(--radius-lg)",
        background: "var(--primary-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px",
    },
    uploadTitle: {
        fontSize: "1rem",
        color: "var(--foreground)",
    },
    uploadFormats: {
        fontSize: "0.85rem",
        color: "var(--foreground-muted)",
    },
    filePreview: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        padding: "12px 16px",
    },
    fileIcon: {
        fontSize: "2rem",
    },
    fileDetails: {
        flex: 1,
        textAlign: "left",
    },
    fileName: {
        fontWeight: 600,
        color: "var(--foreground)",
        fontSize: "0.95rem",
        wordBreak: "break-all",
    },
    fileSize: {
        fontSize: "0.8rem",
        color: "var(--foreground-muted)",
        marginTop: "4px",
    },
    removeBtn: {
        width: "36px",
        height: "36px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--surface-border)",
        background: "var(--surface)",
        color: "var(--foreground-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.85rem",
        transition: "all var(--transition-fast)",
    },
    errorMsg: {
        marginTop: "12px",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--error-light)",
        color: "var(--error)",
        fontSize: "0.85rem",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    actionRow: {
        display: "flex",
        justifyContent: "center",
        marginTop: "24px",
    },
    uploadBtn: {
        padding: "14px 32px",
        fontSize: "1rem",
    },
    spinner: {
        width: "18px",
        height: "18px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#ffffff",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
    },
    successCard: {
        display: "flex",
        justifyContent: "center",
    },
    successInner: {
        padding: "48px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        maxWidth: "480px",
        width: "100%",
    },
    successIcon: {
        fontSize: "3rem",
    },
    successTitle: {
        fontSize: "1.6rem",
        fontWeight: 700,
        color: "var(--foreground)",
    },
    successDesc: {
        fontSize: "0.95rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.7,
    },
    successActions: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "8px",
    },
    tipsSection: {
        marginTop: "64px",
    },
    tipsTitle: {
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "20px",
    },
    tipsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
    },
    tipCard: {
        padding: "24px",
    },
    tipTitle: {
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginBottom: "8px",
    },
    tipDesc: {
        fontSize: "0.85rem",
        color: "var(--foreground-secondary)",
        lineHeight: 1.6,
    },
};



