import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-01-01';

// Check if Sanity is configured
export const isSanityConfigured = projectId !== 'placeholder' && projectId !== '';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// For previewing drafts
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ============ BLOG QUERIES ============

export async function getPosts() {
  if (!isSanityConfigured) return [];

  try {
    return await client.fetch(`
      *[_type == "post" && draft != true] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        coverImage,
        seoTitle,
        seoDescription
      }
    `);
  } catch {
    return [];
  }
}

export async function getPost(slug: string) {
  if (!isSanityConfigured) return null;

  try {
    return await client.fetch(
      `
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        coverImage,
        body,
        seoTitle,
        seoDescription
      }
    `,
      { slug }
    );
  } catch {
    return null;
  }
}

export async function getPostSlugs() {
  if (!isSanityConfigured) return [];

  try {
    return await client.fetch(`
      *[_type == "post" && draft != true].slug.current
    `);
  } catch {
    return [];
  }
}

// ============ PROJECT QUERIES ============

export async function getProjects() {
  if (!isSanityConfigured) return [];

  try {
    return await client.fetch(`
      *[_type == "project"] | order(order asc) {
        _id,
        _id,
        title,
        "slug": slug.current,
        description,
        tags,
        thumbnail,
        githubUrl,
        demoUrl,
        paperUrl,
        featured
      }
    `);
  } catch {
    return [];
  }
}

export async function getProject(slug: string) {
  if (!isSanityConfigured) return null;

  try {
    // Try to fetch by exact slug first
    const project = await client.fetch(
      `
      *[_type == "project" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        description,
        body,
        tags,
        thumbnail,
        githubUrl,
        demoUrl,
        paperUrl
      }
    `,
      { slug }
    );

    if (project) return project;

    // Fallback: If no project found by slug, it might be a legacy project without a slug field.
    // fetch all projects and match by slugified title
    const allProjects = await getProjects();
    return allProjects.find((p: any) => {
      const generatedSlug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return generatedSlug === slug || p.slug === slug;
    }) || null;

  } catch {
    return null;
  }
}

export async function getProjectSlugs() {
  if (!isSanityConfigured) return [];

  try {
    const projects = await client.fetch(`
      *[_type == "project"] { "slug": slug.current, title }
    `);

    // Return explicit slugs OR generated slugs for legacy items
    return projects.map((p: any) => p.slug || p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
  } catch {
    return [];
  }
}

// ============ ABOUT QUERIES ============

export async function getAbout() {
  if (!isSanityConfigured) return null;

  try {
    return await client.fetch(`
      *[_type == "about"][0] {
        title,
        profileImage,
        bio,
        skills,
        experience,
        "resumeUrl": resume.asset->url
      }
    `);
  } catch {
    return null;
  }
}

// ============ CONTACT QUERIES ============

export async function getContact() {
  if (!isSanityConfigured) return null;

  try {
    return await client.fetch(`
      *[_type == "contact"][0] {
        title,
        subtitle,
        email,
        socials,
        availability,
        formEnabled
      }
    `);
  } catch {
    return null;
  }
}
