import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
    title: "Blog",
    description: "Thoughts, tutorials, and insights on AI, machine learning, and software engineering.",
};

export default async function BlogPage() {
    const posts = await getBlogPosts();

    return (
        <div className="page-content">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <section className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Blog
                    </h1>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Thoughts on AI, engineering, and building intelligent systems
                    </p>
                </section>

                {/* Blog Posts */}
                <section>
                    {posts.length > 0 ? (
                        <div className="space-y-8">
                            {posts.map((post) => (
                                <BlogPostCard key={post.slug} post={post} />
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

function BlogPostCard({ post }: { post: any }) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <article className="group">
            <Link href={`/blog/${post.slug}`} className="block">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07]">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm text-white/50 mb-3">
                        <time dateTime={post.date}>{formattedDate}</time>
                        {post.readingTime && (
                            <>
                                <span>•</span>
                                <span>{post.readingTime} min read</span>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-white/60 line-clamp-2 mb-4">
                        {post.excerpt}
                    </p>

                    {/* Read more */}
                    <span className="inline-flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                        Read more
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </Link>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-white/60 max-w-md mx-auto">
                I&apos;m working on some great content. Check back soon for articles on AI and engineering!
            </p>
        </div>
    );
}
