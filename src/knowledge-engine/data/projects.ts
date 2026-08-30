import type { Project } from '../types';

export const projectsData: Project[] = [
  {
    id: 'lifi-security-protocols',
    title: 'Li-Fi Penetration Testing & Optical Security Protocols',
    domain: 'cybersecurity',
    summary: 'Researched and built custom optical transmission testing protocols (Li-Fi RX 2.0 / 3.0), evaluating physical and packet-level optical vulnerabilities demonstrated to the state Cybercrime Police Department.',
    description: 'A deep-dive research and practical implementation of optical wireless communication security. Developed testing harnesses to simulate eavesdropping, optical packet injection, and signal attenuation in Li-Fi hardware environments. The system evaluated RX 2.0/3.0 protocol performance and was formally demonstrated before law enforcement cybercrime specialists.',
    stack: ['Python', 'C/C++', 'Optical Wireless Communication (OWC)', 'Signal Processing', 'Network Security', 'Linux'],
    links: {
      repo: 'https://github.com/Kamalesh-Suresh-Kumar',
    },
    engineeringDecision: 'Implemented hardware-level validation routines to differentiate between ambient light noise and intentional optical interception vectors, reducing false positives in vulnerability detection by over 40%.',
    relatedSkillIds: ['network-security', 'python', 'c-cpp', 'linux', 'penetration-testing'],
    featured: true,
    metrics: [
      'Presented directly to Cybercrime Police Department',
      'Tested Li-Fi RX 2.0 & 3.0 protocol revisions',
      'Hardware-in-the-loop optical security analysis',
    ],
    status: 'completed',
  },
  {
    id: 'kai-headquarters-os',
    title: 'KAI HQ — Headquarter Operating System',
    domain: 'fullstack',
    summary: 'An interactive portfolio operating system featuring an 8-room architecture, decoupled Experience and Knowledge Engines, static-first fallback design, and a rule-based AI guide.',
    description: 'Reframed the conventional single-page developer portfolio into an interactive digital facility. Built with React 19, TypeScript, and Tailwind CSS. Employs a stateful Experience Engine as a central mediator, a typed Knowledge Engine with sub-millisecond search capabilities, and complete accessibility parity.',
    stack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'CSS Variables', 'Static Automation'],
    links: {
      repo: 'https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ',
      demo: 'https://kamalesh-suresh-kumar.github.io/Portfolio-KAI-HQ/',
    },
    engineeringDecision: 'Decoupled the Knowledge Engine completely from the React UI and Assistant layer, allowing zero-code content updates via structured data and guaranteeing 100% data parity between interactive and fallback modes.',
    relatedSkillIds: ['react', 'typescript', 'tailwind-css', 'vite', 'web-architecture'],
    featured: true,
    metrics: [
      '8 interconnected architectural rooms',
      'Zero external runtime backend dependency',
      '100% static hosting compatibility on GitHub Pages',
    ],
    status: 'production',
  },
  {
    id: 'ci-cd-knowledge-automation',
    title: 'Automated CI/CD Knowledge & Build Pipeline',
    domain: 'devops',
    summary: 'Automated continuous integration and deployment pipeline engineered for static portfolio compilation, schema validation, and GitHub Pages artifact publication.',
    description: 'Designed a high-reliability deployment workflow that runs static validation, TypeScript typechecks, linting standards, and production bundling. Ensures continuous artifact synchronization directly on repository push events.',
    stack: ['GitHub Actions', 'Node.js', 'Vite', 'Bash/Shell', 'YAML'],
    links: {
      repo: 'https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ',
    },
    engineeringDecision: 'Configured unified multi-environment builds that dynamically adapt base paths for both localized sandbox previews and GitHub Pages sub-path deployments.',
    relatedSkillIds: ['github-actions', 'devops-ci-cd', 'linux', 'vite'],
    featured: true,
    metrics: [
      'Automated zero-downtime deployment to GitHub Pages',
      'Automated TypeScript and lint verification gates',
    ],
    status: 'production',
  },
  {
    id: 'conversational-intent-engine',
    title: 'Rule-Based Conversational Router & Knowledge Dispatcher',
    domain: 'ai-ml',
    summary: 'Client-side deterministic natural language intent resolution engine mapping visitor queries to spatial navigation routes and knowledge base entities.',
    description: 'Designed an intent classifier and contextual dispatcher that routes user queries (e.g. "show me backend projects" or "where is your resume") to corresponding facility rooms and knowledge entities without requiring external API calls or latency.',
    stack: ['TypeScript', 'Natural Language Processing', 'Intent Routing', 'Algorithms'],
    links: {
      repo: 'https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ',
    },
    engineeringDecision: 'Implemented a standardized resolve interface that provides a clean seam for future LLM integration while guaranteeing instantaneous sub-10ms rule matching in static environments.',
    relatedSkillIds: ['typescript', 'algorithms', 'web-architecture'],
    featured: false,
    metrics: [
      'Sub-10ms deterministic query resolution',
      'Zero external API key or token requirements',
    ],
    status: 'production',
  },
];
