'use client';

import { useState, useEffect } from 'react';

export function CVButton() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string>('/cv/Amodit_cv_2026.pdf');
  const [isInternal, setIsInternal] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);

    // Delay visibility for intro
    const timer = setTimeout(() => setIsVisible(true), 4500);

    const checkResume = async () => {
      try {
        const { client } = await import('@/lib/sanity');
        const sanityUrl = await client.fetch(`*[_type == "about"][0].resume.asset->url`);
        if (sanityUrl) {
          setResumeUrl(sanityUrl);
          setIsAvailable(true);
          setIsInternal(false);
          return;
        }
      } catch (error) {
        console.warn("Failed to fetch resume from Sanity:", error);
      }

      try {
        const res = await fetch('/cv/Amodit_cv_2026.pdf', { method: 'HEAD' });
        setIsAvailable(res.ok);
        if (res.ok) setResumeUrl('/cv/Amodit_cv_2026.pdf');
      } catch {
        setIsAvailable(false);
      }
    };

    checkResume();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const buttonClass = `
    fixed z-20 flex items-center justify-center gap-2
    rounded-full transition-all duration-500
    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
    ${isAvailable
      ? 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.18] text-white/75 hover:text-white/95 cursor-pointer backdrop-blur-xl'
      : 'bg-white/[0.03] border border-white/[0.06] text-white/30 cursor-not-allowed'
    }
  `;

  const style: React.CSSProperties = {
    bottom: isMobile
      ? 'calc(4rem + env(safe-area-inset-bottom, 0px))'
      : 'calc(3.5rem + env(safe-area-inset-bottom, 0px))',
    left: '50%',
    transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(8px)'}`,
    padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1.25rem',
    fontSize: isMobile ? '0.8rem' : '0.7rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    textDecoration: 'none',
    minWidth: isMobile ? '140px' : '120px',
    minHeight: isMobile ? '48px' : '40px',
  };

  const DownloadIcon = () => (
    <svg
      width={isMobile ? 16 : 13}
      height={isMobile ? 16 : 13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
      <span className={buttonClass} style={style} role="button" aria-disabled="true" title="CV not available">
        <DownloadIcon />
        Download CV
      </span>
    );
  }

  return (
    <a
      href={resumeUrl}
      download={isInternal}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
      style={style}
      aria-label="Download CV (PDF)"
    >
      <DownloadIcon />
      Download CV
    </a>
  );
}
