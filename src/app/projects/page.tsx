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
  sourceCodeUrl?: string;
  demoVideoUrl?: string;
}

export default async function ProjectsPage() {
  const projects: Project[] = await getProjects();

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p className="section-label mb-4">Projects</p>

        <h1
          className="text-4xl sm:text-5xl font-semibold text-white mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Projects
        </h1>
        <p className="text-white/45 mb-12 text-sm">
          A selection of projects built and contributed to.
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-30">✦</div>
            <h2
              className="text-lg text-white/60 mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Projects incoming
            </h2>
            <p className="text-white/35 text-sm">Check back for updates.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const slug =
                project.slug ||
                project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

              return (
                <article
                  key={project._id}
                  className={`group relative h-full glass-card overflow-hidden flex flex-col ${
                    project.featured ? 'border-[#6B9FD4]/30' : ''
                  }`}
                >
                  <Link
                    href={`/projects/${slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View project: ${project.title}`}
                  />

                  {project.thumbnail?.asset?._ref && (
                    <div className="aspect-video overflow-hidden flex-shrink-0">
                      <img
                        src={urlFor(project.thumbnail).width(600).height(340).url()}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h2
                        className="text-base font-medium text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {project.featured && (
                          <span className="text-amber-400/70 mr-1 text-sm">★</span>
                        )}
                        {project.title}
                      </h2>
                    </div>

                    <p className="text-white/50 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                      {project.description}
                    </p>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[11px] bg-white/[0.05] text-white/50 rounded-md"
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
                          className="text-xs text-white/40 hover:text-white/70 transition-colors duration-300"
                        >
                          GitHub →
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6B9FD4]/70 hover:text-[#6B9FD4] transition-colors duration-300"
                        >
                          Live Demo →
                        </a>
                      )}
                      {project.paperUrl && (
                        <a
                          href={project.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/40 hover:text-white/70 transition-colors duration-300"
                        >
                          Paper →
                        </a>
                      )}
                      {project.sourceCodeUrl && (
                        <a
                          href={project.sourceCodeUrl + "?dl="}
                          className="text-xs text-purple-400/70 hover:text-purple-400 transition-colors duration-300"
                        >
                          Download ↓
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
