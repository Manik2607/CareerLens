"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check initial user
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user ?? null);
        };
        checkUser();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <nav style={{
            backgroundColor: '#1f2937', // Dark gray
            color: '#fff',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            height: '70px',
            borderBottom: '1px solid #374151',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔍</span> CareerLens
                </Link>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/upload">Upload Resume</NavLink>
                    <NavLink href="/recommendations">Recommendations</NavLink>
                    <NavLink href="/about">About</NavLink>
                </div>
            </div>

            {/* Auth Section */}
            <div>
                {user ? (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#3b82f6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {user.email?.[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: '#e5e7eb', fontWeight: '500' }}>
                                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                            </span>
                        </div>

                        {/* Separator */}
                        <div style={{ width: '1px', height: '20px', background: '#4b5563' }}></div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                background: 'transparent',
                                color: '#9ca3af',
                                border: '1px solid #4b5563',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'white'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#4b5563'; }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Link
                            href="/login"
                            style={{
                                color: '#e5e7eb',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                transition: 'color 0.2s',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#e5e7eb'}
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '600',
                                backgroundColor: '#2563eb', // Blue-600
                                padding: '8px 20px',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} // Blue-700
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

// Helper component for Nav Links
function NavLink({ href, children }) {
    return (
        <Link
            href={href}
            style={{
                color: '#d1d5db',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'white'}
            onMouseOut={(e) => e.currentTarget.style.color = '#d1d5db'}
        >
            {children}
        </Link>
    );
}
