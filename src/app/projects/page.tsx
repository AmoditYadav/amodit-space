import { getProjects, urlFor } from '@/lib/sanity';
import Link from 'next/link';

export const revalidate = 60;

interface Project {
    _id: string;
    title: string;
    slug?: string;
    description: string;
    tags?: string[];
    thumbnail?: { asset: { _ref: string } };
    githubUrl?: string;
    demoUrl?: string;
    paperUrl?: string;
    featured?: boolean;
}

export default async function ProjectsPage() {
    const projects: Project[] = await getProjects();

    return (
        <main className="min-h-screen bg-black pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
                <p className="text-white/60 mb-12">
                    A selection of projects I&apos;ve built and contributed to.
                </p>

                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-xl text-white/80 mb-2">Projects coming soon</h2>
                        <p className="text-white/50">Check back for updates.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => {
                            // Fallback: Use stored slug, or generate one from title if missing
                            const slug = project.slug || project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

                            return (
                                <article
                                    key={project._id}
                                    className={`group relative h-full border rounded-lg overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col ${project.featured ? 'border-blue-500/50' : 'border-white/10'
                                        }`}
                                >
                                    <Link
                                        href={`/projects/${slug}`}
                                        className="absolute inset-0 z-10"
                                        aria-label={`View project: ${project.title}`}
                                    />
                                    {project.thumbnail && (
                                        <div className="aspect-video overflow-hidden flex-shrink-0">
                                            <img
                                                src={urlFor(project.thumbnail).width(600).height(340).url()}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h2 className="text-lg font-semibold text-white">
                                                {project.featured && <span className="text-yellow-400 mr-1">⭐</span>}
                                                {project.title}
                                            </h2>
                                        </div>
                                        <p className="text-white/60 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>

                                        {project.tags && project.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 text-xs bg-white/10 text-white/70 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-auto relative z-20">
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-white/60 hover:text-white transition-colors"
                                                >
                                                    GitHub →
                                                </a>
                                            )}
                                            {project.demoUrl && (
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    Live Demo →
                                                </a>
                                            )}
                                            {project.paperUrl && (
                                                <a
                                                    href={project.paperUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-white/60 hover:text-white transition-colors"
                                                >
                                                    Paper →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
