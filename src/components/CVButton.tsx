'use client';

import { useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// CV Download Button Component
// -----------------------------------------------------------------------------
export function CVButton() {
    const [isAvailable, setIsAvailable] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if CV file exists and detect mobile
    useEffect(() => {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);

        // HEAD request to check if CV exists
        fetch('/cv/Amodit_cv_2026.pdf', { method: 'HEAD' })
            .then((res) => {
                setIsAvailable(res.ok);
            })
            .catch(() => {
                setIsAvailable(false);
            });

        // Listen for resize
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Base styles
    const baseStyles: React.CSSProperties = {
        position: 'fixed',
        bottom: isMobile ? 'calc(4rem + env(safe-area-inset-bottom, 0px))' : 'calc(3.5rem + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1.25rem',
        fontSize: isMobile ? '0.875rem' : '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.05em',
        color: isAvailable ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '9999px',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        minWidth: isMobile ? '140px' : '120px',
        minHeight: isMobile ? '48px' : '40px', // Touch-friendly
        // Subtle glow
        boxShadow: isAvailable
            ? '0 0 20px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : 'none',
    };

    const hoverStyles = `
    .cv-button:hover:not([aria-disabled="true"]) {
      background-color: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 0 30px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 1);
    }
    .cv-button:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }
  `;

    // Download icon SVG
    const DownloadIcon = () => (
        <svg
            width={isMobile ? 18 : 14}
            height={isMobile ? 18 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );

    if (!isAvailable) {
        return (
            <>
                <style>{hoverStyles}</style>
                <span
                    className="cv-button"
                    style={baseStyles}
                    role="button"
                    aria-disabled="true"
                    title="CV not found — contact developer"
                >
                    <DownloadIcon />
                    Download CV
                </span>
            </>
        );
    }

    return (
        <>
            <style>{hoverStyles}</style>
            <a
                href="/cv/Amodit_cv_2026.pdf"
                download
                target="_blank"
                rel="noopener noreferrer"
                className="cv-button"
                style={baseStyles}
                aria-label="Download CV (PDF)"
            >
                <DownloadIcon />
                Download CV
            </a>
        </>
    );
}
