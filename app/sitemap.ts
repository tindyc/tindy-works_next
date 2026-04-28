import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tindyc.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/office`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/garden`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/reception`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/sitemap`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
