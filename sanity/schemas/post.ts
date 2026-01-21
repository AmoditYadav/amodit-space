import { defineType, defineField } from 'sanity';

export const post = defineType({
    name: 'post',
    title: 'Blog Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 3,
            description: 'Short description for previews and SEO',
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'Quote', value: 'blockquote' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Bold', value: 'strong' },
                            { title: 'Italic', value: 'em' },
                            { title: 'Code', value: 'code' },
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {
                                        name: 'href',
                                        type: 'url',
                                        title: 'URL',
                                    },
                                ],
                            },
                        ],
                    },
                },
                {
                    type: 'image',
                    options: { hotspot: true },
                },
                {
                    type: 'code',
                    title: 'Code Block',
                    options: {
                        language: 'typescript',
                        languageAlternatives: [
                            { title: 'TypeScript', value: 'typescript' },
                            { title: 'JavaScript', value: 'javascript' },
                            { title: 'Python', value: 'python' },
                            { title: 'Bash', value: 'bash' },
                            { title: 'JSON', value: 'json' },
                        ],
                    },
                },
            ],
        }),
        defineField({
            name: 'draft',
            title: 'Draft',
            type: 'boolean',
            initialValue: true,
            description: 'Set to false to publish',
        }),
        defineField({
            name: 'seoTitle',
            title: 'SEO Title',
            type: 'string',
            description: 'Optional custom title for search engines',
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Description',
            type: 'text',
            rows: 2,
            description: 'Optional custom description for search engines',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            date: 'publishedAt',
            media: 'coverImage',
            draft: 'draft',
        },
        prepare({ title, date, media, draft }) {
            return {
                title: draft ? `[DRAFT] ${title}` : title,
                subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
                media,
            };
        },
    },
    orderings: [
        {
            title: 'Publish Date, New',
            name: 'publishDateDesc',
            by: [{ field: 'publishedAt', direction: 'desc' }],
        },
    ],
});
