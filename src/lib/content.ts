import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'src/content');

// Types
export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    thumbnail?: string;
    readingTime?: number;
    draft?: boolean;
    contentHtml?: string;
}

export interface Project {
    slug: string;
    title: string;
    description: string;
    thumbnail?: string;
    tags?: string[];
    github?: string;
    demo?: string;
    paper?: string;
    featured?: boolean;
    order?: number;
    contentHtml?: string;
}

// Helper: Calculate reading time
function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// Helper: Process markdown content to HTML
async function processMarkdown(content: string): Promise<string> {
    const processedContent = await remark()
        .use(html)
        .process(content);
    return processedContent.toString();
}

// Get all blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
    const blogDir = path.join(contentDirectory, 'blog');

    // Create directory if it doesn't exist
    if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

    const posts = await Promise.all(
        files.map(async (file) => {
            const slug = file.replace(/\.md$/, '');
            const filePath = path.join(blogDir, file);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContents);
            const contentHtml = await processMarkdown(content);

            const post: BlogPost = {
                slug,
                title: data.title || 'Untitled',
                date: data.date || new Date().toISOString(),
                excerpt: data.excerpt || '',
                thumbnail: data.thumbnail,
                readingTime: calculateReadingTime(content),
                draft: data.draft ?? false,
                contentHtml,
            };

            return post;
        })
    );

    // Filter out drafts in production
    const filteredPosts = process.env.NODE_ENV === 'production'
        ? posts.filter(post => !post.draft)
        : posts;

    // Sort by date (newest first)
    return filteredPosts.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// Get single blog post
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const filePath = path.join(contentDirectory, 'blog', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const contentHtml = await processMarkdown(content);

    const post: BlogPost = {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        thumbnail: data.thumbnail,
        readingTime: calculateReadingTime(content),
        draft: data.draft ?? false,
        contentHtml,
    };

    // Don't show drafts in production
    if (process.env.NODE_ENV === 'production' && post.draft) {
        return null;
    }

    return post;
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
    const projectsDir = path.join(contentDirectory, 'projects');

    // Create directory if it doesn't exist
    if (!fs.existsSync(projectsDir)) {
        fs.mkdirSync(projectsDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.md'));

    const projects = await Promise.all(
        files.map(async (file) => {
            const slug = file.replace(/\.md$/, '');
            const filePath = path.join(projectsDir, file);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContents);
            const contentHtml = await processMarkdown(content);

            const project: Project = {
                slug,
                title: data.title || 'Untitled',
                description: data.description || '',
                thumbnail: data.thumbnail,
                tags: data.tags,
                github: data.github,
                demo: data.demo,
                paper: data.paper,
                featured: data.featured ?? false,
                order: data.order,
                contentHtml,
            };

            return project;
        })
    );

    // Sort by order, then by featured, then by title
    return projects.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.title.localeCompare(b.title);
    });
}

// Get single project
export async function getProject(slug: string): Promise<Project | null> {
    const filePath = path.join(contentDirectory, 'projects', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const contentHtml = await processMarkdown(content);

    const project: Project = {
        slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        thumbnail: data.thumbnail,
        tags: data.tags,
        github: data.github,
        demo: data.demo,
        paper: data.paper,
        featured: data.featured ?? false,
        order: data.order,
        contentHtml,
    };

    return project;
}
