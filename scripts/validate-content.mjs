#!/usr/bin/env node
/**
 * Validates post and project frontmatter before a build.
 *
 * Nothing else in this repo type-checks content: getPosts.ts reads frontmatter
 * through import.meta.glob with `|| ''` fallbacks everywhere, so a misspelled
 * key doesn't error, it silently renders an empty string. This script is the
 * check that catches it.
 *
 * Runs automatically via the `prebuild` npm hook, so a broken post fails the
 * GitHub Actions deploy instead of shipping.
 *
 * Draft content downgrades errors to warnings — drafts are excluded from
 * production builds, so a half-finished post must never block a deploy.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "src", "content", "posts");
const PROJECTS_DIR = join(ROOT, "src", "content", "projects");
const PUBLIC_DIR = join(ROOT, "public");

const STOCK_IMAGES = /\/assets\/images\/(posts\/post[123]|projects\/project[123])\.(jpg|png)$/;
const VALID_PROJECT_STATUS = ["shipped", "building", "archived"];

let errorCount = 0;
let warnCount = 0;

function report(level, file, message) {
  const prefix = level === "error" ? "ERROR" : "warn ";
  console.log(`  ${prefix}  ${file}: ${message}`);
  if (level === "error") errorCount++;
  else warnCount++;
}

/**
 * Minimal YAML frontmatter reader covering exactly what this site uses:
 * scalars, quoted strings, booleans, numbers, inline arrays and block
 * sequences. Deliberately dependency-free — adding js-yaml to validate five
 * keys isn't worth the install.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: raw };

  const [, block, body] = match;
  const data = {};
  const lines = block.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;

    const [, key, rawValue] = kv;
    const value = rawValue.trim();

    if (value === "") {
      // Possibly a block sequence on the following lines.
      const items = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        items.push(coerce(lines[++i].replace(/^\s*-\s+/, "").trim()));
      }
      data[key] = items.length > 0 ? items : "";
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => coerce(v.trim()))
        .filter((v) => v !== "");
      continue;
    }

    data[key] = coerce(value);
  }

  return { frontmatter: data, body };
}

function coerce(value) {
  const unquoted = value.replace(/^["'](.*)["']$/, "$1");
  if (unquoted !== value) return unquoted;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function assetExists(path) {
  if (typeof path !== "string" || !path.startsWith("/")) return false;
  const target = join(PUBLIC_DIR, path.replace(/^\//, "").split("?")[0]);
  return existsSync(target) && statSync(target).isFile();
}

function readMarkdown(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = readFileSync(join(dir, name), "utf8");
      const { frontmatter, body } = parseFrontmatter(raw);
      return { name, slugFromFile: name.replace(/\.md$/, ""), frontmatter, body };
    });
}

function checkCommon(entry, requiredKeys, level) {
  const { name, frontmatter, slugFromFile } = entry;

  for (const key of requiredKeys) {
    const value = frontmatter[key];
    if (value === undefined || value === "" || value === null) {
      report(level, name, `missing required frontmatter key \`${key}\``);
    }
  }

  if (frontmatter.date !== undefined && !isValidDate(frontmatter.date)) {
    report(
      level,
      name,
      `date must be a real YYYY-MM-DD calendar date, got \`${frontmatter.date}\``
    );
  }

  if (frontmatter.slug !== undefined && frontmatter.slug !== slugFromFile) {
    report(
      level,
      name,
      `slug \`${frontmatter.slug}\` doesn't match filename \`${slugFromFile}\` — the URL follows slug, which makes the file hard to find later`
    );
  }

  if (frontmatter.image) {
    if (!assetExists(frontmatter.image)) {
      report(
        level,
        name,
        `image \`${frontmatter.image}\` does not exist under public/ — this renders as a broken image on the index card and every social share`
      );
    } else if (STOCK_IMAGES.test(frontmatter.image)) {
      report(
        "warn",
        name,
        `image \`${frontmatter.image}\` is a placeholder from the template — give this one its own hero`
      );
    }
  }

  if (
    typeof frontmatter.description === "string" &&
    frontmatter.description.length > 200
  ) {
    report(
      "warn",
      name,
      `description is ${frontmatter.description.length} chars; search results truncate around 160`
    );
  }
}

function validatePosts() {
  const posts = readMarkdown(POSTS_DIR);
  console.log(`\nPosts (${posts.length})`);

  const seenSlugs = new Map();
  const seriesGroups = new Map();

  for (const entry of posts) {
    const { name, frontmatter, body, slugFromFile } = entry;

    if (!frontmatter) {
      report("error", name, "no frontmatter block found");
      continue;
    }

    const isDraft = frontmatter.draft === true;
    const level = isDraft ? "warn" : "error";

    checkCommon(
      entry,
      ["title", "description", "date", "readTime", "image", "slug"],
      level
    );

    if (frontmatter.draft === undefined) {
      report(
        "warn",
        name,
        "no `draft` key — add `draft: false` explicitly so publish state is never ambiguous"
      );
    }

    const slug = frontmatter.slug || slugFromFile;
    if (seenSlugs.has(slug)) {
      report("error", name, `duplicate slug \`${slug}\` (also in ${seenSlugs.get(slug)})`);
    } else {
      seenSlugs.set(slug, name);
    }

    // The post template renders the title itself and strips the first <h1>
    // from the body unconditionally, so a body H1 is at best redundant and at
    // worst eats a real heading.
    if (/^#\s+\S/m.test(body)) {
      report(
        level,
        name,
        "body contains an `# H1` — the page renders the title from frontmatter and strips the first H1, so body headings must start at `##`"
      );
    }

    if (frontmatter.series) {
      if (!frontmatter.seriesTitle) {
        report(level, name, "`series` set but `seriesTitle` missing");
      }
      if (typeof frontmatter.part !== "number") {
        report(level, name, "`series` set but `part` is not a number");
      }
      const group = seriesGroups.get(frontmatter.series) || [];
      group.push({ name, frontmatter, isDraft });
      seriesGroups.set(frontmatter.series, group);
    } else if (frontmatter.part !== undefined) {
      report(level, name, "`part` set without a `series`");
    }
  }

  for (const [seriesSlug, members] of seriesGroups) {
    const label = `series:${seriesSlug}`;
    const level = members.every((m) => m.isDraft) ? "warn" : "error";

    const parts = members
      .map((m) => m.frontmatter.part)
      .filter((p) => typeof p === "number")
      .sort((a, b) => a - b);

    const duplicates = parts.filter((p, i) => parts.indexOf(p) !== i);
    if (duplicates.length > 0) {
      report(level, label, `duplicate part number(s): ${[...new Set(duplicates)].join(", ")}`);
    }

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== i + 1) {
        report(
          level,
          label,
          `parts must be numbered contiguously from 1; got [${parts.join(", ")}]`
        );
        break;
      }
    }

    const titles = new Set(members.map((m) => m.frontmatter.seriesTitle));
    if (titles.size > 1) {
      report(
        level,
        label,
        `parts disagree on seriesTitle: ${[...titles].map((t) => `"${t}"`).join(" vs ")}`
      );
    }

    const declared = members
      .map((m) => m.frontmatter.partsTotal)
      .filter((n) => typeof n === "number");
    if (declared.length > 0 && Math.max(...declared) < parts.length) {
      report(
        level,
        label,
        `partsTotal (${Math.max(...declared)}) is lower than the number of parts that exist (${parts.length})`
      );
    }

    // Publishing part N while part N-1 is still a draft leaves a live post
    // whose "previous" link goes nowhere.
    const published = members.filter((m) => !m.isDraft).map((m) => m.frontmatter.part);
    if (published.length > 0 && published.length < members.length) {
      const missing = members
        .filter((m) => m.isDraft)
        .map((m) => m.frontmatter.part)
        .filter((p) => typeof p === "number" && p < Math.max(...published));
      if (missing.length > 0) {
        report(
          "error",
          label,
          `part(s) ${missing.join(", ")} are still drafts but a later part is published — readers hit a gap`
        );
      }
    }
  }
}

function validateProjects() {
  const projects = readMarkdown(PROJECTS_DIR);
  console.log(`\nProjects (${projects.length})`);

  const seenSlugs = new Map();

  for (const entry of projects) {
    const { name, frontmatter, slugFromFile } = entry;

    if (!frontmatter) {
      report("error", name, "no frontmatter block found");
      continue;
    }

    const level = frontmatter.draft === true ? "warn" : "error";

    checkCommon(entry, ["title", "description", "date", "image", "slug"], level);

    const slug = frontmatter.slug || slugFromFile;
    if (seenSlugs.has(slug)) {
      report("error", name, `duplicate slug \`${slug}\` (also in ${seenSlugs.get(slug)})`);
    } else {
      seenSlugs.set(slug, name);
    }

    if (
      frontmatter.status !== undefined &&
      !VALID_PROJECT_STATUS.includes(frontmatter.status)
    ) {
      report(
        level,
        name,
        `status \`${frontmatter.status}\` must be one of: ${VALID_PROJECT_STATUS.join(", ")}`
      );
    }

    if (frontmatter.stack !== undefined && !Array.isArray(frontmatter.stack)) {
      report(level, name, "`stack` must be a list");
    }

    for (const key of ["url", "repo"]) {
      const value = frontmatter[key];
      if (value && !/^https?:\/\//.test(value)) {
        report(level, name, `\`${key}\` must be an absolute http(s) URL, got \`${value}\``);
      }
    }
  }
}

console.log("Validating content...");
validatePosts();
validateProjects();

console.log(
  `\n${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${
    warnCount === 1 ? "" : "s"
  }`
);

if (errorCount > 0) {
  console.log("\nContent validation failed. Fix the errors above before building.");
  process.exit(1);
}
