import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/products', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      photos: z.array(image()).min(1),
      price: z.number().optional(),
      priceMode: z.enum(['fijo', 'desde', 'consultar']),
      category: reference('categories'),
      description: z.string().default(''),
      measures: z.string().optional(),
      colors: z.string().optional(),
      customizable: z.boolean().optional(),
      shipping: z.string().default('todo Panamá'),
      availability: z.enum(['entrega inmediata', 'por pedido']).optional(),
      featured: z.boolean().default(false),
      visible: z.boolean().default(true),
      order: z.number().default(100),
    }),
});

const categories = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/categories' }),
  schema: z.object({
    label: z.string(),
    order: z.number().default(100),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/settings' }),
  schema: ({ image }) =>
    z.object({
      whatsapp: z.string(),
      instagram: z.url(),
      heroTagline: z.string(),
      aboutTitle: z.string(),
      aboutText: z.string(),
      aboutPhoto: image(),
    }),
});

export const collections = { products, categories, settings };
