import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { isPublic } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter(isPublic)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Qingze Luo — Writing',
    description: 'Notes on privacy, systems, coursework, and learning in public.',
    site: context.site ?? 'https://qzkasoma-luo.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      // Keep the calendar date stable across negative-offset time zones.
      pubDate: new Date(`${post.data.date.toISOString().slice(0, 10)}T12:00:00Z`),
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-ca</language>',
  });
}
