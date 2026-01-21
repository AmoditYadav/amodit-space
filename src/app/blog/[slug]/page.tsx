import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getBlogPosts } from "@/lib/content";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = await getBlogPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.date,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="page-content">
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Back link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors mb-8"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                </Link>

                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-sm text-white/50 mb-4">
                        <time dateTime={post.date}>{formattedDate}</time>
                        {post.readingTime && (
                            <>
                                <span>•</span>
                                <span>{post.readingTime} min read</span>
                            </>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-xl text-white/60">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {/* Thumbnail */}
                {post.thumbnail && (
                    <div className="mb-12 rounded-2xl overflow-hidden">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full aspect-video object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
                />

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            All Posts
                        </Link>

                        {/* Share buttons could go here */}
                    </div>
                </footer>
            </article>
        </div>
    );
}
