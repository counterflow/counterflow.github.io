export interface ProjectFrontmatter {
  title?: string;
  description?: string;
  /** Longer pitch shown on the project's own page, under the title. */
  summary?: string;
  date?: string;
  image?: string;
  slug?: string;
  draft?: boolean;
  /** Tech used, rendered as chips. */
  stack?: string[];
  /** Live deployment. Omit if there isn't one. */
  url?: string;
  /** Source code. Omit if private. */
  repo?: string;
  /** shipped | building | archived — drives the status chip. */
  status?: string;
  /** Lower numbers sort first; unset sorts after everything numbered. */
  order?: number;
  /** Show on the projects index above the fold. */
  featured?: boolean;
}

const allProjectModules = import.meta.glob<{
  frontmatter: ProjectFrontmatter;
  default: any;
}>('../content/projects/*.md', { eager: true });

export interface Project {
  title: string;
  description: string;
  summary: string;
  date: string;
  image: string;
  slug: string;
  href: string;
  stack: string[];
  url: string | null;
  repo: string | null;
  status: string;
  order: number | null;
  featured: boolean;
  /** True when the markdown body has content worth linking to. */
  hasCaseStudy: boolean;
}

const DEFAULT_IMAGE = '/assets/images/projects/project1.jpg';

/**
 * All projects, ordered by explicit `order` first, then newest date.
 * Drafts are hidden in production builds and visible in `astro dev`, matching
 * how posts behave.
 */
export function getAllProjects(): Project[] {
  const projects: Project[] = [];

  for (const filePath in allProjectModules) {
    const module = allProjectModules[filePath];

    if (!module) {
      console.warn(`Failed to load module: ${filePath}`);
      continue;
    }

    const frontmatter = module.frontmatter || {};

    if (import.meta.env.PROD && frontmatter.draft) {
      continue;
    }

    const pathMatch = filePath.match(/\/([^/]+)\.md$/);
    const fileName = pathMatch ? pathMatch[1] : '';
    const slug = frontmatter.slug || fileName;

    if (!slug) {
      console.warn(`No slug found for file: ${filePath}`);
      continue;
    }

    const rawBody = (module as { rawContent?: () => string }).rawContent;
    const body = typeof rawBody === 'function' ? rawBody().trim() : '';

    projects.push({
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      summary: frontmatter.summary || frontmatter.description || '',
      date: frontmatter.date || '',
      image: frontmatter.image || DEFAULT_IMAGE,
      slug,
      href: `/projects/${slug}`,
      stack: Array.isArray(frontmatter.stack) ? frontmatter.stack : [],
      url: frontmatter.url || null,
      repo: frontmatter.repo || null,
      status: frontmatter.status || 'shipped',
      order: typeof frontmatter.order === 'number' ? frontmatter.order : null,
      featured: frontmatter.featured === true,
      hasCaseStudy: body.length > 0,
    });
  }

  projects.sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return projects;
}

export function getProjectBySlug(slug: string): {
  frontmatter: ProjectFrontmatter;
  Content: any;
  slug: string;
} | null {
  for (const filePath in allProjectModules) {
    const module = allProjectModules[filePath];

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

export function getAllProjectSlugs(): string[] {
  return getAllProjects().map((project) => project.slug);
}
