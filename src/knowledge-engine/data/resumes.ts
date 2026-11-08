import type { ResumeVariant } from '../types';

export const resumeVariantsData: ResumeVariant[] = [
  {
    id: 'resume-fullstack',
    label: 'Full-Stack Software Engineer',
    roleTitle: 'Full-Stack Developer (React / TypeScript / Node.js)',
    bestFor: 'Modern web engineering, frontend architecture, and full-stack product development roles.',
    fileUrl: '/documents/resume-fullstack.pdf',
    lastUpdated: '2026-11',
    highlights: [
      'Architected KAI HQ using React 19, TypeScript, and clean architectural separation',
      'Engineered responsive, accessible, high-performance web applications',
      'Strong mastery of state management, custom hook design, and CSS token systems',
    ],
    skillsSummary: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Vite', 'REST APIs', 'Git'],
  },
  {
    id: 'resume-backend',
    label: 'Backend & Systems Developer',
    roleTitle: 'Backend Software Engineer & Systems Architect',
    bestFor: 'Backend services, distributed systems, API architecture, and database design roles.',
    fileUrl: '/documents/resume-backend.pdf',
    lastUpdated: '2026-11',
    highlights: [
      'Designed deterministic intent resolution engines and modular query APIs',
      'Experience in systems programming with C/C++, Python, and Node.js runtimes',
      'Solid foundations in data structures, algorithms, and networked systems',
    ],
    skillsSummary: ['TypeScript', 'Node.js', 'Python', 'C/C++', 'SQL', 'Linux', 'API Design'],
  },
  {
    id: 'resume-cybersecurity',
    label: 'Cybersecurity & Security Analyst',
    roleTitle: 'Cybersecurity Analyst & Protocol Security Researcher',
    bestFor: 'Security engineering, penetration testing, network defense, and optical security analysis.',
    fileUrl: '/documents/resume-cybersecurity.pdf',
    lastUpdated: '2026-11',
    highlights: [
      'Researched and demonstrated optical penetration testing protocols to state Cybercrime Police',
      'Vulnerability analysis and exploit simulation across wireless & optical channels',
      'Strong command of network security concepts, cryptography, and Linux internals',
    ],
    skillsSummary: ['Network Security', 'Penetration Testing', 'Li-Fi Optical Security', 'Python', 'Linux', 'Cryptography'],
  },
  {
    id: 'resume-ai-systems',
    label: 'AI & Systems Engineer',
    roleTitle: 'Intelligent Systems & Automation Engineer',
    bestFor: 'Software engineering roles focused on intelligent automation, intent routing, and AI workflows.',
    fileUrl: '/documents/resume-ai-systems.pdf',
    lastUpdated: '2026-11',
    highlights: [
      'Developed sub-10ms deterministic conversational routers and knowledge retrieval systems',
      'Automated CI/CD build artifact pipelines with GitHub Actions and schema validation',
      'Designed extensible architectures ready for future generative LLM integration',
    ],
    skillsSummary: ['TypeScript', 'Python', 'Intent Routing', 'CI/CD Automation', 'Algorithms', 'System Architecture'],
  },
];
