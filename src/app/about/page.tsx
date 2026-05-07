import { getAbout, urlFor } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';

export const revalidate = 3600;

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
        className="text-[#6B9FD4] hover:text-[#93c5fd] underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-semibold text-white mt-10 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-medium text-white mt-7 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-white/75 leading-relaxed mb-4">{children}</p>
    ),
  },
};

function FallbackContent() {
  return (
    <>
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>About Me</h2>
        <p className="text-white/70 leading-relaxed mb-4">
          AI Engineer building intelligent systems that solve real-world problems.
        </p>
        <p className="text-white/50 leading-relaxed">
          Add your bio through the CMS at /studio to customize this section.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Skills</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="glass-card p-5">
            <h3 className="text-base font-medium text-white mb-3">Machine Learning</h3>
            <div className="flex flex-wrap gap-2">
              {['PyTorch', 'TensorFlow', 'Transformers', 'LLMs'].map((skill) => (
                <span key={skill} className="px-3 py-1 text-sm bg-white/[0.06] text-white/60 rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-base font-medium text-white mb-3">Development</h3>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'Python', 'React', 'Next.js'].map((skill) => (
                <span key={skill} className="px-3 py-1 text-sm bg-white/[0.06] text-white/60 rounded-lg">
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
        {/* Section label */}
        <p className="section-label mb-4">About</p>

        <h1
          className="text-4xl sm:text-5xl font-semibold text-white mb-10"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {about?.title || 'About'}
        </h1>

        {about?.profileImage && (
          <div className="mb-10">
            <img
              src={urlFor(about.profileImage).width(200).height(200).url()}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-white/10"
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
            <h2
              className="text-2xl font-semibold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Skills
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {about.skills.map((skill, idx) => (
                <div key={idx} className="glass-card p-5">
                  <h3 className="text-base font-medium text-white mb-3">{skill.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.items?.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 text-sm bg-white/[0.06] text-white/60 rounded-lg"
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
            <h2
              className="text-2xl font-semibold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Experience
            </h2>
            <div className="space-y-6">
              {about.experience.map((exp, idx) => (
                <div key={idx} className="border-l border-white/10 pl-6">
                  <h3 className="text-lg font-medium text-white">{exp.role}</h3>
                  <p className="text-white/40 text-sm mb-2">
                    {exp.company} · {exp.period}
                  </p>
                  <p className="text-white/60 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!about && <FallbackContent />}
      </div>
    </main>
  );
}
