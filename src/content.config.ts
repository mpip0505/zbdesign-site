import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const projectTypes = ['residential', 'commercial'] as const;
export type ProjectType = (typeof projectTypes)[number];

// Images are not listed here: they are discovered from
// src/assets/projects/<slug>/design/ and .../completion/ (see src/data/projects.ts).
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    code: z.string().regex(/^ZB\d{2,}$/),
    year: z.number().int(),
    type: z.enum(projectTypes),
    featured: z.boolean().default(false),
    typeConfirmed: z.boolean().default(true),
  }),
});

export const collections = { projects };
