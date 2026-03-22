import { useState, useEffect, useRef } from "react";

const features = [
    {
        icon: "◈",
        title: "One Class, Every Database",
        desc: "Define your model once. Classo works with SQLite, PostgreSQL, MySQL, and MongoDB without changing a line.",
    },
    {
        icon: "⬡",
        title: "Built-in Validation",
        desc: "Fields carry their own validators. Required, min length, unique checks — validation lives where your data is defined.",
    },
    {
        icon: "⟁",
        title: "Smart Migration",
        desc: "Add fields, drop columns, change constraints. Classo diffs your DataClass against the database and handles the rest.",
    },
    {
        icon: "⌖",
        title: "Relations Done Right",
        desc: "hasMany, hasOne, belongsTo, manyToMany. Define once, query with preload, and get nested data back automatically.",
    },
    {
        icon: "◎",
        title: "Query Builder",
        desc: "Chain filters, sorting, pagination, and preloads. No raw SQL needed for the common case — but it's there when you need it.",
    },
    {
        icon: "⬙",
        title: "Before & After Hooks",
        desc: "Transform data before saving. Hash passwords, normalize strings, run async operations — all baked into the field definition.",
    },
];

const databases = ["SQLite", "PostgreSQL", "MySQL", "MongoDB"];

const codeSnippet = `const { DataClass } = require("classo/dataclasses/base")
const { createField, types } = require("classo/databases/sqlite3")
const { hasMany, belongsTo, ON_DELETE } = require("classo/databases/relations")

class UserDataClass extends DataClass {
  username = createField(types.TEXT, false, false, [
    is_required("Username is required"),
    minLength(4, "At least 4 characters")
  ])

  password = createField(types.TEXT, false, false, [
    is_required("Password is required")
  ], null, hashPassword)

  posts = hasMany(PostDataClass)

  getName() { return "users" }
}

// create tables, validate, save, preload — all from one class
await db.createTables(UserDataClass, PostDataClass)
const results = await query.preload("posts").execute(db)`;

export default function ClassoHome() {
    const [activeDb, setActiveDb] = useState(0);
    const [typed, setTyped] = useState("");
    const [lineIndex, setLineIndex] = useState(0);
    const codeLines = codeSnippet.split("\n");
    const intervalRef = useRef(null);

    useEffect(() => {
        const dbInterval = setInterval(() => {
            setActiveDb((prev) => (prev + 1) % databases.length);
        }, 1800);
        return () => clearInterval(dbInterval);
    }, []);

    useEffect(() => {
        if (lineIndex >= codeLines.length) return;
        let charIndex = 0;
        const currentLine = codeLines[lineIndex];
        intervalRef.current = setInterval(() => {
            if (charIndex <= currentLine.length) {
                setTyped((prev) => {
                    const lines = prev.split("\n");
                    lines[lineIndex] = currentLine.slice(0, charIndex);
                    return lines.join("\n");
                });
                charIndex++;
            } else {
                clearInterval(intervalRef.current);
                setTimeout(() => {
                    setTyped((prev) => prev + "\n");
                    setLineIndex((prev) => prev + 1);
                }, 60);
            }
        }, 18);
        return () => clearInterval(intervalRef.current);
    }, [lineIndex]);

    return (
        <div style={styles.root}>
            {/* Grain overlay */}
            <div style={styles.grain} />

            {/* Nav */}
            <nav style={styles.nav}>
                <span style={styles.logo}>classo</span>
                <div style={styles.navLinks}>
                    <a href="/docs" style={styles.navLink}>Docs</a>
                    <a href="https://github.com" style={styles.navLink}>GitHub</a>
                    <a href="https://npmjs.com" style={styles.navLinkPrimary}>npm install classo</a>
                </div>
            </nav>

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.heroLeft}>
                    <div style={styles.badge}>
                        <span style={styles.badgeDot} />
                        Node.js ORM — v1.0
                    </div>

                    <h1 style={styles.heroTitle}>
                        One class.<br />
                        <span style={styles.heroAccent}>
              {databases[activeDb]}
            </span>
                        <span style={styles.heroTitleSub}> ready.</span>
                    </h1>

                    <p style={styles.heroDesc}>
                        Classo is a multi-database ORM that lets you define your data model,
                        validation, and relations in a single class — then use it across
                        SQLite, PostgreSQL, MySQL, and MongoDB without rewriting anything.
                    </p>

                    <div style={styles.heroCtas}>
                        <a href="/docs/intro" style={styles.ctaPrimary}>
                            Get Started →
                        </a>
                        <a href="/docs/dataclass/intro" style={styles.ctaSecondary}>
                            Read the docs
                        </a>
                    </div>

                    <div style={styles.installBox}>
                        <span style={styles.installPrompt}>$</span>
                        <span style={styles.installCmd}>npm install classo</span>
                    </div>
                </div>

                <div style={styles.heroRight}>
                    <div style={styles.codeWindow}>
                        <div style={styles.codeWindowBar}>
                            <span style={{ ...styles.dot, background: "#ff5f57" }} />
                            <span style={{ ...styles.dot, background: "#febc2e" }} />
                            <span style={{ ...styles.dot, background: "#28c840" }} />
                            <span style={styles.codeWindowTitle}>dataclass.js</span>
                        </div>
                        <pre style={styles.codeBody}>
              <code style={styles.codeText}>{typed}<span style={styles.cursor}>▌</span></code>
            </pre>
                    </div>
                </div>
            </section>

            {/* DB Pills */}
            <section style={styles.dbSection}>
                <p style={styles.dbLabel}>Works with</p>
                <div style={styles.dbPills}>
                    {databases.map((db, i) => (
                        <span
                            key={db}
                            style={{
                                ...styles.dbPill,
                                ...(activeDb === i ? styles.dbPillActive : {}),
                            }}
                        >
              {db}
            </span>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>Everything in one place</h2>
                <p style={styles.sectionSub}>
                    No more juggling validation libraries, ORM configs, and migration tools.
                </p>
                <div style={styles.featuresGrid}>
                    {features.map((f, i) => (
                        <div key={i} style={styles.featureCard}>
                            <span style={styles.featureIcon}>{f.icon}</span>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <span style={styles.footerLogo}>classo</span>
                <p style={styles.footerText}>
                    Built for Node.js developers who want less boilerplate and more control.
                </p>
                <div style={styles.footerLinks}>
                    <a href="/docs" style={styles.footerLink}>Docs</a>
                    <a href="https://github.com" style={styles.footerLink}>GitHub</a>
                    <a href="https://npmjs.com" style={styles.footerLink}>npm</a>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    root: {
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e8e0d4",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        overflowX: "hidden",
        position: "relative",
    },
    grain: {
        position: "fixed",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
        zIndex: 0,
    },
    nav: {
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 60px",
        borderBottom: "1px solid #1e1e1e",
    },
    logo: {
        fontSize: "22px",
        fontWeight: "700",
        letterSpacing: "0.15em",
        color: "#c8b89a",
    },
    navLinks: {
        display: "flex",
        gap: "32px",
        alignItems: "center",
    },
    navLink: {
        color: "#7a7268",
        textDecoration: "none",
        fontSize: "13px",
        letterSpacing: "0.08em",
    },
    navLinkPrimary: {
        color: "#0a0a0a",
        background: "#c8b89a",
        textDecoration: "none",
        fontSize: "12px",
        letterSpacing: "0.08em",
        padding: "8px 16px",
        fontWeight: "600",
    },
    hero: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        gap: "60px",
        padding: "80px 60px",
        alignItems: "flex-start",
        maxWidth: "1300px",
        margin: "0 auto",
    },
    heroLeft: {
        flex: "0 0 480px",
        paddingTop: "20px",
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "11px",
        letterSpacing: "0.12em",
        color: "#7a7268",
        border: "1px solid #2a2a2a",
        padding: "6px 14px",
        marginBottom: "32px",
        textTransform: "uppercase",
    },
    badgeDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#c8b89a",
        display: "inline-block",
    },
    heroTitle: {
        fontSize: "56px",
        fontWeight: "700",
        lineHeight: "1.1",
        margin: "0 0 24px",
        letterSpacing: "-0.02em",
        color: "#e8e0d4",
    },
    heroAccent: {
        color: "#c8b89a",
        borderBottom: "3px solid #c8b89a",
    },
    heroTitleSub: {
        color: "#e8e0d4",
    },
    heroDesc: {
        fontSize: "15px",
        lineHeight: "1.8",
        color: "#7a7268",
        margin: "0 0 36px",
        maxWidth: "420px",
    },
    heroCtas: {
        display: "flex",
        gap: "16px",
        marginBottom: "32px",
        alignItems: "center",
    },
    ctaPrimary: {
        background: "#c8b89a",
        color: "#0a0a0a",
        padding: "12px 28px",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "0.08em",
    },
    ctaSecondary: {
        color: "#7a7268",
        textDecoration: "none",
        fontSize: "13px",
        letterSpacing: "0.08em",
        borderBottom: "1px solid #2a2a2a",
        paddingBottom: "2px",
    },
    installBox: {
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        background: "#111",
        border: "1px solid #2a2a2a",
        padding: "10px 18px",
        fontSize: "13px",
    },
    installPrompt: {
        color: "#c8b89a",
        fontWeight: "700",
    },
    installCmd: {
        color: "#e8e0d4",
        letterSpacing: "0.05em",
    },
    heroRight: {
        flex: 1,
        position: "relative",
    },
    codeWindow: {
        background: "#0f0f0f",
        border: "1px solid #2a2a2a",
        overflow: "hidden",
    },
    codeWindowBar: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        borderBottom: "1px solid #1e1e1e",
        background: "#111",
    },
    dot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
    },
    codeWindowTitle: {
        fontSize: "11px",
        color: "#4a4a4a",
        letterSpacing: "0.08em",
        marginLeft: "8px",
    },
    codeBody: {
        padding: "24px",
        margin: 0,
        minHeight: "320px",
        overflowX: "auto",
    },
    codeText: {
        fontSize: "12px",
        lineHeight: "1.8",
        color: "#a89880",
        whiteSpace: "pre",
        fontFamily: "inherit",
    },
    cursor: {
        color: "#c8b89a",
        animation: "blink 1s step-end infinite",
    },
    dbSection: {
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        padding: "0 60px 60px",
    },
    dbLabel: {
        fontSize: "11px",
        letterSpacing: "0.15em",
        color: "#4a4a4a",
        textTransform: "uppercase",
        marginBottom: "16px",
    },
    dbPills: {
        display: "flex",
        gap: "12px",
        justifyContent: "center",
    },
    dbPill: {
        padding: "8px 24px",
        border: "1px solid #2a2a2a",
        fontSize: "12px",
        letterSpacing: "0.1em",
        color: "#4a4a4a",
        transition: "all 0.3s ease",
    },
    dbPillActive: {
        border: "1px solid #c8b89a",
        color: "#c8b89a",
        background: "#1a1712",
    },
    featuresSection: {
        position: "relative",
        zIndex: 1,
        padding: "80px 60px",
        maxWidth: "1300px",
        margin: "0 auto",
        borderTop: "1px solid #1e1e1e",
    },
    sectionTitle: {
        fontSize: "36px",
        fontWeight: "700",
        letterSpacing: "-0.02em",
        color: "#e8e0d4",
        margin: "0 0 12px",
    },
    sectionSub: {
        fontSize: "14px",
        color: "#7a7268",
        margin: "0 0 56px",
    },
    featuresGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "2px",
    },
    featureCard: {
        background: "#0f0f0f",
        border: "1px solid #1e1e1e",
        padding: "36px",
        transition: "border-color 0.2s",
    },
    featureIcon: {
        fontSize: "24px",
        color: "#c8b89a",
        display: "block",
        marginBottom: "20px",
    },
    featureTitle: {
        fontSize: "14px",
        fontWeight: "700",
        letterSpacing: "0.05em",
        color: "#e8e0d4",
        margin: "0 0 12px",
    },
    featureDesc: {
        fontSize: "13px",
        lineHeight: "1.7",
        color: "#5a5248",
        margin: 0,
    },
    footer: {
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid #1e1e1e",
        padding: "48px 60px",
        textAlign: "center",
    },
    footerLogo: {
        fontSize: "18px",
        fontWeight: "700",
        letterSpacing: "0.15em",
        color: "#c8b89a",
        display: "block",
        marginBottom: "12px",
    },
    footerText: {
        fontSize: "13px",
        color: "#4a4a4a",
        marginBottom: "24px",
    },
    footerLinks: {
        display: "flex",
        gap: "32px",
        justifyContent: "center",
    },
    footerLink: {
        fontSize: "12px",
        color: "#4a4a4a",
        textDecoration: "none",
        letterSpacing: "0.08em",
    },
};