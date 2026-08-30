export interface PostFrontmatter {
  title?: string;
  description?: string;
  date?: string;
  readTime?: string;
  image?: string;
  slug?: string;
  draft?: boolean;
  /** Series slug. Present on every part of a multi-part article. */
  series?: string;
  /** Human-readable series name, e.g. "Agents in Production". */
  seriesTitle?: string;
  /** 1-based position within the series. */
  part?: number;
  /** How many parts the series is planned to have. */
  partsTotal?: number;
}

const allMarkdownModules = import.meta.glob<{
  frontmatter: PostFrontmatter;
  default: any;
}>('../content/posts/*.md', { eager: true });

export interface Post {
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  slug: string;
  href: string;
  series: string | null;
  seriesTitle: string | null;
  part: number | null;
  partsTotal: number | null;
}

export interface Series {
  slug: string;
  title: string;
  /** Parts that are actually visible in this environment, ordered by part number. */
  parts: Post[];
  /** Planned length from frontmatter, which may exceed parts.length while a series is mid-publish. */
  partsTotal: number;
  href: string;
}

/**
 * A row on the /posts index: either a standalone post, or a whole series
 * collapsed into a single entry so a six-part article doesn't bury everything
 * else on the page.
 */
export type PostListEntry =
  | ({ kind: 'post' } & Post)
  | {
      kind: 'series';
      title: string;
      description: string;
      /** Newest part's date, so an actively-updated series surfaces near the top. */
      date: string;
      readTime: string;
      image: string;
      slug: string;
      href: string;
      parts: Post[];
      partsTotal: number;
    };

const DEFAULT_IMAGE = '/assets/images/posts/post1.jpg';

function toPost(filePath: string, frontmatter: PostFrontmatter): Post | null {
  const pathMatch = filePath.match(/\/([^/]+)\.md$/);
  const fileName = pathMatch ? pathMatch[1] : '';
  const slug = frontmatter.slug || fileName;

  if (!slug) {
    console.warn(`No slug found for file: ${filePath}`);
    return null;
  }

  return {
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    date: frontmatter.date || '',
    readTime: frontmatter.readTime || '5 min read',
    image: frontmatter.image || DEFAULT_IMAGE,
    slug,
    href: `/posts/${slug}`,
    series: frontmatter.series || null,
    seriesTitle: frontmatter.seriesTitle || null,
    part: typeof frontmatter.part === 'number' ? frontmatter.part : null,
    partsTotal:
      typeof frontmatter.partsTotal === 'number' ? frontmatter.partsTotal : null,
  };
}

function byDateDesc(a: { date: string }, b: { date: string }): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/**
 * Get all posts from the content directory, newest first.
 */
export function getAllPosts(): Post[] {
  const posts: Post[] = [];

  for (const filePath in allMarkdownModules) {
    const module = allMarkdownModules[filePath];

    if (!module) {
      console.warn(`Failed to load module: ${filePath}`);
      continue;
    }

    const frontmatter = module.frontmatter || {};

    // Hide drafts from production builds; they stay visible in `astro dev`.
    if (import.meta.env.PROD && frontmatter.draft) {
      continue;
    }

    const post = toPost(filePath, frontmatter);
    if (post) {
      posts.push(post);
    }
  }

  posts.sort(byDateDesc);

  return posts;
}

/**
 * Every series that has at least one visible part, keyed by series slug.
 * Parts are ordered by part number; a part missing its number sorts last.
 */
export function getAllSeries(): Map<string, Series> {
  const grouped = new Map<string, Post[]>();

  for (const post of getAllPosts()) {
    if (!post.series) continue;
    const existing = grouped.get(post.series);
    if (existing) {
      existing.push(post);
    } else {
      grouped.set(post.series, [post]);
    }
  }

  const series = new Map<string, Series>();

  for (const [slug, parts] of grouped) {
    parts.sort((a, b) => (a.part ?? Infinity) - (b.part ?? Infinity));
    const declaredTotal = parts.find((p) => p.partsTotal !== null)?.partsTotal;

    series.set(slug, {
      slug,
      title: parts[0]?.seriesTitle || parts[0]?.title || slug,
      parts,
      partsTotal: Math.max(declaredTotal ?? 0, parts.length),
      href: `/series/${slug}`,
    });
  }

  return series;
}

/**
 * A single series by slug, or null if nothing in it is visible.
 */
export function getSeries(seriesSlug: string): Series | null {
  return getAllSeries().get(seriesSlug) ?? null;
}

export function getAllSeriesSlugs(): string[] {
  return [...getAllSeries().keys()];
}

/**
 * Where a post sits in its series, and what to link to either side of it.
 * Returns null for standalone posts.
 */
export function getSeriesNav(post: Pick<Post, 'slug' | 'series'>): {
  series: Series;
  index: number;
  prev: Post | null;
  next: Post | null;
} | null {
  if (!post.series) return null;

  const series = getSeries(post.series);
  if (!series) return null;

  const index = series.parts.findIndex((p) => p.slug === post.slug);
  if (index === -1) return null;

  return {
    series,
    index,
    prev: series.parts[index - 1] ?? null,
    next: series.parts[index + 1] ?? null,
  };
}

/**
 * The /posts index feed: standalone posts as-is, series collapsed to one entry.
 * Pagination counts a series as a single row.
 */
export function getPostListEntries(): PostListEntry[] {
  const series = getAllSeries();
  const entries: PostListEntry[] = [];
  const consumed = new Set<string>();

  for (const post of getAllPosts()) {
    if (!post.series) {
      entries.push({ kind: 'post', ...post });
      continue;
    }

    if (consumed.has(post.series)) continue;
    consumed.add(post.series);

    const group = series.get(post.series);
    if (!group || group.parts.length === 0) {
      // Frontmatter claims a series but nothing grouped — render it standalone
      // rather than dropping it silently.
      entries.push({ kind: 'post', ...post });
      continue;
    }

    const first = group.parts[0]!;
    // `post` is the newest part because getAllPosts() is date-sorted.
    entries.push({
      kind: 'series',
      title: group.title,
      description: first.description,
      date: post.date,
      readTime: `${group.parts.length} part${group.parts.length === 1 ? '' : 's'}`,
      image: first.image,
      slug: group.slug,
      href: group.href,
      parts: group.parts,
      partsTotal: group.partsTotal,
    });
  }

  entries.sort(byDateDesc);

  return entries;
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): {
  frontmatter: PostFrontmatter;
  Content: any;
  slug: string;
} | null {
  for (const filePath in allMarkdownModules) {
    const module = allMarkdownModules[filePath];

    if (!module) {
      continue;
    }

    const frontmatter = module.frontmatter || {};

    const pathMatch = filePath.match(/\/([^/]+)\.md$/);
    const fileName = pathMatch ? pathMatch[1] : '';
    const fileSlug = frontmatter.slug || fileName;

    if (fileSlug === slug) {
      return {
        frontmatter,
        Content: module.default,
        slug: fileSlug,
      };
    }
  }

  return null;
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}
