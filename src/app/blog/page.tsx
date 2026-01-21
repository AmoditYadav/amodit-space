import Link from 'next/link';
import { getPosts, urlFor } from '@/lib/sanity';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface Post {
    _id: string;
    title: string;
    slug: string;
    publishedAt: string;
    excerpt: string;
    coverImage?: { asset: { _ref: string } };
}

export default async function BlogPage() {
    const posts: Post[] = await getPosts();

    return (
        <main className="min-h-screen bg-black pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">Blog</h1>
                <p className="text-white/60 mb-12">
                    Thoughts on AI, engineering, and building intelligent systems.
                </p>

                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">📝</div>
                        <h2 className="text-xl text-white/80 mb-2">No posts yet</h2>
                        <p className="text-white/50">Check back soon for new articles.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {posts.map((post) => (
                            <article
                                key={post._id}
                                className="group border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors bg-white/[0.02]"
                            >
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="flex gap-6">
                                        {post.coverImage && (
                                            <div className="hidden sm:block w-32 h-24 rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={urlFor(post.coverImage).width(256).height(192).url()}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <time className="text-sm text-white/40 block mb-2">
                                                {post.publishedAt
                                                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })
                                                    : 'Draft'}
                                            </time>
                                            <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                                                {post.title}
                                            </h2>
                                            {post.excerpt && (
                                                <p className="text-white/60 line-clamp-2">{post.excerpt}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
