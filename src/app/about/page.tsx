import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about my background, skills, and experience in AI and machine learning engineering.",
};

export default function AboutPage() {
    return (
        <div className="page-content">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <section className="mb-16 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        About Me
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        AI Engineer passionate about building intelligent systems that solve real-world problems
                    </p>
                </section>

                {/* Bio Section */}
                <section className="mb-16">
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">Background</h2>
                        <div className="prose">
                            <p>
                                I&apos;m an AI Engineer with expertise in deep learning, natural language processing,
                                and computer vision. My work focuses on bridging the gap between cutting-edge
                                research and production-ready systems.
                            </p>
                            <p>
                                With experience across the full ML lifecycle—from data engineering to model
                                deployment—I build solutions that are not just technically impressive but
                                also reliable and maintainable.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-white mb-6">Skills & Expertise</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <SkillCard
                            title="Machine Learning"
                            skills={["Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", "MLOps"]}
                        />
                        <SkillCard
                            title="Languages & Frameworks"
                            skills={["Python", "PyTorch", "TensorFlow", "TypeScript", "React"]}
                        />
                        <SkillCard
                            title="Infrastructure"
                            skills={["Kubernetes", "Docker", "AWS", "GCP", "MLflow"]}
                        />
                        <SkillCard
                            title="Research Areas"
                            skills={["Foundation Models", "Multimodal AI", "Efficient Inference", "AI Safety"]}
                        />
                    </div>
                </section>

                {/* Experience Timeline */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-white mb-6">Experience</h2>

                    <div className="space-y-6">
                        <TimelineItem
                            title="Senior AI Engineer"
                            company="Tech Company"
                            period="2022 - Present"
                            description="Leading development of production ML systems, mentoring junior engineers, and architecting scalable AI solutions."
                        />
                        <TimelineItem
                            title="ML Engineer"
                            company="AI Startup"
                            period="2020 - 2022"
                            description="Built end-to-end ML pipelines, deployed models at scale, and contributed to core product development."
                        />
                        <TimelineItem
                            title="Research Assistant"
                            company="University Lab"
                            period="2018 - 2020"
                            description="Conducted research in deep learning, published papers, and developed novel architectures."
                        />
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">Let&apos;s Connect</h2>
                        <p className="text-white/70 mb-6">
                            Interested in collaboration or want to discuss AI? I&apos;d love to hear from you.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
                        >
                            Get in Touch
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SkillCard({ title, skills }: { title: string; skills: string[] }) {
    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}

function TimelineItem({
    title,
    company,
    period,
    description
}: {
    title: string;
    company: string;
    period: string;
    description: string;
}) {
    return (
        <div className="relative pl-8 border-l border-white/20">
            <div className="absolute left-0 top-1 w-3 h-3 bg-white rounded-full -translate-x-1/2" />
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <span className="text-white/50">at {company}</span>
                </div>
                <p className="text-sm text-white/40 mb-3">{period}</p>
                <p className="text-white/70">{description}</p>
            </div>
        </div>
    );
}
