'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            router.push('/')
            router.refresh()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section style={s.page}>
            <div className="hero-blob" style={{ width: '500px', height: '500px', background: 'var(--primary)', top: '-150px', right: '-200px' }} />
            <div className="hero-blob" style={{ width: '400px', height: '400px', background: 'var(--accent)', bottom: '-100px', left: '-150px' }} />

            <div style={s.container}>
                {/* Left branding */}
                <div className="animate-fade-in" style={s.brandSide}>
                    <Link href="/" style={s.logoLink}>
                        <div style={s.logoMark}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <span style={s.logoText}>CareerLens</span>
                    </Link>
                    <h1 style={s.brandHeading}>
                        Welcome back to<br /><span className="gradient-text">CareerLens</span>
                    </h1>
                    <p style={s.brandDesc}>
                        Sign in to access your personalized internship recommendations,
                        resume analysis, and career insights.
                    </p>
                    <div style={s.trustRow}>
                        {["Secure Login", "Instant Access", "AI-Powered"].map(t => (
                            <span key={t} style={s.trustItem}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right form */}
                <div className="animate-fade-in-up delay-200" style={s.formWrap}>
                    <div style={s.formCard} className="card">
                        <div style={s.formHeader}>
                            <h2 style={s.formTitle}>Log In</h2>
                            <p style={s.formSubtitle}>Enter your credentials to continue</p>
                        </div>

                        {error && (
                            <div style={s.errorBox}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={s.form}>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Email Address</label>
                                <input type="email" required placeholder="you@example.com" style={s.input} value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
                            </div>

                            <div style={s.inputGroup}>
                                <label style={s.label}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} required placeholder="Enter your password" style={s.input} value={password} onChange={e => setPassword(e.target.value)} className="auth-input" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={s.submitBtn} className="btn btn-primary">
                                {loading ? (
                                    <><span style={s.spinner} />Logging in...</>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </form>

                        <div style={s.divider}><span style={s.dividerLine}/><span style={s.dividerText}>or</span><span style={s.dividerLine}/></div>

                        <p style={s.switchText}>
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" style={s.switchLink} className="auth-link">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

const s = {
    page: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' },
    container: {
        maxWidth: '1120px', margin: '0 auto', padding: '48px 24px',
        display: 'flex', alignItems: 'center', gap: '56px',
        position: 'relative', zIndex: 1, flexWrap: 'wrap', width: '100%',
    },
    brandSide: { flex: '1 1 380px', minWidth: '280px' },
    logoLink: { display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '28px' },
    logoMark: {
        width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    logoText: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' },
    brandHeading: {
        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800,
        lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--foreground)', marginBottom: '16px',
    },
    brandDesc: {
        fontSize: '1rem', lineHeight: 1.7, color: 'var(--foreground-secondary)',
        maxWidth: '400px', marginBottom: '28px',
    },
    trustRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
    trustItem: {
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '0.82rem', color: 'var(--foreground-muted)', fontWeight: 500,
    },
    formWrap: { flex: '1 1 400px', minWidth: '300px', display: 'flex', justifyContent: 'center' },
    formCard: { width: '100%', maxWidth: '420px', padding: '36px' },
    formHeader: { marginBottom: '24px' },
    formTitle: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '4px' },
    formSubtitle: { fontSize: '0.88rem', color: 'var(--foreground-muted)' },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: 'var(--error-light)', color: 'var(--error)',
        fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' },
    input: {
        width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--surface-border)', background: 'var(--surface)',
        color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none',
    },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', color: 'var(--foreground-muted)',
        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
    },
    submitBtn: { width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '4px' },
    spinner: {
        width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite',
        display: 'inline-block',
    },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
    dividerLine: { flex: 1, height: '1px', background: 'var(--surface-border)' },
    dividerText: { fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 500 },
    switchText: { textAlign: 'center', fontSize: '0.88rem', color: 'var(--foreground-secondary)' },
    switchLink: { color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' },
}
