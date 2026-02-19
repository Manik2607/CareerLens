"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "../../lib/api";

const defaultStats = [
    { value: 1240, suffix: "+", label: "Internships Indexed", icon: "🏢", key: "active_internships" },
    { value: 95, suffix: "%", label: "Match Accuracy", icon: "🎯", key: "accuracy" },
    { value: 850, suffix: "+", label: "Resumes Analyzed", icon: "📄", key: "resumes_analyzed" },
    { value: 50, suffix: "+", label: "Companies Hiring", icon: "⚡", key: "companies_hiring" },
];

export default function StatsSection() {
    const [statsData, setStatsData] = useState(defaultStats);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchAPI('/stats');
                const newStats = defaultStats.map(stat => {
                    if (data[stat.key] !== undefined) {
                        return { ...stat, value: data[stat.key] };
                    }
                    return stat;
                });
                setStatsData(newStats);
            } catch (err) {
                // console.error("Failed to load stats", err);
                // Keep defaults on error
            }
        }
        loadStats();
    }, []);

    return (
        <section style={counterStyles.section}>
            <div style={counterStyles.grid}>
                {statsData.map((stat) => (
                    <div key={stat.label} style={counterStyles.statCard}>
                        <span style={counterStyles.icon}>{stat.icon}</span>
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        <span style={counterStyles.label}>{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AnimatedCounter({ value, suffix }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        // Reset if value changes considerably or just animate from 0
        // Ideally we animate from previous value but for now from 0 is fine
        started.current = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const duration = 2000;
                    const startTime = performance.now();

                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.round(eased * value));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(value); // Ensure exact final value
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <span ref={ref} className="gradient-text" style={counterStyles.value}>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

const counterStyles = {
    section: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 24px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "32px",
    },
    statCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "32px 16px",
        textAlign: "center",
    },
    icon: {
        fontSize: "2rem",
        marginBottom: "4px",
    },
    value: {
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
    },
    label: {
        fontSize: "0.9rem",
        color: "var(--foreground-secondary)",
        fontWeight: 500,
    },
};
