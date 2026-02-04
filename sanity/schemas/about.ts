import { defineType, defineField } from 'sanity';

export const about = defineType({
    name: 'about',
    title: 'About Page',
    type: 'document',
    // Singleton - only one About page
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            initialValue: 'About Me',
        }),
        defineField({
            name: 'resume',
            title: 'Resume/CV',
            type: 'file',
            options: {
                accept: '.pdf',
            },
        }),
        defineField({
            name: 'profileImage',
            title: 'Profile Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'bio',
            title: 'Biography',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Bold', value: 'strong' },
                            { title: 'Italic', value: 'em' },
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
            ],
        }),
        defineField({
            name: 'skills',
            title: 'Skills',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'category', title: 'Category', type: 'string' },
                        {
                            name: 'items',
                            title: 'Items',
                            type: 'array',
                            of: [{ type: 'string' }],
                        },
                    ],
                    preview: {
                        select: { title: 'category' },
                    },
                },
            ],
        }),
        defineField({
            name: 'experience',
            title: 'Experience',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'role', title: 'Role', type: 'string' },
                        { name: 'company', title: 'Company', type: 'string' },
                        { name: 'period', title: 'Period', type: 'string' },
                        { name: 'description', title: 'Description', type: 'text' },
                    ],
                    preview: {
                        select: { title: 'role', subtitle: 'company' },
                    },
                },
            ],
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'About Page',
            };
        },
    },
});
