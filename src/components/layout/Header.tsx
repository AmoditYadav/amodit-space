'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
];

export function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Track scroll for header background
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen
                    ? 'bg-black/80 backdrop-blur-md border-b border-white/10'
                    : 'bg-transparent'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo / Name */}
                        <Link
                            href="/"
                            className="text-white font-semibold text-lg hover:text-white/80 transition-colors"
                            aria-label="Home"
                        >
                            <span className="text-xl">✦</span>
                            <span className="ml-2 hidden sm:inline">Amodit Yadav</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                        ? 'text-white bg-white/10'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                    aria-current={isActive(link.href) ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMenuOpen}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/90 backdrop-blur-lg transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Menu Content */}
                <nav
                    className={`absolute top-16 inset-x-0 p-4 transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                >
                    <div className="flex flex-col space-y-2">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-3 rounded-xl text-lg font-medium transition-all ${isActive(link.href)
                                    ? 'text-white bg-white/15'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                                aria-current={isActive(link.href) ? 'page' : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </>
    );
}
