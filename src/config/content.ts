export const siteConfig = {
  name: "Counterflow",
  title: "Counterflow",
  description: "A showcase of my work and thoughts",
  social: {
    github: "https://github.com/counterflow",
    linkedin: "https://www.linkedin.com/in/ianf/",
  },
};

export const homeContent = {
  title: "Hi, I'm Ian F",
  description:
    "AI Native systems engineer who turns complex problems into clean, shippable software.",
  buttons: {
    about: {
      text: "View About",
      href: "/about/",
    },
    posts: {
      text: "Read Posts",
      href: "/posts/",
    },
  },
  images: {
    light: "https://multiplepage-portfolio.edgeone.app/assets/images/tech-background-light.svg",
    dark: "/assets/images/tech-background-dark.svg",
  },
};

export const aboutContent = {
  meta: {
    title: "About - Counterflow",
    description: "Learn more about my background, skills, and experience",
  },
  title: "About Me",
  description:
    "I'm a software engineer based in Auckland, New Zealand, who turns complex problems into clean, shippable software. I work across the full stack: modern web, cloud, and AI-native systems, building agentic workflows and tooling around Claude Code.",
  skills: [
    "AI-Native Development",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "C# / ASP.NET Core",
    "PostgreSQL",
    "DevOps & CI/CD",
    "Docker",
    "Azure",
    "Software Architecture",
  ],
  image: {
    src: "/assets/images/about/ian.webp",
    alt: "Ian Faigao",
  },
  experience: {
    title: "What I Do",
    items: [
      {
        period: "01",
        position: "AI-Native Engineering",
        company: "Agents · Skills · Hooks · Custom Tools · MCPs · Claude Code",
        description:
          "I design agentic workflows and custom tooling that fold AI into your software pipeline, helping teams ship faster without giving up quality or control.",
      },
      {
        period: "02",
        position: "Full-Stack Web Development",
        company: "TypeScript · React · Next.js · Node.js · C# / ASP.NET Core",
        description:
          "I build modern, maintainable web apps end to end, from polished front ends to robust APIs and the data layer underneath.",
      },
      {
        period: "03",
        position: "Headless Commerce & Integrations",
        company: "Product config · Cart · Checkout · Payments · Webhooks · RBAC",
        description:
          "I deliver headless commerce and secure third-party integrations, including API key management, rate limiting, caching, and webhooks.",
      },
      {
        period: "04",
        position: "Cloud, DevOps & Architecture",
        company: "Docker · Azure · CI/CD · Solution Architecture",
        description:
          "I architect and automate the path to production with containers, cloud infrastructure, and continuous delivery pipelines.",
      },
    ],
  },
  connect: {
    title: "Let's Work Together",
    description:
      "Have a project in mind or need an extra pair of expert hands? I'm open to consulting and freelance work — send me a message and I'll get back to you.",
  },
};

// Page copy only. The projects themselves live in src/content/projects/*.md
// and are loaded by src/utils/getProjects.ts.
export const projectsContent = {
  meta: {
    title: "Projects - Counterflow",
    description: "Things I've built, and what I learned building them",
  },
  title: "Projects",
  description:
    "Things I've built. Each one has a short case study covering what the problem was, how it's put together, and what I'd do differently.",
};

