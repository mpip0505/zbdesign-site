import type { APIRoute } from 'astro';

// Blocks all crawlers until PUBLIC_INDEXABLE=true is set (see README, "Launch").
export const GET: APIRoute = ({ site }) => {
  const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';
  const sitemap = new URL('/sitemap-index.xml', site).href;
  const body = indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
