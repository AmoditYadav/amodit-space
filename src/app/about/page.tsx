import { getAbout, urlFor } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';

export const revalidate = 3600; // Revalidate every hour

interface Skill {
    category: string;
    items: string[];
}

interface Experience {
    role: string;
    company: string;
    period: string;
    description: string;
}

interface AboutData {
    title?: string;
    profileImage?: { asset: { _ref: string } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bio?: any[];
    skills?: Skill[];
    experience?: Experience[];
}

const portableTextComponents = {
    marks: {
        link: ({ children, value }: { children: React.ReactNode; value?: { href: string } }) => (
            <a
                href={value?.href || '#'}
                className="text-blue-400 hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        ),
    },
    block: {
        h2: ({ children }: { children?: React.ReactNode }) => (
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }: { children?: React.ReactNode }) => (
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>
        ),
        normal: ({ children }: { children?: React.ReactNode }) => (
            <p className="text-white/80 leading-relaxed mb-4">{children}</p>
        ),
    },
};

// Fallback content when CMS is empty
function FallbackContent() {
    return (
        <>
            <section className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6">About Me</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                    AI Engineer passionate about building intelligent systems that solve real-world problems.
                </p>
                <p className="text-white/80 leading-relaxed">
                    Add your bio through the CMS at /studio to customize this section.
                </p>
            </section>

            <section className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-white mb-3">Machine Learning</h3>
                        <div className="flex flex-wrap gap-2">
                            {['PyTorch', 'TensorFlow', 'Transformers', 'LLMs'].map((skill) => (
                                <span key={skill} className="px-3 py-1 text-sm bg-white/10 text-white/70 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5">
                        <h3 className="text-lg font-medium text-white mb-3">Development</h3>
                        <div className="flex flex-wrap gap-2">
                            {['TypeScript', 'Python', 'React', 'Next.js'].map((skill) => (
                                <span key={skill} className="px-3 py-1 text-sm bg-white/10 text-white/70 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default async function AboutPage() {
    const about: AboutData | null = await getAbout();

    return (
        <main className="min-h-screen bg-black pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">{about?.title || 'About'}</h1>

                {about?.profileImage && (
                    <div className="mb-10">
                        <img
                            src={urlFor(about.profileImage).width(200).height(200).url()}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
                        />
                    </div>
                )}

                {about?.bio ? (
                    <section className="mb-16">
                        <PortableText value={about.bio} components={portableTextComponents} />
                    </section>
                ) : null}

                {about?.skills && about.skills.length > 0 ? (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {about.skills.map((skill, idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-lg p-5">
                                    <h3 className="text-lg font-medium text-white mb-3">{skill.category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skill.items?.map((item) => (
                                            <span
                                                key={item}
                                                className="px-3 py-1 text-sm bg-white/10 text-white/70 rounded"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {about?.experience && about.experience.length > 0 ? (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Experience</h2>
                        <div className="space-y-6">
                            {about.experience.map((exp, idx) => (
                                <div key={idx} className="border-l-2 border-white/20 pl-6">
                                    <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                                    <p className="text-white/60 text-sm mb-2">
                                        {exp.company} • {exp.period}
                                    </p>
                                    <p className="text-white/70 whitespace-pre-line">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {/* Show fallback if no CMS content */}
                {!about && <FallbackContent />}
            </div>
        </main>
    );
}
