import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ProductLike } from './types';

export type Product = ProductLike & { data: CollectionEntry<'products'>['data'] };

export async function getProducts(): Promise<Product[]> {
  const entries = await getCollection('products');
  return entries.map(({ id, data }) => ({ ...data, id, category: data.category.id, data }));
}

export async function getCategories() {
  const entries = await getCollection('categories');
  return entries.map(({ id, data }) => ({ id, ...data }));
}

export async function getSettings() {
  const site = await getEntry('settings', 'site');
  if (!site) throw new Error('Missing src/content/settings/site.yml');
  return site.data;
}
