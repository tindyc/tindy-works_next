import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Layout } from '@/components/Layout';

const projects = [
  { id: '101', title: 'Private Hire & Airport Transfer Platform', tag: 'Web Application / Booking System' },
  { id: '102', title: 'LMS + CRM Data Integration', tag: 'Automation / APIs' },
  { id: '103', title: 'Legacy System Migration', tag: 'Infrastructure' },
  { id: '104', title: 'eCommerce Automation', tag: 'Business Systems' },
];

export default function OfficePage() {
  return (
    <Layout>
      <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col bg-[var(--bg-base)] backdrop-blur-sm min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
        {/* SEC_01: Hero Section */}
        <header className="p-8 md:p-16 border-b border-[var(--border-subtle)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" className="stroke-[var(--border-subtle)]">
              <line x1="0" y1="100%" x2="100%" y2="0" strokeWidth="1" />
              <line x1="0" y1="0" x2="100%" y2="100%" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10 pb-8">
            <div>
              <h1 className="font-display text-5xl sm:text-7xl md:text-[10rem] leading-none font-bold tracking-tighter uppercase text-[var(--text-primary)] drop-shadow-md">OFFICE</h1>
            </div>
            <div className="w-full lg:w-1/3 border border-[var(--border-subtle)] p-6 bg-[var(--bg-base)] tech-panel">
              <p className="font-mono text-xs leading-relaxed text-[var(--text-secondary)] uppercase tracking-widest">
                I design and improve systems that work in real environments, balancing technical performance, business value, and long-term maintainability.
              </p>
              <p className="font-mono text-xs leading-relaxed text-[var(--text-secondary)] uppercase tracking-widest mt-3">
                Focused on SaaS platforms, automation, and using AI to streamline workflows, reduce manual effort, and improve how systems operate.
              </p>
              <p className="font-mono text-xs leading-relaxed text-[var(--text-secondary)] uppercase tracking-widest mt-3">
                I take ownership of the work I&apos;m involved in, stay curious, and adapt quickly when things change. Always open to learning and improving how things are done.
              </p>
            </div>
          </div>
        </header>

        {/* SEC_02: Metrics Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--border-subtle)] font-mono bg-[var(--bg-base)]">
          <div className="p-6 md:p-8 border-b lg:border-b-0 border-r border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2">M.01 Certification</div>
            <div className="text-sm uppercase tracking-wider text-[var(--text-primary)]">PRINCE2 Practitioner</div>
          </div>
          <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2">M.02 Discipline</div>
            <div className="text-sm uppercase tracking-wider text-[var(--text-primary)]">PM + Software Engineer</div>
          </div>
          <div className="p-6 md:p-8 border-r border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2">M.03 Scale</div>
            <div className="text-sm uppercase tracking-wider text-[var(--text-primary)]">SaaS & Enterprise Systems</div>
          </div>
          <div className="p-6 md:p-8">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2">M.04 Focus</div>
            <div className="text-sm uppercase tracking-wider text-[var(--text-primary)]">Automation & Integration</div>
          </div>
        </section>

        {/* SEC_03: Selected Systems */}
        <section className="p-8 md:p-16 border-b border-[var(--border-subtle)] grid grid-cols-1 lg:grid-cols-12 gap-12 relative bg-[var(--bg-base)]">
          <div className="lg:col-span-4">
            <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest sticky top-32">Selected Systems</h2>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-16">

            <div className="group relative pl-8 border-l border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors">
              <div className="absolute top-0 -left-1 w-2 h-2 bg-[var(--bg-base)] border border-[var(--text-primary)] group-hover:bg-[var(--hover-bg)] transition-colors"></div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-6 gap-2">
                <h3 className="font-display text-3xl md:text-4xl uppercase tracking-wider">Enterprise SaaS Stability</h3>
                <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest bg-[var(--border-subtle)] py-1 px-3 border border-[var(--border-subtle)]">C / LINUX</span>
              </div>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-2xl mb-6">
                Worked inside a legacy Linux and C-based system. Resolved runtime issues, tracked down memory leaks, and improved stability after environment upgrades. Reduced recurring production failures.
              </p>
              <div className="flex gap-2 font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">BACKEND SYSTEMS</span>
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">DEBUGGING</span>
              </div>
            </div>

            <div className="group relative pl-8 border-l border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors">
              <div className="absolute top-0 -left-1 w-2 h-2 bg-[var(--bg-base)] border border-[var(--text-primary)] group-hover:bg-[var(--hover-bg)] transition-colors"></div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-6 gap-2">
                <h3 className="font-display text-3xl md:text-4xl uppercase tracking-wider">Data Integration & Automation</h3>
                <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest bg-[var(--border-subtle)] py-1 px-3 border border-[var(--border-subtle)]">APIS / PYTHON</span>
              </div>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-2xl mb-6">
                Built a centralised pipeline connecting LMS, CRM, and GitHub APIs. Cut down on manual admin work and gave the team better visibility into user activity and performance.
              </p>
              <div className="flex gap-2 font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">INTEGRATION</span>
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">AUTOMATION</span>
              </div>
            </div>

            <div className="group relative pl-8 border-l border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors">
              <div className="absolute top-0 -left-1 w-2 h-2 bg-[var(--bg-base)] border border-[var(--text-primary)] group-hover:bg-[var(--hover-bg)] transition-colors"></div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-6 gap-2">
                <h3 className="font-display text-3xl md:text-4xl uppercase tracking-wider">eCommerce & Business Systems</h3>
                <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest bg-[var(--border-subtle)] py-1 px-3 border border-[var(--border-subtle)]">SHOPIFY / WP</span>
              </div>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-2xl mb-6">
                Built and maintained Shopify and WordPress stores. Introduced automation to reduce repetitive tasks and make day-to-day operations easier to manage.
              </p>
              <div className="flex gap-2 font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">ECOMMERCE</span>
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">BUSINESS SYSTEMS</span>
              </div>
            </div>

            <div className="group relative pl-8 border-l border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors">
              <div className="absolute top-0 -left-1 w-2 h-2 bg-[var(--bg-base)] border border-[var(--text-primary)] group-hover:bg-[var(--hover-bg)] transition-colors"></div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-6 gap-2">
                <h3 className="font-display text-3xl md:text-4xl uppercase tracking-wider">Technical Programme Delivery</h3>
                <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest bg-[var(--border-subtle)] py-1 px-3 border border-[var(--border-subtle)]">FULL STACK</span>
              </div>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-2xl mb-6">
                Helped deliver full-stack learning programmes. Supported learners, fixed issues as they came up, and improved onboarding and documentation along the way.
              </p>
              <div className="flex gap-2 font-mono text-[10px] text-[var(--text-secondary)] uppercase">
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">PROGRAMME DELIVERY</span>
                <span className="border border-[var(--border-subtle)] px-3 py-1 bg-[var(--bg-base)]">EDUCATION</span>
              </div>
            </div>

          </div>
        </section>

        {/* SEC_04: Capabilities & Tech Stack */}
        <section className="p-8 md:p-16 border-b border-[var(--border-subtle)] grid grid-cols-1 lg:grid-cols-2 gap-16 relative bg-[var(--bg-base)]">
          <div className="flex flex-col gap-8">
            <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-4">Capabilities</h2>

            <div className="border border-[var(--border-subtle)] p-8 relative group hover:bg-[var(--hover-bg)] transition-colors">
              <div className="absolute top-6 right-6 font-mono text-[10px] text-[var(--text-secondary)] uppercase">SYS.DEL</div>
              <h3 className="font-display text-2xl uppercase tracking-wider mb-4">Delivery Under Constraint</h3>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-md">Comfortable working in fast-moving or unclear environments. Focused on getting things done while keeping quality and priorities in check.</p>
            </div>

            <div className="border border-[var(--border-subtle)] p-8 relative group hover:bg-[var(--hover-bg)] transition-colors">
              <div className="absolute top-6 right-6 font-mono text-[10px] text-[var(--text-secondary)] uppercase">SYS.INT</div>
              <h3 className="font-display text-2xl uppercase tracking-wider mb-4">Systems & Integration</h3>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-md">Connecting tools and data in a way that reduces manual work and makes systems easier to use. Using automation and AI-driven workflows where it makes sense to cut repetitive tasks and improve efficiency.</p>
            </div>

            <div className="border border-[var(--border-subtle)] p-8 relative group hover:bg-[var(--hover-bg)] transition-colors">
              <div className="absolute top-6 right-6 font-mono text-[10px] text-[var(--text-secondary)] uppercase">SYS.DBG</div>
              <h3 className="font-display text-2xl uppercase tracking-wider mb-4">Debugging & Problem Solving</h3>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-md">Patient and methodical when things break. Focused on understanding root causes rather than quick fixes, and comfortable working in unfamiliar codebases.</p>
            </div>

            <div className="border border-[var(--border-subtle)] p-8 relative group hover:bg-[var(--hover-bg)] transition-colors">
              <div className="absolute top-6 right-6 font-mono text-[10px] text-[var(--text-secondary)] uppercase">SYS.ALN</div>
              <h3 className="font-display text-2xl uppercase tracking-wider mb-4">Business & Technical Alignment</h3>
              <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-md">Bridging the gap between technical teams and stakeholders so decisions are clear and practical. Used to working across different teams with different levels of technical understanding.</p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-4 lg:pl-16">Tech Stack</h2>

            <div className="flex flex-col gap-12 lg:pl-16">
              {[
                { label: 'Frontend', stack: 'React, TypeScript, JavaScript, HTML, CSS, Tailwind' },
                { label: 'Backend', stack: 'Node.js, Python, SQL, REST APIs' },
                { label: 'Systems', stack: 'C, Bash, Linux (RHEL), Windows' },
                { label: 'Debugging', stack: 'gdb, valgrind, strace' },
                { label: 'Platforms', stack: 'Shopify, WooCommerce, WordPress' },
                { label: 'Cloud', stack: 'AWS, Docker, Vercel' },
                { label: 'Tools', stack: 'Git, GitHub Actions, Jira, Confluence, Figma' },
                { label: 'Automation', stack: 'Google Apps Script, API Integration' },
              ].map(({ label, stack }) => (
                <div key={label} className="flex gap-6 items-start">
                  <div className="w-12 h-px bg-[var(--border-strong)] mt-3 md:block hidden relative crosshair"></div>
                  <div>
                    <h3 className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-2 border-b border-[var(--border-subtle)] pb-2 inline-block">{label}</h3>
                    <p className="font-display text-2xl md:text-3xl uppercase tracking-wider text-[var(--text-primary)] mt-4">{stack}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEC_05: Project Showcase */}
        <section className="p-8 md:p-16 bg-[var(--bg-base)]">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest">Project Showcase</h2>
            <div className="ui-surface rounded-xl px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest">Vol. 1</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <Link key={project.id} href={`/project/${project.id}`} className="group border border-[var(--border-subtle)] flex flex-col hover:bg-[var(--hover-bg)] transition-colors p-8 tech-panel relative min-h-[300px] shadow-[0_10px_30px_var(--shadow-base)]">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-primary)]">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase mb-6 drop-shadow-md">PRJ-{project.id}</span>
                <h3 className="font-display text-3xl tracking-wider uppercase mb-8 pr-8 leading-tight drop-shadow-md">{project.title}</h3>
                <div className="mt-auto">
                  <span className="inline-block py-1 px-3 border border-[var(--border-subtle)] bg-[var(--bg-base)] font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                    {project.tag}
                  </span>
                  <div className="mt-8 font-mono text-[10px] tracking-widest uppercase border-b border-[var(--text-primary)] pb-1 inline-block text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    View Specs
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEC_06: Open to Projects */}
        <section className="p-8 md:p-16 border-t border-[var(--border-subtle)] grid grid-cols-1 lg:grid-cols-12 gap-12 relative bg-[var(--bg-base)]">
          <div className="lg:col-span-4">
            <h2 className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest sticky top-32">Open to Projects</h2>
          </div>
          <div className="lg:col-span-8">
            <p className="text-[var(--text-secondary)] font-sans text-sm leading-relaxed max-w-2xl mb-8">
              I enjoy building clean, practical websites and systems for small businesses and personal projects. I also like helping people automate parts of their work to save time and reduce manual effort. If you have something in mind, feel free to reach out.
            </p>
            <a href="#" className="ui-button font-mono text-xs uppercase tracking-widest">
              Start a Project
            </a>
          </div>
        </section>

        <footer className="border-t border-[var(--border-subtle)] p-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[10px] uppercase text-[var(--text-secondary)] tracking-widest bg-[var(--bg-base)]">
          <div>©2024_Tindy_Works</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Legal</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Archive</a>
          </div>
        </footer>
      </main>
    </Layout>
  );
}
