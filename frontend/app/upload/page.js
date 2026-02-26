"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile, fetchAPI } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [atsScore, setAtsScore] = useState(null);
    const [preferences, setPreferences] = useState({ internship_type: "", work_mode: "Remote", preferred_location: "" });
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

    const validateFile = (f) => {
        if (!f) return false;
        const ext = "." + f.name.split(".").pop().toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext)) { setError(`Unsupported file type. Upload ${ACCEPTED_EXTENSIONS.join(", ")} files.`); return false; }
        if (f.size > 10 * 1024 * 1024) { setError("File too large. Max 10MB."); return false; }
        setError("");
        return true;
    };

    const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (validateFile(f)) setFile(f); };
    const handleFileSelect = (e) => { const f = e.target.files[0]; if (validateFile(f)) setFile(f); };

    const handleUpload = async () => {
        if (!file) return;
        if (!user) { router.push("/login?message=Please log in to upload"); return; }
        setUploading(true); setError("");
        try {
            const data = await uploadFile(file, user.id);
            if (data.ats_score) setAtsScore(data.ats_score);
            setUploadComplete(true);
        } catch (err) {
            setError(err.message || "Upload failed.");
        } finally { setUploading(false); }
    };

    const handleSavePreferences = async () => {
        if (!user) return;
        setSavingPrefs(true);
        try {
            await fetchAPI(`/preferences/${user.id}`, { method: 'POST', body: preferences });
            router.push("/recommendations");
        } catch { setError("Failed to save preferences"); }
        finally { setSavingPrefs(false); }
    };

    const formatSize = (b) => { if (b < 1024) return b + " B"; if (b < 1048576) return (b/1024).toFixed(1) + " KB"; return (b/1048576).toFixed(1) + " MB"; };
    const resetUpload = () => { setFile(null); setUploadComplete(false); setAtsScore(null); setError(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

    return (
        <div style={s.page}>
            <div style={s.container}>
                {/* Header */}
                <div className="animate-fade-in" style={s.header}>
                    <span className="section-label">Upload Resume</span>
                    <h1 style={s.title}>Let&apos;s analyze your <span className="gradient-text">resume</span></h1>
                    <p style={s.subtitle}>Upload your resume and our AI will extract skills, generate an ATS score, and match you with the best opportunities.</p>
                </div>

                {!uploadComplete ? (
                    <div className="animate-fade-in-up delay-200">
                        <div
                            className={`upload-zone ${dragging ? "dragging" : ""}`}
                            style={s.uploadZone}
                            onDragOver={e => e.preventDefault()}
                            onDragEnter={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={e => { e.preventDefault(); setDragging(false); }}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} onChange={handleFileSelect} style={{ display: "none" }} />

                            {!file ? (
                                <div style={s.uploadContent}>
                                    <div style={s.uploadIconWrap}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                    </div>
                                    <p style={s.uploadTitle}><strong>Click to upload</strong> or drag and drop</p>
                                    <p style={s.uploadFormats}>PDF, DOCX, DOC, or TXT — Max 10MB</p>
                                </div>
                            ) : (
                                <div style={s.filePreview} onClick={e => e.stopPropagation()}>
                                    <div style={s.fileIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                    </div>
                                    <div style={s.fileDetails}>
                                        <p style={s.fileName}>{file.name}</p>
                                        <p style={s.fileSize}>{formatSize(file.size)}</p>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); resetUpload(); }} style={s.removeBtn} aria-label="Remove">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && <div style={s.errorMsg}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

                        {file && (
                            <div style={s.actionRow}>
                                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ ...s.uploadBtn, opacity: uploading ? 0.7 : 1 }}>
                                    {uploading ? (<><span style={s.spinner}/>Analyzing...</>) : (<>Analyze Resume</>)}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in-up" style={s.successCard}>
                        <div className="card" style={s.successInner}>
                            <div style={s.successIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </div>
                            <h2 style={s.successTitle}>Analysis Complete!</h2>
                            {atsScore !== null && (
                                <div style={{ ...s.atsBadge, background: atsScore > 70 ? 'var(--success-light)' : 'var(--warning-light)', color: atsScore > 70 ? 'var(--success)' : 'var(--warning)' }}>
                                    ATS Score: {atsScore}/100
                                </div>
                            )}
                            <p style={s.successDesc}>Your resume has been analyzed. Tell us what you&apos;re looking for to get better recommendations.</p>

                            <div style={s.prefsForm}>
                                <div style={s.prefField}>
                                    <label style={s.prefLabel}>Interested Role</label>
                                    <input type="text" style={s.prefInput} placeholder="e.g. Software Engineer, ML, Frontend" value={preferences.internship_type} onChange={e => setPreferences({...preferences, internship_type: e.target.value})} className="auth-input" />
                                </div>
                                <div style={s.prefField}>
                                    <label style={s.prefLabel}>Work Mode</label>
                                    <select style={s.prefInput} value={preferences.work_mode} onChange={e => setPreferences({...preferences, work_mode: e.target.value})}>
                                        <option value="Remote">Remote</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={s.uploadBtn} onClick={handleSavePreferences} disabled={savingPrefs}>
                                {savingPrefs ? 'Saving...' : 'View Recommendations'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tips */}
                {!uploadComplete && (
                    <div className="animate-fade-in-up delay-400" style={s.tipsSection}>
                        <h3 style={s.tipsTitle}>Tips for best results</h3>
                        <div style={s.tipsGrid}>
                            {[
                                { title: "Clear formatting", desc: "Structured resumes with clear headings are analyzed more accurately." },
                                { title: "Include tech skills", desc: "List your languages, tools, and frameworks explicitly." },
                                { title: "Add projects", desc: "Personal projects and experience improve match quality." },
                            ].map(tip => (
                                <div key={tip.title} className="card" style={s.tipCard}>
                                    <h4 style={s.tipTitle}>{tip.title}</h4>
                                    <p style={s.tipDesc}>{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const s = {
    page: { minHeight: "100vh" },
    container: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px 100px" },
    header: { textAlign: "center", marginBottom: "36px" },
    title: { fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--foreground)", marginTop: "16px", marginBottom: "12px" },
    subtitle: { fontSize: "1rem", color: "var(--foreground-secondary)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 },
    uploadZone: { maxWidth: "600px", margin: "0 auto" },
    uploadContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    uploadIconWrap: {
        width: "64px", height: "64px", borderRadius: "var(--radius-lg)",
        background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center",
    },
    uploadTitle: { fontSize: "0.95rem", color: "var(--foreground)" },
    uploadFormats: { fontSize: "0.82rem", color: "var(--foreground-muted)" },
    filePreview: { display: "flex", alignItems: "center", gap: "14px" },
    fileIcon: {
        width: "44px", height: "44px", borderRadius: "var(--radius-md)",
        background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center",
    },
    fileDetails: { flex: 1 },
    fileName: { fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" },
    fileSize: { fontSize: "0.78rem", color: "var(--foreground-muted)" },
    removeBtn: { background: "transparent", border: "none", color: "var(--foreground-muted)", cursor: "pointer", padding: "4px" },
    errorMsg: {
        display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px",
        borderRadius: "var(--radius-md)", background: "var(--error-light)", color: "var(--error)",
        fontSize: "0.85rem", fontWeight: 500, marginTop: "16px", maxWidth: "600px", margin: "16px auto 0",
    },
    actionRow: { display: "flex", justifyContent: "center", marginTop: "24px" },
    uploadBtn: { padding: "13px 32px", fontSize: "0.95rem" },
    spinner: {
        width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff", borderRadius: "50%", animation: "spin-slow 0.6s linear infinite",
        display: "inline-block", marginRight: "6px",
    },
    successCard: { display: "flex", justifyContent: "center" },
    successInner: { maxWidth: "520px", width: "100%", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
    successIcon: { width: "56px", height: "56px", borderRadius: "50%", background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center" },
    successTitle: { fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)" },
    atsBadge: { padding: "8px 20px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.9rem" },
    successDesc: { fontSize: "0.9rem", color: "var(--foreground-secondary)", lineHeight: 1.7, maxWidth: "400px" },
    prefsForm: { width: "100%", textAlign: "left", marginTop: "8px", display: "flex", flexDirection: "column", gap: "14px" },
    prefField: { display: "flex", flexDirection: "column", gap: "5px" },
    prefLabel: { fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" },
    prefInput: {
        width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
        border: "1px solid var(--surface-border)", background: "var(--surface)",
        color: "var(--foreground)", fontSize: "0.9rem", outline: "none",
    },
    tipsSection: { marginTop: "56px" },
    tipsTitle: { fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px", textAlign: "center" },
    tipsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
    tipCard: { padding: "20px" },
    tipTitle: { fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "6px" },
    tipDesc: { fontSize: "0.82rem", color: "var(--foreground-secondary)", lineHeight: 1.6 },
};
