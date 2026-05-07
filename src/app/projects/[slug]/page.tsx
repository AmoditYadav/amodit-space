import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { getProject, getProjectSlugs, urlFor, projectId, dataset } from '@/lib/sanity';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = await getProjectSlugs();
    return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        return { title: 'Project Not Found' };
    }

    return {
        title: project.title,
        description: project.description,
    };
}

const portableTextComponents = {
    types: {
        image: ({ value }: { value: { asset: { _ref: string }; alt?: string } }) => (
            <figure className="my-8">
                <img
                    src={urlFor(value).width(800).url()}
                    alt={value.alt || ''}
                    className="rounded-lg w-full"
                />
            </figure>
        ),
        file: ({ value }: { value: { asset: { _ref: string }; description?: string } }) => {
            if (!value?.asset?._ref) return null;

            // Construct file URL from asset ref
            // Ref format: file-123...456-mp4
            const ref = value.asset._ref;
            const [_file, id, extension] = ref.split('-');
            const url = `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;

            return (
                <figure className="my-8">
                    <video controls className="w-full rounded-lg">
                        <source src={url} type={`video/${extension}`} />
                        Your browser does not support the video tag.
                    </video>
                    {value.description && (
                        <figcaption className="text-center text-white/50 text-sm mt-2">
                            {value.description}
                        </figcaption>
                    )}
                </figure>
            );
        },
    },
    marks: {
        link: ({ children, value }: { children: React.ReactNode; value?: { href: string } }) => (
            <a
                href={value?.href || '#'}
                className="text-[#6B9FD4] hover:text-[#93c5fd] underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        ),
        code: ({ children }: { children: React.ReactNode }) => (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
        ),
    },
    block: {
        h2: ({ children }: { children?: React.ReactNode }) => (
            <h2 className="text-2xl font-semibold text-white mt-10 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{children}</h2>
        ),
        h3: ({ children }: { children?: React.ReactNode }) => (
            <h3 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h3>
        ),
        h4: ({ children }: { children?: React.ReactNode }) => (
            <h4 className="text-lg font-medium text-white mt-6 mb-2">{children}</h4>
        ),
        blockquote: ({ children }: { children?: React.ReactNode }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-6 text-white/70 italic">
                {children}
            </blockquote>
        ),
        normal: ({ children }: { children?: React.ReactNode }) => (
            <p className="text-white/80 leading-relaxed mb-4">{children}</p>
        ),
    },
};

export default async function ProjectPage({ params }: Props) {
    const { slug } = await params;
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-16 px-4">
            <article className="max-w-4xl mx-auto">
                <Link
                    href="/projects"
                    className="inline-flex items-center text-white/40 hover:text-white/70 mb-8 transition-colors duration-300 text-sm"
                >
                    <span className="mr-2">←</span> Back to Projects
                </Link>

                {project.thumbnail?.asset?._ref && (
                    <div className="mb-8 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                        <img
                            src={urlFor(project.thumbnail).width(1200).url()}
                            alt=""
                            className="w-full h-auto"
                        />
                    </div>
                )}

                <header className="mb-8">
                    <h1 className="text-4xl font-semibold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{project.title}</h1>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-0.5 text-[11px] bg-white/[0.06] text-white/50 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 mb-8">
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-lg transition-all duration-300 flex items-center gap-2 border border-white/[0.08]"
                            >
                                <span>GitHub</span>
                                <span className="text-white/50">↗</span>
                            </a>
                        )}
                        {project.demoUrl && (
                            <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-[#6B9FD4]/20 hover:bg-[#6B9FD4]/30 text-[#6B9FD4] rounded-lg transition-all duration-300 flex items-center gap-2 border border-[#6B9FD4]/20"
                            >
                                <span>Live Demo</span>
                                <span className="text-white/50">↗</span>
                            </a>
                        )}
                        {project.paperUrl && (
                            <a
                                href={project.paperUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-lg transition-all duration-300 flex items-center gap-2 border border-white/[0.08]"
                            >
                                <span>Paper</span>
                                <span className="text-white/50">↗</span>
                            </a>
                        )}
                        {project.sourceCodeUrl && (
                            <a
                                href={project.sourceCodeUrl + "?dl="}
                                className="px-4 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-lg transition-all duration-300 flex items-center gap-2 border border-purple-500/20"
                            >
                                <span>Download Code / Files</span>
                                <span className="text-white/50">↓</span>
                            </a>
                        )}
                    </div>

                    <div className="text-lg text-white/80 leading-relaxed border-b border-white/10 pb-8 mb-8 whitespace-pre-line">
                        {project.description}
                    </div>
                </header>

                {project.demoVideoUrl && (
                    <figure className="mb-8 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                        <video controls className="w-full h-auto aspect-video">
                            <source src={project.demoVideoUrl} />
                            Your browser does not support the video tag.
                        </video>
                    </figure>
                )}

                {project.body && (
                    <div className="prose prose-invert max-w-none">
                        <PortableText value={project.body} components={portableTextComponents} />
                    </div>
                )}
            </article>
        </main>
    );
}
