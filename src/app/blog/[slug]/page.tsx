import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { getPost, getPostSlugs, urlFor } from '@/lib/sanity';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = await getPostSlugs();
    return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
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
    },
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
        code: ({ children }: { children: React.ReactNode }) => (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
        ),
    },
    block: {
        h2: ({ children }: { children?: React.ReactNode }) => (
            <h2 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h2>
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

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-16 px-4">
            <article className="max-w-3xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-white/50 hover:text-white mb-8 transition-colors"
                >
                    <span className="mr-2">←</span> Back to Blog
                </Link>

                {post.coverImage && (
                    <div className="mb-8 rounded-lg overflow-hidden">
                        <img
                            src={urlFor(post.coverImage).width(1200).height(630).url()}
                            alt=""
                            className="w-full"
                        />
                    </div>
                )}

                <header className="mb-10">
                    <time className="text-sm text-white/40 block mb-3">
                        {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : 'Draft'}
                    </time>
                    <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
                    {post.excerpt && <p className="text-xl text-white/60">{post.excerpt}</p>}
                </header>

                <div className="prose prose-invert max-w-none">
                    {post.body && <PortableText value={post.body} components={portableTextComponents} />}
                </div>
            </article>
        </main>
    );
}
