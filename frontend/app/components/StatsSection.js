"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "../../lib/api";

const defaultStats = [
    { value: 1240, suffix: "+", label: "Internships Indexed", key: "active_internships" },
    { value: 95, suffix: "%", label: "Match Accuracy", key: "accuracy" },
    { value: 850, suffix: "+", label: "Resumes Analyzed", key: "resumes_analyzed" },
    { value: 50, suffix: "+", label: "Companies Hiring", key: "companies_hiring" },
];

export default function StatsSection() {
    const [statsData, setStatsData] = useState(defaultStats);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchAPI("/stats");
                const newStats = defaultStats.map(stat => {
                    if (data[stat.key] !== undefined) return { ...stat, value: data[stat.key] };
                    return stat;
                });
                setStatsData(newStats);
            } catch { /* keep defaults */ }
        };
        loadStats();
    }, []);

    return (
        <section style={s.section}>
            <div style={s.grid}>
                {statsData.map(stat => (
                    <div key={stat.label} style={s.statCard}>
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        <span style={s.label}>{stat.label}</span>
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
        started.current = false;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const duration = 2000;
                const startTime = performance.now();
                const animate = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * value));
                    if (progress < 1) requestAnimationFrame(animate);
                    else setCount(value);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <span ref={ref} style={s.value}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}

const s = {
    section: {
        maxWidth: "1200px", margin: "0 auto", padding: "80px 24px",
        borderBottom: "1px solid var(--surface-border)",
    },
    grid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px",
    },
    statCard: {
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "4px", padding: "24px 16px", textAlign: "center",
    },
    value: {
        fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800,
        letterSpacing: "-0.03em", color: "var(--primary)",
    },
    label: {
        fontSize: "0.88rem", color: "var(--foreground-secondary)", fontWeight: 500,
    },
};
