import Link from 'next/link';
import { getPosts, urlFor } from '@/lib/sanity';

export const revalidate = 60;

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
        <p className="section-label mb-4">Blog</p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Blog</h1>
        <p className="text-white/45 mb-12 text-sm">Thoughts on AI, engineering, and intelligent systems.</p>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-30">✦</div>
            <h2 className="text-lg text-white/60 mb-2">No posts yet</h2>
            <p className="text-white/35 text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post._id} className="block group">
                <article className="glass-card p-6">
                  <div className="flex gap-6">
                    {post.coverImage && (
                      <div className="hidden sm:block w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={urlFor(post.coverImage).width(256).height(192).url()} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <time className="text-[11px] text-white/30 block mb-2 tracking-wider uppercase">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Draft'}
                      </time>
                      <h2 className="text-lg font-medium text-white group-hover:text-[#6B9FD4] transition-colors duration-300 mb-2">{post.title}</h2>
                      {post.excerpt && <p className="text-white/45 text-sm line-clamp-2">{post.excerpt}</p>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
