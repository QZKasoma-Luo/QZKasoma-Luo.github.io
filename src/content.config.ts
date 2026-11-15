import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

const linkSet = z
  .object({
    repo: z.url().optional(),
    paper: z.url().optional(),
    demo: z.url().optional(),
    doi: z.url().optional(),
  })
  .default({});

const site = defineCollection({
  loader: file('./src/data/site.yaml'),
  schema: z.object({
    name: z.string(),
    initials: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.url(),
    location: z.string(),
    availability: z.string(),
    tagline: z.string(),
    focus: z.array(z.string()),
    socials: z.object({
      github: z.url(),
      linkedin: z.url(),
    }),
    resume: z.string().optional().default(''),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().default(false),
    verified: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().int(),
    kind: z.enum(['research', 'group', 'independent', 'coursework', 'project']),
    status: z.enum(['completed', 'in-progress']).default('completed'),
    role: z.string().optional(),
    team: z.string().optional(),
    tags: z.array(z.string()).default([]),
    links: linkSet,
    deployed: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    draft: z.boolean().default(false),
    verified: z.boolean().default(false),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().int(),
    authors: z.array(z.string()).default([]),
    venue: z.string().optional(),
    status: z.enum(['published', 'under-review', 'preprint', 'in-progress']).default('in-progress'),
    tags: z.array(z.string()).default([]),
    links: linkSet,
    featured: z.boolean().default(false),
    order: z.number().default(99),
    draft: z.boolean().default(false),
    verified: z.boolean().default(false),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    location: z.string().optional(),
    start: z.string(),
    end: z.string().optional(),
    current: z.boolean().default(false),
    summary: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    order: z.number().default(99),
    draft: z.boolean().default(false),
    verified: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    courseNotes: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { site, pages, projects, research, experience, blog };
