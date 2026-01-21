import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
    title: "Projects",
    description: "Explore my portfolio of AI and machine learning projects, from research to production systems.",
};

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="page-content">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <section className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Projects
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        A selection of AI and engineering projects I&apos;ve built and contributed to
                    </p>
                </section>

                {/* Projects Grid */}
                <section>
                    {projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {projects.map((project) => (
                                <ProjectCard key={project.slug} project={project} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </section>
            </div>
        </div>
    );
}

function ProjectCard({ project }: { project: any }) {
    return (
        <article className="group bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
            {/* Thumbnail */}
            {project.thumbnail && (
                <div className="aspect-video bg-white/5 overflow-hidden">
                    <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {project.title}
                </h2>

                <p className="text-white/60 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links */}
                <div className="flex gap-3">
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                        >
                            <GithubIcon className="w-4 h-4" />
                            Code
                        </a>
                    )}
                    {project.demo && (
                        <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                        >
                            <ExternalLinkIcon className="w-4 h-4" />
                            Demo
                        </a>
                    )}
                    {project.paper && (
                        <a
                            href={project.paper}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
                        >
                            <DocumentIcon className="w-4 h-4" />
                            Paper
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">Projects Coming Soon</h3>
            <p className="text-white/60 max-w-md mx-auto">
                I&apos;m currently adding my projects. Check back soon to see what I&apos;ve been building!
            </p>
        </div>
    );
}

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
    );
}

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}

function DocumentIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}
