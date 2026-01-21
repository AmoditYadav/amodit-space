import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with me for collaborations, speaking opportunities, or just to say hello.",
};

export default function ContactPage() {
    return (
        <div className="page-content">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <section className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Have a question or want to work together? I&apos;d love to hear from you.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <section>
                        <ContactForm />
                    </section>

                    {/* Contact Info */}
                    <section className="space-y-8">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h2 className="text-lg font-semibold text-white mb-4">Connect</h2>

                            <div className="space-y-4">
                                <ContactLink
                                    icon={<EmailIcon />}
                                    label="Email"
                                    value="hello@example.com"
                                    href="mailto:hello@example.com"
                                />
                                <ContactLink
                                    icon={<LinkedInIcon />}
                                    label="LinkedIn"
                                    value="linkedin.com/in/profile"
                                    href="https://linkedin.com/in/profile"
                                />
                                <ContactLink
                                    icon={<GithubIcon />}
                                    label="GitHub"
                                    value="github.com/username"
                                    href="https://github.com/username"
                                />
                                <ContactLink
                                    icon={<TwitterIcon />}
                                    label="Twitter"
                                    value="@username"
                                    href="https://twitter.com/username"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                            <h2 className="text-lg font-semibold text-white mb-2">Open to Opportunities</h2>
                            <p className="text-white/60 text-sm">
                                I&apos;m currently available for consulting, speaking engagements,
                                and interesting AI/ML projects. Let&apos;s discuss how we can work together.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ContactForm() {
    return (
        <form
            action="https://formspree.io/f/your-form-id"
            method="POST"
            className="space-y-6"
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors"
                    placeholder="Your name"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                    Subject
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors"
                    placeholder="What's this about?"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors resize-none"
                    placeholder="Tell me about your project or inquiry..."
                />
            </div>

            <button
                type="submit"
                className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            >
                Send Message
            </button>
        </form>
    );
}

function ContactLink({
    icon,
    label,
    value,
    href
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
        >
            <span className="text-white/50 group-hover:text-white transition-colors">
                {icon}
            </span>
            <div>
                <div className="text-xs text-white/40">{label}</div>
                <div>{value}</div>
            </div>
        </a>
    );
}

function EmailIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
    );
}

function TwitterIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}
