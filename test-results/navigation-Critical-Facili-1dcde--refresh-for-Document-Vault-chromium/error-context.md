# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Critical Facility Room Navigation Suite >> Direct URL Routing & Page Reload >> verifies direct URL navigation and refresh for Document Vault
- Location: e2e/navigation.spec.ts:96:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected substring: "Role-Tailored Specifications"
Received string:    "FACILITY CODE: ROOM-05 // VERIFIED DOCUMENTSDocument VaultSecure digital repository of role-tailored resume variants, verified competency matrices, and certified enterprise credentials. Inspect tailored highlights or download available specifications.4Resume Variants1Credential Records20Targeted Competencies4 LinkedRepository StatusCurated Career Variants (4)Full-Stack Software EngineerUpdated 2026-11Full-Stack Developer (React / TypeScript / Node.js)Full-Stack Software EngineerTarget Scope: Modern web engineering, frontend architecture, and full-stack product development roles.Tailored HighlightsArchitected KAI HQ using React 19, TypeScript, and clean architectural separationEngineered responsive, accessible, high-performance web applicationsStrong mastery of state management, custom hook design, and CSS token systemsCore CompetenciesReact 19TypeScriptTailwind CSSNode.js (Tooling)ViteREST APIsGitVerified PDF ArtifactInspectView PDFDownloadBackend & Systems DeveloperUpdated 2026-11Backend Software Engineer & Systems ArchitectBackend & Systems DeveloperTarget Scope: Backend services, distributed systems, API architecture, and database design roles.Tailored HighlightsDesigned deterministic intent resolution engines and modular query APIsExperience in systems programming with C/C++, Python, and Node.js runtimesSolid foundations in data structures, algorithms, and networked systemsCore CompetenciesTypeScriptNode.js (Tooling)PythonC/C++SQLLinuxAPI DesignVerified PDF ArtifactInspectView PDFDownloadCybersecurity & Security AnalystUpdated 2026-11Cybersecurity Analyst & Protocol Security ResearcherCybersecurity & Security AnalystTarget Scope: Security engineering, penetration testing, network defense, and optical security analysis.Tailored HighlightsResearched and demonstrated optical penetration testing protocols to state Cybercrime PoliceVulnerability analysis and exploit simulation across wireless & optical channelsStrong command of network security concepts, cryptography, and Linux internalsCore CompetenciesNetwork SecurityPenetration TestingLi-Fi Optical SecurityPythonLinuxCryptographyVerified PDF ArtifactInspectView PDFDownloadAI & Systems EngineerUpdated 2026-11Intelligent Systems & Automation EngineerAI & Systems EngineerTarget Scope: Software engineering roles focused on intelligent automation, intent routing, and AI workflows.Tailored HighlightsDeveloped sub-10ms deterministic intent routers and knowledge retrieval systemsAutomated CI/CD build artifact pipelines with GitHub Actions and schema validationDesigned extensible architectures ready for future generative LLM integrationCore CompetenciesTypeScriptPythonIntent RoutingCI/CD AutomationAlgorithmsSystem ArchitectureVerified PDF ArtifactInspectView PDFDownloadVerified Credentials & Enterprise CertificationsEnterprise Software & Cloud Computing CertificationVerifiedInfosys SpringBoardAwarded formal technical certification upon successful completion of intensive coursework and assessments in modern programming, cloud fundamentals, and software engineering principles.2023 — 2024"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('main') with timeout 5000ms
  - waiting for locator('main')
    13 × locator resolved to <main tabindex="-1" id="main-content" class="main-content" aria-label="Current Facility Room">…</main>
       - unexpected value "FACILITY CODE: ROOM-05 // VERIFIED DOCUMENTSDocument VaultSecure digital repository of role-tailored resume variants, verified competency matrices, and certified enterprise credentials. Inspect tailored highlights or download available specifications.4Resume Variants1Credential Records20Targeted Competencies4 LinkedRepository StatusCurated Career Variants (4)Full-Stack Software EngineerUpdated 2026-11Full-Stack Developer (React / TypeScript / Node.js)Full-Stack Software EngineerTarget Scope: Modern web engineering, frontend architecture, and full-stack product development roles.Tailored HighlightsArchitected KAI HQ using React 19, TypeScript, and clean architectural separationEngineered responsive, accessible, high-performance web applicationsStrong mastery of state management, custom hook design, and CSS token systemsCore CompetenciesReact 19TypeScriptTailwind CSSNode.js (Tooling)ViteREST APIsGitVerified PDF ArtifactInspectView PDFDownloadBackend & Systems DeveloperUpdated 2026-11Backend Software Engineer & Systems ArchitectBackend & Systems DeveloperTarget Scope: Backend services, distributed systems, API architecture, and database design roles.Tailored HighlightsDesigned deterministic intent resolution engines and modular query APIsExperience in systems programming with C/C++, Python, and Node.js runtimesSolid foundations in data structures, algorithms, and networked systemsCore CompetenciesTypeScriptNode.js (Tooling)PythonC/C++SQLLinuxAPI DesignVerified PDF ArtifactInspectView PDFDownloadCybersecurity & Security AnalystUpdated 2026-11Cybersecurity Analyst & Protocol Security ResearcherCybersecurity & Security AnalystTarget Scope: Security engineering, penetration testing, network defense, and optical security analysis.Tailored HighlightsResearched and demonstrated optical penetration testing protocols to state Cybercrime PoliceVulnerability analysis and exploit simulation across wireless & optical channelsStrong command of network security concepts, cryptography, and Linux internalsCore CompetenciesNetwork SecurityPenetration TestingLi-Fi Optical SecurityPythonLinuxCryptographyVerified PDF ArtifactInspectView PDFDownloadAI & Systems EngineerUpdated 2026-11Intelligent Systems & Automation EngineerAI & Systems EngineerTarget Scope: Software engineering roles focused on intelligent automation, intent routing, and AI workflows.Tailored HighlightsDeveloped sub-10ms deterministic intent routers and knowledge retrieval systemsAutomated CI/CD build artifact pipelines with GitHub Actions and schema validationDesigned extensible architectures ready for future generative LLM integrationCore CompetenciesTypeScriptPythonIntent RoutingCI/CD AutomationAlgorithmsSystem ArchitectureVerified PDF ArtifactInspectView PDFDownloadVerified Credentials & Enterprise CertificationsEnterprise Software & Cloud Computing CertificationVerifiedInfosys SpringBoardAwarded formal technical certification upon successful completion of intensive coursework and assessments in modern programming, cloud fundamentals, and software engineering principles.2023 — 2024"

```

```yaml
- main "Current Facility Room":
  - 'region "Facility Room: DocumentVault"':
    - region "Document Vault":
      - text: "FACILITY CODE: ROOM-05 // VERIFIED DOCUMENTS"
      - heading "Document Vault" [level=1]
      - paragraph: Secure digital repository of role-tailored resume variants, verified competency matrices, and certified enterprise credentials. Inspect tailored highlights or download available specifications.
      - text: 4 Resume Variants 1 Credential Records 20 Targeted Competencies 4 Linked Repository Status Curated Career Variants (4)
      - textbox "Search resume variants by keyword or skill":
        - /placeholder: Search role, skills, keywords...
      - region "Role-Targeted Resume Variants":
        - article "Full-Stack Software Engineer specification":
          - text: Full-Stack Software Engineer Updated 2026-11
          - heading "Full-Stack Developer (React / TypeScript / Node.js)" [level=3]
          - text: Full-Stack Software Engineer
          - paragraph:
            - strong: "Target Scope:"
            - text: Modern web engineering, frontend architecture, and full-stack product development roles.
          - heading "Tailored Highlights" [level=4]
          - list:
            - listitem: Architected KAI HQ using React 19, TypeScript, and clean architectural separation
            - listitem: Engineered responsive, accessible, high-performance web applications
            - listitem: Strong mastery of state management, custom hook design, and CSS token systems
          - heading "Core Competencies" [level=4]
          - text: React 19 TypeScript Tailwind CSS Node.js (Tooling) Vite REST APIs Git Verified PDF Artifact
          - button "Inspect Full-Stack Software Engineer summary specifications": Inspect
          - link "View Full-Stack Software Engineer PDF in new tab":
            - /url: /documents/resume-fullstack.pdf
            - text: View PDF
          - link "Download Full-Stack Software Engineer PDF":
            - /url: /documents/resume-fullstack.pdf
            - text: Download
        - article "Backend & Systems Developer specification":
          - text: Backend & Systems Developer Updated 2026-11
          - heading "Backend Software Engineer & Systems Architect" [level=3]
          - text: Backend & Systems Developer
          - paragraph:
            - strong: "Target Scope:"
            - text: Backend services, distributed systems, API architecture, and database design roles.
          - heading "Tailored Highlights" [level=4]
          - list:
            - listitem: Designed deterministic intent resolution engines and modular query APIs
            - listitem: Experience in systems programming with C/C++, Python, and Node.js runtimes
            - listitem: Solid foundations in data structures, algorithms, and networked systems
          - heading "Core Competencies" [level=4]
          - text: TypeScript Node.js (Tooling) Python C/C++ SQL Linux API Design Verified PDF Artifact
          - button "Inspect Backend & Systems Developer summary specifications": Inspect
          - link "View Backend & Systems Developer PDF in new tab":
            - /url: /documents/resume-backend.pdf
            - text: View PDF
          - link "Download Backend & Systems Developer PDF":
            - /url: /documents/resume-backend.pdf
            - text: Download
        - article "Cybersecurity & Security Analyst specification":
          - text: Cybersecurity & Security Analyst Updated 2026-11
          - heading "Cybersecurity Analyst & Protocol Security Researcher" [level=3]
          - text: Cybersecurity & Security Analyst
          - paragraph:
            - strong: "Target Scope:"
            - text: Security engineering, penetration testing, network defense, and optical security analysis.
          - heading "Tailored Highlights" [level=4]
          - list:
            - listitem: Researched and demonstrated optical penetration testing protocols to state Cybercrime Police
            - listitem: Vulnerability analysis and exploit simulation across wireless & optical channels
            - listitem: Strong command of network security concepts, cryptography, and Linux internals
          - heading "Core Competencies" [level=4]
          - text: Network Security Penetration Testing Li-Fi Optical Security Python Linux Cryptography Verified PDF Artifact
          - button "Inspect Cybersecurity & Security Analyst summary specifications": Inspect
          - link "View Cybersecurity & Security Analyst PDF in new tab":
            - /url: /documents/resume-cybersecurity.pdf
            - text: View PDF
          - link "Download Cybersecurity & Security Analyst PDF":
            - /url: /documents/resume-cybersecurity.pdf
            - text: Download
        - article "AI & Systems Engineer specification":
          - text: AI & Systems Engineer Updated 2026-11
          - heading "Intelligent Systems & Automation Engineer" [level=3]
          - text: AI & Systems Engineer
          - paragraph:
            - strong: "Target Scope:"
            - text: Software engineering roles focused on intelligent automation, intent routing, and AI workflows.
          - heading "Tailored Highlights" [level=4]
          - list:
            - listitem: Developed sub-10ms deterministic intent routers and knowledge retrieval systems
            - listitem: Automated CI/CD build artifact pipelines with GitHub Actions and schema validation
            - listitem: Designed extensible architectures ready for future generative LLM integration
          - heading "Core Competencies" [level=4]
          - text: TypeScript Python Intent Routing CI/CD Automation Algorithms System Architecture Verified PDF Artifact
          - button "Inspect AI & Systems Engineer summary specifications": Inspect
          - link "View AI & Systems Engineer PDF in new tab":
            - /url: /documents/resume-ai-systems.pdf
            - text: View PDF
          - link "Download AI & Systems Engineer PDF":
            - /url: /documents/resume-ai-systems.pdf
            - text: Download
      - region "Verified Credentials Registry":
        - heading "Verified Credentials & Enterprise Certifications" [level=2]
        - heading "Enterprise Software & Cloud Computing Certification" [level=3]
        - text: Verified Infosys SpringBoard
        - paragraph: Awarded formal technical certification upon successful completion of intensive coursework and assessments in modern programming, cloud fundamentals, and software engineering principles.
        - text: 2023 — 2024
```

# Test source

```ts
  3   | /**
  4   |  * KAI HQ — Critical Facility Room Navigation E2E Suite (Phase 6.3.3)
  5   |  *
  6   |  * Verifies end-to-end interactive navigation across all eight facility rooms,
  7   |  * direct URL routing, nested route reloads, and browser history (back/forward).
  8   |  */
  9   | 
  10  | const ROOMS = [
  11  |   {
  12  |     name: "Lobby",
  13  |     slug: "",
  14  |     expectedHeading: "KAI HQ",
  15  |     expectedContent: "Kamalesh Suresh Kumar",
  16  |   },
  17  |   {
  18  |     name: "Engineering Laboratory",
  19  |     slug: "engineering-laboratory",
  20  |     expectedHeading: "Engineering Laboratory",
  21  |     expectedContent: "Li-Fi Penetration Testing",
  22  |   },
  23  |   {
  24  |     name: "Memory Archive",
  25  |     slug: "memory-archive",
  26  |     expectedHeading: "Memory Archive",
  27  |     expectedContent: "Computer Science and Engineering",
  28  |   },
  29  |   {
  30  |     name: "Achievement Hall",
  31  |     slug: "achievement-hall",
  32  |     expectedHeading: "Achievement Hall",
  33  |     expectedContent: "Cybercrime Police Department",
  34  |   },
  35  |   {
  36  |     name: "Document Vault",
  37  |     slug: "document-vault",
  38  |     expectedHeading: "Document Vault",
  39  |     expectedContent: "Role-Tailored Specifications",
  40  |   },
  41  |   {
  42  |     name: "Communication Center",
  43  |     slug: "communication-center",
  44  |     expectedHeading: "Communication Center",
  45  |     expectedContent: "kamalesh.sde@gmail.com",
  46  |   },
  47  |   {
  48  |     name: "Skill Processor",
  49  |     slug: "skill-processor",
  50  |     expectedHeading: "Skill Processor",
  51  |     expectedContent: "TypeScript",
  52  |   },
  53  |   {
  54  |     name: "Mission Control",
  55  |     slug: "mission-control",
  56  |     expectedHeading: "Mission Control",
  57  |     expectedContent: "Global Telemetry",
  58  |   },
  59  | ];
  60  | 
  61  | test.describe("Critical Facility Room Navigation Suite", () => {
  62  |   test.beforeEach(async ({ page }) => {
  63  |     // Bypass the visual boot sequence to ensure deterministic execution
  64  |     await page.addInitScript(() => {
  65  |       sessionStorage.setItem("kai_hq_booted", "true");
  66  |     });
  67  |   });
  68  | 
  69  |   test("verifies that all eight facility rooms can be navigated via sidebar controls", async ({ page }) => {
  70  |     await page.goto("/");
  71  |     await page.waitForSelector("#kai-sidebar-nav");
  72  | 
  73  |     for (const room of ROOMS) {
  74  |       if (room.name === "Lobby") continue; // We start on Lobby
  75  | 
  76  |       // Click the room button in the sidebar
  77  |       const roomButton = page.locator(`#kai-sidebar-nav button:has-text("${room.name}")`);
  78  |       await expect(roomButton).toBeVisible();
  79  |       await roomButton.click();
  80  | 
  81  |       // Verify the URL changed to match the room slug
  82  |       await page.waitForURL(`**/${room.slug}`);
  83  | 
  84  |       // Verify room content rendered
  85  |       await expect(page.locator("main")).toContainText(room.expectedHeading);
  86  |       await expect(page.locator("main")).toContainText(room.expectedContent);
  87  | 
  88  |       // Verify sidebar navigation state
  89  |       await expect(roomButton).toHaveAttribute("aria-current", "page");
  90  |       await expect(roomButton).toHaveClass(/active/);
  91  |     }
  92  |   });
  93  | 
  94  |   test.describe("Direct URL Routing & Page Reload", () => {
  95  |     for (const room of ROOMS) {
  96  |       test(`verifies direct URL navigation and refresh for ${room.name}`, async ({ page }) => {
  97  |         const targetUrl = room.slug ? `/${room.slug}` : "/";
  98  |         await page.goto(targetUrl);
  99  |         await page.waitForSelector("main");
  100 | 
  101 |         // Verify correct room loaded on direct entry
  102 |         await expect(page.locator("main")).toContainText(room.expectedHeading);
> 103 |         await expect(page.locator("main")).toContainText(room.expectedContent);
      |                                            ^ Error: expect(locator).toContainText(expected) failed
  104 | 
  105 |         // Verify navigation state indicator
  106 |         const activeNavBtn = page.locator(`#kai-sidebar-nav button:has-text("${room.name}")`);
  107 |         await expect(activeNavBtn).toHaveAttribute("aria-current", "page");
  108 | 
  109 |         // Reload the nested route to verify SPA server routing does not 404
  110 |         await page.reload();
  111 |         await page.waitForSelector("main");
  112 |         await expect(page.locator("main")).toContainText(room.expectedHeading);
  113 |         await expect(activeNavBtn).toHaveAttribute("aria-current", "page");
  114 |       });
  115 |     }
  116 |   });
  117 | 
  118 |   test("verifies browser Back and Forward history navigation maintains state", async ({ page }) => {
  119 |     await page.goto("/");
  120 |     await page.waitForSelector("#kai-sidebar-nav");
  121 | 
  122 |     // 1. Navigate Lobby -> Engineering Laboratory
  123 |     await page.locator('#kai-sidebar-nav button:has-text("Engineering Laboratory")').click();
  124 |     await page.waitForURL("**/engineering-laboratory");
  125 |     await expect(page.locator("main")).toContainText("Engineering Laboratory");
  126 | 
  127 |     // 2. Navigate Engineering Laboratory -> Memory Archive
  128 |     await page.locator('#kai-sidebar-nav button:has-text("Memory Archive")').click();
  129 |     await page.waitForURL("**/memory-archive");
  130 |     await expect(page.locator("main")).toContainText("Memory Archive");
  131 | 
  132 |     // 3. Navigate Memory Archive -> Document Vault
  133 |     await page.locator('#kai-sidebar-nav button:has-text("Document Vault")').click();
  134 |     await page.waitForURL("**/document-vault");
  135 |     await expect(page.locator("main")).toContainText("Document Vault");
  136 | 
  137 |     // 4. Press Back -> Should return to Memory Archive
  138 |     await page.goBack();
  139 |     await page.waitForURL("**/memory-archive");
  140 |     await expect(page.locator("main")).toContainText("Memory Archive");
  141 |     await expect(page.locator('#kai-sidebar-nav button:has-text("Memory Archive")')).toHaveAttribute("aria-current", "page");
  142 | 
  143 |     // 5. Press Back -> Should return to Engineering Laboratory
  144 |     await page.goBack();
  145 |     await page.waitForURL("**/engineering-laboratory");
  146 |     await expect(page.locator("main")).toContainText("Engineering Laboratory");
  147 |     await expect(page.locator('#kai-sidebar-nav button:has-text("Engineering Laboratory")')).toHaveAttribute("aria-current", "page");
  148 | 
  149 |     // 6. Press Forward -> Should return to Memory Archive
  150 |     await page.goForward();
  151 |     await page.waitForURL("**/memory-archive");
  152 |     await expect(page.locator("main")).toContainText("Memory Archive");
  153 |     await expect(page.locator('#kai-sidebar-nav button:has-text("Memory Archive")')).toHaveAttribute("aria-current", "page");
  154 | 
  155 |     // 7. Press Forward -> Should return to Document Vault
  156 |     await page.goForward();
  157 |     await page.waitForURL("**/document-vault");
  158 |     await expect(page.locator("main")).toContainText("Document Vault");
  159 |     await expect(page.locator('#kai-sidebar-nav button:has-text("Document Vault")')).toHaveAttribute("aria-current", "page");
  160 |   });
  161 | });
  162 | 
```