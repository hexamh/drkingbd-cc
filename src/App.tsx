import { FC } from 'react';

// --- Types & Interfaces ---
interface SkillCategory {
  category: string;
  skills: string[];
}

interface Project {
  id: string;
  title: string;
  scenario: string;
  techStack: string[];
  metrics: string[];
  repoUrl?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  id: string;
}

// --- Data Models (Populated with Deep Research Best-Practices) ---
const SKILLS: SkillCategory[] = [
  {
    category: 'SIEM & Log Analysis',
    skills: ['Splunk Enterprise', 'Microsoft Sentinel', 'ELK Stack', 'KQL', 'SPL'],
  },
  {
    category: 'Network Security & Traffic Analysis',
    skills: ['Wireshark', 'Zeek', 'Suricata', 'pfsense', 'TCP/IP Deep Dive'],
  },
  {
    category: 'Endpoint Detection & Response (EDR)',
    skills: ['CrowdStrike Falcon', 'Microsoft Defender for Endpoint', 'Wazuh'],
  },
  {
    category: 'Scripting & Automation',
    skills: ['Python', 'Bash', 'PowerShell', 'Cloudflare Workers (Edge Auth)'],
  },
];

const PROJECTS: Project[] = [
  {
    id: 'crypto-001',
    title: 'Enterprise SOC Home Lab Setup',
    scenario: 'Architected a mock enterprise network utilizing Proxmox. Deployed an Active Directory domain, simulated APT-level attacks (Pass-the-Hash, Kerberoasting), and ingested logs into Splunk via Universal Forwarders.',
    techStack: ['Proxmox', 'Windows Server 2022', 'Splunk', 'Sysmon', 'Atomic Red Team'],
    metrics: [
      'Ingested 500MB+ of daily telemetry',
      'Configured 15 custom alerting rules mapped to MITRE ATT&CK',
      'Reduced false-positive alert fatigue by 40% through query tuning',
    ],
  },
  {
    id: 'crypto-002',
    title: 'Automated Threat Intelligence Feed Pipeline',
    scenario: 'Built a serverless pipeline using Cloudflare Workers to fetch, normalize, and distribute IOCs (Indicators of Compromise) from AlienVault OTX to a local firewall blocklist.',
    techStack: ['TypeScript', 'Cloudflare Workers', 'REST APIs', 'STIX/TAXII'],
    metrics: [
      'Zero-maintenance serverless execution (<10ms edge latency)',
      'Aggregates 10,000+ malicious IPs daily',
    ],
  },
  {
    id: 'crypto-003',
    title: 'Incident Response: Ransomware Containment Simulation',
    scenario: 'Performed dynamic and static malware analysis on a detonated WannaCry sample within a sandboxed environment. Drafted a complete IR playbook and executive summary.',
    techStack: ['REMnux', 'Ghidra', 'Process Hacker', 'YARA'],
    metrics: [
      'Extracted C2 server IP and kill-switch domain',
      'Wrote custom YARA rules for future endpoint detection',
    ],
  },
];

const CERTS: Certification[] = [
  { name: 'CompTIA Security+', issuer: 'CompTIA', date: '2025', id: 'COMP-SEC-1234' },
  { name: 'Cybersecurity Analyst (CySA+)', issuer: 'CompTIA', date: 'In Progress', id: 'PENDING' },
  { name: 'Splunk Core Certified Power User', issuer: 'Splunk', date: '2024', id: 'SPLK-9988' },
];

// --- Components ---

const Header: FC = () => (
  <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-emerald-500 font-mono font-bold text-xl tracking-tighter">
        root@analyst:~#
      </div>
      <nav className="space-x-6 text-sm font-mono text-slate-400">
        <a href="#about" className="hover:text-emerald-400 transition-colors">./about</a>
        <a href="#skills" className="hover:text-emerald-400 transition-colors">./skills</a>
        <a href="#projects" className="hover:text-emerald-400 transition-colors">./projects</a>
      </nav>
    </div>
  </header>
);

const Hero: FC = () => (
  <section id="about" className="py-24 px-6 max-w-5xl mx-auto">
    <h1 className="text-5xl font-extrabold text-slate-100 tracking-tight mb-4">
      Cybersecurity <span className="text-emerald-500">Analyst</span>
    </h1>
    <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
      Dedicated to identifying, neutralizing, and documenting advanced persistent threats. 
      Specialized in SIEM engineering, network traffic analysis, and edge-security architecture. 
      Translating raw telemetry into actionable threat intelligence.
    </p>
    <div className="flex space-x-4">
      <a href="mailto:your@email.com" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-6 py-3 rounded-md transition-colors">
        Initiate Handshake
      </a>
      <a href="https://github.com/yourusername" target="_blank" rel="noreferrer" className="border border-slate-700 hover:border-slate-500 text-slate-300 px-6 py-3 rounded-md transition-colors">
        GitHub Repos
      </a>
    </div>
  </section>
);

const SkillsGrid: FC = () => (
  <section id="skills" className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800/50">
    <h2 className="text-2xl font-bold text-slate-100 mb-8 font-mono">
      <span className="text-emerald-500">01.</span> Technical Toolkit
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {SKILLS.map((skillGroup) => (
        <div key={skillGroup.category} className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
          <h3 className="text-slate-200 font-semibold mb-4">{skillGroup.category}</h3>
          <div className="flex flex-wrap gap-2">
            {skillGroup.skills.map((skill) => (
              <span key={skill} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full font-mono">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const ProjectShowcase: FC = () => (
  <section id="projects" className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800/50">
    <h2 className="text-2xl font-bold text-slate-100 mb-8 font-mono">
      <span className="text-emerald-500">02.</span> Threat Labs & Operations
    </h2>
    <div className="space-y-8">
      {PROJECTS.map((project) => (
        <div key={project.id} className="group relative bg-slate-900/40 border border-slate-800 p-8 rounded-lg hover:border-emerald-500/50 transition-colors">
          <h3 className="text-xl font-bold text-slate-100 mb-3">{project.title}</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">{project.scenario}</p>
          
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operational Metrics</h4>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              {project.metrics.map((metric, i) => (
                <li key={i}>{metric}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {project.techStack.map((tech) => (
              <span key={tech} className="text-emerald-400/80 text-xs font-mono">
                #{tech.toLowerCase().replace(' ', '-')}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Certifications: FC = () => (
  <section id="certs" className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-800/50">
    <h2 className="text-2xl font-bold text-slate-100 mb-8 font-mono">
      <span className="text-emerald-500">03.</span> Certifications
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CERTS.map((cert) => (
        <div key={cert.name} className="bg-slate-900/50 border border-slate-800 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-slate-200 font-bold mb-1">{cert.name}</h3>
            <p className="text-slate-500 text-sm">{cert.issuer}</p>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-xs text-slate-600 font-mono">ID: {cert.id}</span>
            <span className="text-emerald-500 text-sm font-semibold">{cert.date}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Footer: FC = () => (
  <footer className="border-t border-slate-800 py-8 text-center text-slate-500 font-mono text-sm">
    <p>System status: <span className="text-emerald-500">Secure</span> | {new Date().getFullYear()}</p>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header />
      <main>
        <Hero />
        <SkillsGrid />
        <ProjectShowcase />
        <Certifications />
      </main>
      <Footer />
    </div>
  );
}
