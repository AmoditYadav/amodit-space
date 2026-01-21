import { defineType, defineField } from 'sanity';

export const contact = defineType({
    name: 'contact',
    title: 'Contact Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            initialValue: 'Get in Touch',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'text',
            rows: 2,
            description: 'Short description below the title',
        }),
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'string',
        }),
        defineField({
            name: 'socials',
            title: 'Social Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'platform',
                            title: 'Platform',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'GitHub', value: 'github' },
                                    { title: 'LinkedIn', value: 'linkedin' },
                                    { title: 'Twitter / X', value: 'twitter' },
                                    { title: 'YouTube', value: 'youtube' },
                                    { title: 'Instagram', value: 'instagram' },
                                    { title: 'Bluesky', value: 'bluesky' },
                                    { title: 'Mastodon', value: 'mastodon' },
                                    { title: 'Discord', value: 'discord' },
                                    { title: 'Telegram', value: 'telegram' },
                                    { title: 'Other', value: 'other' },
                                ],
                            },
                        },
                        {
                            name: 'label',
                            title: 'Display Label',
                            type: 'string',
                            description: 'Optional custom label (e.g. @username)',
                        },
                        {
                            name: 'url',
                            title: 'URL',
                            type: 'url',
                        },
                    ],
                    preview: {
                        select: { platform: 'platform', label: 'label' },
                        prepare({ platform, label }) {
                            return {
                                title: platform || 'Link',
                                subtitle: label,
                            };
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'availability',
            title: 'Availability Message',
            type: 'text',
            rows: 2,
            description: 'E.g. "Currently open to new opportunities"',
        }),
        defineField({
            name: 'formEnabled',
            title: 'Show Contact Form',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Contact Page',
            };
        },
    },
});
