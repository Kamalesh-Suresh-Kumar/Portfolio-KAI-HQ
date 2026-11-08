import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { contactData } from "../src/knowledge-engine/data/contact";

// Ensure public/documents directory exists
const outputDir = path.resolve(process.cwd(), "public/documents");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface ResumeDetails {
  id: string;
  filename: string;
  roleTitle: string;
  summary: string;
  coreCompetencies: string[];
  toolsTechnologies: string[];
  keyProjects: {
    title: string;
    tech: string;
    bullets: string[];
    link?: string;
  }[];
  experience: {
    role: string;
    organization: string;
    period: string;
    location: string;
    bullets: string[];
  }[];
  certifications: string[];
}

const variants: ResumeDetails[] = [
  // 1. Full-Stack Software Engineer
  {
    id: "resume-fullstack",
    filename: "resume-fullstack.pdf",
    roleTitle: "Full-Stack Software Engineer",
    summary:
      "Computer Science undergraduate and Full-Stack Software Engineer with proven ability in architecting decoupled, high-performance web applications, modern component architectures (React 19, TypeScript), and automated deployment pipelines. Creator of KAI HQ, a fully client-side portfolio operating system featuring deterministic state management, sub-10ms search capabilities, and 100% static hosting on GitHub Pages.",
    coreCompetencies: [
      "Full-Stack Web Architecture",
      "Component Design & Custom Hooks",
      "State Management & Mediators",
      "RESTful API & Service Integration",
      "Performance Optimization",
      "WCAG 2.1 AA Accessibility",
    ],
    toolsTechnologies: [
      "Languages: TypeScript, JavaScript (ESNext), Python, HTML5, CSS3, SQL",
      "Frameworks: React 19, Node.js & Express, Tailwind CSS, Vite",
      "Tools & DevOps: Git, GitHub Actions (CI/CD), Linux/Unix, Bash Scripting",
    ],
    keyProjects: [
      {
        title: "KAI HQ — Headquarter Operating System",
        tech: "React 19, TypeScript, Tailwind CSS, Vite, GitHub Pages",
        bullets: [
          "Architected an 8-room interactive portfolio operating system replacing generic portfolio patterns with a decoupled Experience and Knowledge Engine architecture.",
          "Implemented clean client-side path routing, popstate navigation, and 404 fallback restoration for production deployment on GitHub Pages.",
          "Engineered a persistent shell with fixed header and sidebar, dedicated scrolling container, and accessible mobile navigation drawer.",
        ],
        link: "https://kamalesh-suresh-kumar.github.io/Portfolio-KAI-HQ/",
      },
      {
        title: "Automated CI/CD Knowledge & Build Pipeline",
        tech: "GitHub Actions, Node.js, Vite, Bash, YAML",
        bullets: [
          "Developed automated continuous integration and continuous deployment workflows running automated typechecking, linting gates, and static asset publication.",
          "Implemented multi-environment path resolution enabling dynamic runtime adaptation between local development and GitHub Pages subpaths.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ",
      },
      {
        title: "Rule-Based Conversational Router & Knowledge Dispatcher",
        tech: "TypeScript, Natural Language Intent Resolution, Algorithms",
        bullets: [
          "Designed a deterministic, client-side natural language intent parser routing visitor queries to spatial coordinates and entities in under 10ms with zero API latency.",
        ],
      },
    ],
    experience: [
      {
        role: "Software Development Intern",
        organization: "Viyuga Innovations",
        period: "2024",
        location: "India",
        bullets: [
          "Engineered reusable modular components and responsive user interface flows following enterprise engineering standards.",
          "Participated in active code reviews, sprint workflows, and frontend performance profiling.",
        ],
      },
      {
        role: "Technical Trainee / Intern",
        organization: "Infosys SpringBoard",
        period: "2023 — 2024",
        location: "Virtual / India",
        bullets: [
          "Completed rigorous enterprise curriculum covering cloud computing principles, modern software engineering methodologies, and structured algorithmic problem solving.",
        ],
      },
      {
        role: "Naval Wing Cadet & Field Leadership",
        organization: "National Cadet Corps (NCC - Navy Wing)",
        period: "2022 — Present",
        location: "India",
        bullets: [
          "Underwent operational discipline, naval procedures, drill precision, and crisis response teamwork.",
        ],
      },
    ],
    certifications: [
      "Enterprise Software & Cloud Computing Certification — Infosys SpringBoard (2023 — 2024)",
      "Li-Fi Penetration Testing Demonstration & Law Enforcement Briefing — Cybercrime Police Department (2024)",
      "NCC Naval Wing Cadet Leadership & Service — National Cadet Corps (2022 — Present)",
      "IEEE Computer Society Event Team Contribution Award — IEEE Student Chapter (2023 — 2024)",
    ],
  },

  // 2. Backend & Systems Developer
  {
    id: "resume-backend",
    filename: "resume-backend.pdf",
    roleTitle: "Backend & Systems Software Engineer",
    summary:
      "Computer Science undergraduate specializing in backend architecture, systems programming, and high-efficiency deterministic routing engines. Demonstrated hands-on experience in TypeScript, Node.js, Python, C/C++, and SQL with focus on modular API design, low-latency client-side query evaluation, and systems security. Proven ability to design reliable, decoupled services with strict data typing and zero-downtime automated workflows.",
    coreCompetencies: [
      "Backend & Systems Architecture",
      "API Design & Intent Routing",
      "Data Structures & Complexity Optimization",
      "Relational Data Modeling & SQL",
      "Memory Management & Embedded Logic",
      "Automated CI/CD Validation Gates",
    ],
    toolsTechnologies: [
      "Languages: TypeScript, Python, C/C++, JavaScript, SQL",
      "Backend/Runtimes: Node.js, Express, Linux / Unix CLI, Shell Scripting",
      "Storage & Networking: SQL, REST APIs, Optical Wireless Protocols (OWC)",
      "DevOps: GitHub Actions, Git, Vite Build Tooling, Automated Testing",
    ],
    keyProjects: [
      {
        title: "Rule-Based Conversational Router & Knowledge Dispatcher",
        tech: "TypeScript, Natural Language Processing, Intent Routing, Algorithms",
        bullets: [
          "Engineered a deterministic intent resolution engine and contextual dispatcher routing visitor queries to spatial coordinates and typed records in sub-10ms.",
          "Architected clean interface boundaries decoupling knowledge data from UI layers, providing zero-runtime-cost query execution.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ",
      },
      {
        title: "Li-Fi Penetration Testing & Optical Security Protocols",
        tech: "Python, C/C++, Optical Wireless Communication, Signal Processing, Linux",
        bullets: [
          "Developed low-level testing harnesses in Python and C/C++ simulating packet interception and optical signal attenuation on Li-Fi RX 2.0/3.0 hardware.",
          "Implemented validation routines distinguishing ambient optical noise from exploit injection vectors, boosting vulnerability detection accuracy by over 40%.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar",
      },
      {
        title: "Automated CI/CD Knowledge & Build Pipeline",
        tech: "GitHub Actions, Node.js, Bash, YAML",
        bullets: [
          "Engineered automated deployment workflows running static analysis, compiler gates, and deterministic bundle generation.",
        ],
      },
    ],
    experience: [
      {
        role: "Technical Trainee / Intern",
        organization: "Infosys SpringBoard",
        period: "2023 — 2024",
        location: "Virtual / India",
        bullets: [
          "Completed advanced training in enterprise backend paradigms, cloud architectures, and algorithmic data processing.",
        ],
      },
      {
        role: "Software Development Intern",
        organization: "Viyuga Innovations",
        period: "2024",
        location: "India",
        bullets: [
          "Built and reviewed modular software routines, adhering to strict enterprise code quality and test plans.",
        ],
      },
      {
        role: "Event Team Member / Coordinator",
        organization: "IEEE Computer Society",
        period: "2023 — Present",
        location: "India",
        bullets: [
          "Coordinated competitive programming hackathons, student workshops, and technical symposiums.",
        ],
      },
    ],
    certifications: [
      "Enterprise Software & Cloud Computing Certification — Infosys SpringBoard (2023 — 2024)",
      "Li-Fi Penetration Testing Demonstration & Law Enforcement Briefing — Cybercrime Police Department (2024)",
      "NCC Naval Wing Cadet Leadership & Service — National Cadet Corps (2022 — Present)",
    ],
  },

  // 3. Cybersecurity & Security Analyst
  {
    id: "resume-cybersecurity",
    filename: "resume-cybersecurity.pdf",
    roleTitle: "Cybersecurity Analyst & Protocol Security Researcher",
    summary:
      "Computer Science undergraduate and security researcher with demonstrated practical experience in physical-layer and packet-level optical wireless security (Li-Fi), network vulnerability analysis, and penetration testing. Formally demonstrated custom exploit testing harnesses and protocol evaluations before the state Cybercrime Police Department. Strong command of network security protocols, Linux environments, applied cryptography, and disciplined operational defense.",
    coreCompetencies: [
      "Optical Wireless Security (Li-Fi RX 2.0/3.0)",
      "Penetration Testing & Exploit Analysis",
      "Network Protocol & Packet Analysis",
      "Physical-Layer Vulnerability Assessment",
      "Applied Cryptography & Key Exchange",
      "Linux/Unix Security & Shell Hardening",
    ],
    toolsTechnologies: [
      "Security Toolchains: Optical Wireless Communication (OWC), Packet Analysis, Signal Processing",
      "Languages: Python, C/C++, Bash / Shell Scripting, TypeScript, SQL",
      "Operating Systems & Tools: Linux (Debian/Ubuntu/Arch), Git, Network Analyzers",
      "Concepts: Encryption, Attack Surface Mapping, Air-Gapped / Eavesdropping Vectors",
    ],
    keyProjects: [
      {
        title: "Li-Fi Penetration Testing & Optical Security Protocols",
        tech: "Python, C/C++, OWC Signal Processing, Network Security, Linux",
        bullets: [
          "Researched, developed, and deployed experimental penetration testing protocols for optical wireless transmissions (Li-Fi RX 2.0 and RX 3.0).",
          "Conducted simulated eavesdropping, optical packet injection, and signal attenuation attacks in controlled laboratory testbeds.",
          "Demonstrated findings and mitigation strategies directly to cybercrime law enforcement specialists during formal technical briefings.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar",
      },
      {
        title: "KAI HQ — Headquarter Operating System",
        tech: "React 19, TypeScript, Client-Side Sanitization, Static Architecture",
        bullets: [
          "Engineered an entirely static, serverless digital headquarters eliminating server-side attack surfaces, SQL injection vectors, and unauthorized data leakage.",
          "Implemented clean routing and state encapsulation with zero external analytics tracking.",
        ],
        link: "https://kamalesh-suresh-kumar.github.io/Portfolio-KAI-HQ/",
      },
      {
        title: "Automated CI/CD Security & Integrity Verification Pipeline",
        tech: "GitHub Actions, Bash, TypeScript Compiler",
        bullets: [
          "Engineered deterministic CI verification gates preventing unvetted dependencies or failing lint rules from reaching production builds.",
        ],
      },
    ],
    experience: [
      {
        role: "Naval Wing Cadet & Military Leadership",
        organization: "National Cadet Corps (NCC - Navy Wing)",
        period: "2022 — Present",
        location: "India",
        bullets: [
          "Underwent rigorous military discipline, naval operational procedures, crisis management, and field protocol execution.",
          "Developed high resilience, team command, and adherence to operational security under high-stress scenarios.",
        ],
      },
      {
        role: "Software Development Intern",
        organization: "Viyuga Innovations",
        period: "2024",
        location: "India",
        bullets: [
          "Contributed to secure application design, input validation, and code review processes.",
        ],
      },
      {
        role: "Technical Trainee / Intern",
        organization: "Infosys SpringBoard",
        period: "2023 — 2024",
        location: "Virtual / India",
        bullets: [
          "Completed comprehensive coursework on enterprise network models, cloud security fundamentals, and distributed computing.",
        ],
      },
    ],
    certifications: [
      "Li-Fi Penetration Testing Demonstration & Law Enforcement Briefing — Cybercrime Police Department (2024)",
      "Enterprise Software & Cloud Computing Certification — Infosys SpringBoard (2023 — 2024)",
      "NCC Naval Wing Cadet Leadership & Service — National Cadet Corps (2022 — Present)",
    ],
  },

  // 4. AI & Systems Engineer
  {
    id: "resume-ai-systems",
    filename: "resume-ai-systems.pdf",
    roleTitle: "Intelligent Systems & Automation Engineer",
    summary:
      "Computer Science undergraduate focusing on intelligent automation, deterministic intent resolution engines, and automated knowledge pipelines. Developer of client-side natural language routers capable of sub-10ms query-to-route resolution with zero external API dependencies. Deep foundational skills in algorithms, TypeScript, Python, and CI/CD automation, with an architectural emphasis on low latency, privacy-preserving static systems, and clean interfaces for generative model integration.",
    coreCompetencies: [
      "Deterministic Intent Routing & NLP",
      "Knowledge Engine Architecture & Indexing",
      "Automated CI/CD Workflow Engineering",
      "Data Structures & Complexity Optimization",
      "Static Site Automation & Schema Validation",
      "Modular Systems Architecture",
    ],
    toolsTechnologies: [
      "Languages: TypeScript, Python, JavaScript, C/C++, SQL, Bash",
      "Systems & Frameworks: React 19, Node.js, Vite, GitHub Actions CI/CD",
      "Concepts: Intent Classification, Fuzzy Search, Sub-10ms Query Dispatching, State Mediators",
      "Tooling: Git, Linux, JSON Schema, Modular Compilation",
    ],
    keyProjects: [
      {
        title: "Rule-Based Conversational Router & Knowledge Dispatcher",
        tech: "TypeScript, NLP Algorithms, Intent Routing, Deterministic Dispatch",
        bullets: [
          "Engineered a client-side intent classifier mapping natural language visitor prompts to physical facility coordinates and knowledge entities in under 10ms.",
          "Designed clean modular interfaces ensuring seamless drop-in extensibility for future Large Language Model (LLM) agents without restructuring core routing.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ",
      },
      {
        title: "Automated CI/CD Knowledge & Build Pipeline",
        tech: "GitHub Actions, Node.js, Vite, Bash, YAML",
        bullets: [
          "Built a continuous verification and build system validating TypeScript schemas and generating static production bundles on push events.",
          "Configured multi-environment deployment adaptations targeting GitHub Pages subpaths with zero downtime.",
        ],
        link: "https://github.com/Kamalesh-Suresh-Kumar/Portfolio-KAI-HQ",
      },
      {
        title: "KAI HQ — Headquarter Operating System",
        tech: "React 19, TypeScript, Tailwind CSS, Vite",
        bullets: [
          "Designed and shipped an 8-room portfolio operating system using a stateful Experience Engine and typed static Knowledge Engine.",
        ],
        link: "https://kamalesh-suresh-kumar.github.io/Portfolio-KAI-HQ/",
      },
    ],
    experience: [
      {
        role: "Technical Trainee / Intern",
        organization: "Infosys SpringBoard",
        period: "2023 — 2024",
        location: "Virtual / India",
        bullets: [
          "Mastered enterprise problem-solving paradigms, cloud computing infrastructure, and modular software engineering.",
        ],
      },
      {
        role: "Software Development Intern",
        organization: "Viyuga Innovations",
        period: "2024",
        location: "India",
        bullets: [
          "Implemented frontend and data-handling routines under strict engineering guidelines.",
        ],
      },
      {
        role: "Event Team Member / Coordinator",
        organization: "IEEE Computer Society",
        period: "2023 — Present",
        location: "India",
        bullets: [
          "Organized technical workshops, student hackathons, and software engineering competitions.",
        ],
      },
    ],
    certifications: [
      "Enterprise Software & Cloud Computing Certification — Infosys SpringBoard (2023 — 2024)",
      "Li-Fi Penetration Testing Demonstration & Law Enforcement Briefing — Cybercrime Police Department (2024)",
      "IEEE Computer Society Event Team Contribution Award — IEEE Chapter (2023 — 2024)",
      "NCC Naval Wing Cadet Leadership & Service — National Cadet Corps (2022 — Present)",
    ],
  },
];

function generatePDF(variant: ResumeDetails) {
  const filePath = path.join(outputDir, variant.filename);
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 36, bottom: 36, left: 40, right: 40 },
    info: {
      Title: `Kamalesh Suresh Kumar - ${variant.roleTitle}`,
      Author: "Kamalesh Suresh Kumar",
      Subject: `${variant.roleTitle} Resume`,
      Keywords: "Resume, Software Engineer, Full-Stack, Backend, Cybersecurity, AI Systems",
    },
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const primaryColor = "#0f172a"; // Deep slate
  const accentColor = "#0284c7"; // Professional blue
  const bodyColor = "#334155"; // Neutral dark
  const mutedColor = "#64748b"; // Subtle gray

  // --- HEADER SECTION ---
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(primaryColor)
    .text(contactData.name.toUpperCase(), { align: "center", characterSpacing: 1 });

  doc
    .moveDown(0.2)
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(accentColor)
    .text(variant.roleTitle.toUpperCase(), { align: "center", characterSpacing: 0.5 });

  doc.moveDown(0.2);
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(bodyColor)
    .text(
      `${contactData.email}  |  ${contactData.location}  |  github.com/Kamalesh-Suresh-Kumar  |  Portfolio: kamalesh-suresh-kumar.github.io/Portfolio-KAI-HQ/`,
      { align: "center" }
    );

  // Horizontal divider
  doc.moveDown(0.5);
  doc
    .strokeColor("#cbd5e1")
    .lineWidth(0.8)
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke();
  doc.moveDown(0.6);

  // Helper for Section Headings
  function addSectionHeader(title: string) {
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(primaryColor)
      .text(title.toUpperCase(), { characterSpacing: 0.8 });

    doc
      .strokeColor("#94a3b8")
      .lineWidth(0.5)
      .moveTo(40, doc.y + 2)
      .lineTo(555, doc.y + 2)
      .stroke();

    doc.moveDown(0.4);
  }

  // --- PROFESSIONAL SUMMARY ---
  addSectionHeader("Professional Summary");
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(bodyColor)
    .text(variant.summary, { align: "justify", lineGap: 1.5 });

  // --- TECHNICAL COMPETENCIES & TOOLCHAINS ---
  addSectionHeader("Technical Skills & Core Competencies");
  doc.font("Helvetica").fontSize(8.5).fillColor(bodyColor);
  for (const techLine of variant.toolsTechnologies) {
    const parts = techLine.split(":");
    if (parts.length === 2) {
      doc
        .font("Helvetica-Bold")
        .text(`${parts[0].trim()}: `, { continued: true })
        .font("Helvetica")
        .text(parts[1].trim());
    } else {
      doc.text(techLine);
    }
  }

  doc.moveDown(0.2);
  doc
    .font("Helvetica-Bold")
    .text("Key Competencies: ", { continued: true })
    .font("Helvetica")
    .text(variant.coreCompetencies.join("  *  "));

  // --- KEY ENGINEERING PROJECTS ---
  addSectionHeader("Key Engineering Projects");
  for (const project of variant.keyProjects) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(primaryColor)
      .text(project.title, { continued: true })
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor(mutedColor)
      .text(`  |  ${project.tech}`);

    for (const bullet of project.bullets) {
      doc
        .font("Helvetica")
        .fontSize(8.2)
        .fillColor(bodyColor)
        .text(`  •  ${bullet}`, { lineGap: 1 });
    }
    doc.moveDown(0.2);
  }

  // --- EXPERIENCE & INTERNSHIPS ---
  addSectionHeader("Experience & Leadership");
  for (const exp of variant.experience) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(primaryColor)
      .text(exp.role, { continued: true })
      .font("Helvetica")
      .fillColor(bodyColor)
      .text(` — ${exp.organization}`, { continued: true })
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor(mutedColor)
      .text(`  (${exp.period}  |  ${exp.location})`, { align: "right" });

    for (const bullet of exp.bullets) {
      doc
        .font("Helvetica")
        .fontSize(8.2)
        .fillColor(bodyColor)
        .text(`  •  ${bullet}`, { lineGap: 1 });
    }
    doc.moveDown(0.2);
  }

  // --- EDUCATION ---
  addSectionHeader("Education");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(primaryColor)
    .text("B.E. in Computer Science and Engineering", { continued: true })
    .font("Helvetica")
    .fillColor(bodyColor)
    .text(" — Undergraduate Engineering Program", { continued: true })
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor(mutedColor)
    .text("  (2022 — Present  |  India)", { align: "right" });

  doc
    .font("Helvetica")
    .fontSize(8.2)
    .fillColor(bodyColor)
    .text("  •  Core Coursework: Systems Architecture, Data Structures, Algorithms, Operating Systems, Computer Networks, Database Systems, Network Security.");

  // --- CERTIFICATIONS & VERIFIED HONORS ---
  addSectionHeader("Certifications & Verified Honors");
  for (const cert of variant.certifications) {
    doc
      .font("Helvetica")
      .fontSize(8.2)
      .fillColor(bodyColor)
      .text(`  •  ${cert}`);
  }

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`Generated: ${filePath} (${fs.statSync(filePath).size} bytes)`);
      resolve();
    });
    writeStream.on("error", reject);
  });
}

async function run() {
  console.log("=== Generating Role-Targeted Resume PDFs for KAI HQ ===");
  for (const variant of variants) {
    await generatePDF(variant);
  }
  console.log("=== All 4 Resumes Generated Successfully ===");
}

run().catch((err) => {
  console.error("Error generating PDFs:", err);
  process.exit(1);
});
