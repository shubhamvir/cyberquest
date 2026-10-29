// Learn, Offense & AppSec track. Kept at method/concept level and framed for defenders.
LEARN.push({
  id: "pentest-method", track: "offense", m: "vapt", mins: 7, c: "red",
  title: "Penetration testing methodology",
  sub: "How an authorised test is scoped and run, the types, and the difference from a vulnerability assessment.",
  blocks: [
    { t: "callout", text: "Rule zero: testing systems without written authorisation is illegal. Everything below assumes an agreed scope and permission." },
    { t: "flow", title: "THE PHASES (PTES-STYLE)", items: [
      ["doc", "Pre-engagement", "scope, rules, authorisation"],
      ["search", "Recon", "gather information"],
      ["radar", "Scanning", "map hosts & services"],
      ["key", "Gaining access", "prove the weakness"],
      ["eye", "Post-exploitation", "assess impact"],
      ["flag", "Reporting", "findings & fixes"],
    ]},
    { t: "split", cols: [
      { title: "VA vs PENTEST", c: "blue", blocks: [
        { t: "table", head: ["", "Vulnerability assessment", "Penetration test"], rows: [
          ["Goal", "Find & rate weaknesses", "Prove exploitability & impact"],
          ["Breadth", "Wide", "Focused"],
          ["Output", "Prioritised list", "Attack narrative + fixes"]] },
        { t: "callout", text: "A scanner finds the open window; a pentest climbs through it to show what an attacker could actually reach." },
      ]},
      { title: "KNOWLEDGE LEVELS", c: "amber", blocks: [
        { t: "table", head: ["Type", "Tester knows"], rows: [
          ["Black box", "Little or nothing (outsider)"],
          ["Grey box", "Some info (e.g. a user login)"],
          ["White box", "Full info, source, diagrams"]] },
        { t: "note", title: "Red / blue / purple", text: "Red team attacks, blue team defends, purple team runs them together so defences actually improve." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "WHAT GOES IN THE SCOPE", c: "green", blocks: [
        { t: "list", items: [
          "In-scope targets and explicitly excluded systems",
          "Testing windows and any no-go times",
          "Allowed techniques (e.g. no DoS, no social engineering)",
          "Emergency contacts and a stop condition",
          "Written authorisation from someone who can give it"] },
      ]},
      { title: "A GOOD REPORT", c: "teal", blocks: [
        { t: "list", items: [
          "Executive summary in business-risk terms",
          "Each finding: risk rating, evidence, and a clear fix",
          "Prioritised remediation, not just a dump of issues",
          "Retest to confirm fixes worked"] },
        { t: "callout", text: "The report is the product. A finding nobody can act on has no value." },
      ]},
    ]},
    { t: "note", title: "Where it's required:", text: "PCI DSS requires external and internal pentests at least annually and after significant changes. DORA requires threat-led penetration testing (TLPT) for designated financial entities." },
  ],
});

LEARN.push({
  id: "owasp", track: "offense", m: "web", mins: 8, c: "amber",
  title: "OWASP Top 10 & web security",
  sub: "The ten most common web app risks and how to defend against each one.",
  blocks: [
    { t: "lead", text: "The **OWASP Top 10** is the industry's list of the most critical web application security risks. Knowing it, and the fix for each, is expected of anyone touching web security." },
    { t: "table", title: "OWASP TOP 10 (2021)", head: ["#", "Risk", "The fix in one line"], rows: [
      ["A01", "Broken Access Control", "Check authorisation server-side for every object (stops IDOR)"],
      ["A02", "Cryptographic Failures", "Encrypt data in transit and at rest; no weak algorithms"],
      ["A03", "Injection (SQLi, etc.)", "Parameterised queries; validate and encode input"],
      ["A04", "Insecure Design", "Threat model early; secure design patterns"],
      ["A05", "Security Misconfiguration", "Harden, remove defaults, patch, least privilege"],
      ["A06", "Vulnerable Components", "Track dependencies (SCA) and patch them"],
      ["A07", "ID & Auth Failures", "MFA, strong session handling, no weak passwords"],
      ["A08", "Software & Data Integrity", "Verify updates and CI/CD artefacts (signing, SLSA)"],
      ["A09", "Logging & Monitoring Failures", "Log security events and alert on them"],
      ["A10", "SSRF", "Validate and restrict outbound requests from the server"]] },
    { t: "split", cols: [
      { title: "COMMON ATTACKS, PLAIN", c: "red", blocks: [
        { t: "list", items: [
          "**SQL injection**: untrusted input changes a database query",
          "**XSS**: attacker's script runs in another user's browser",
          "**IDOR**: changing an ID to see someone else's data",
          "**CSRF**: your browser is tricked into a logged-in action",
          "**SSRF**: the server is tricked into fetching attacker URLs"] },
      ]},
      { title: "DEFENCES THAT COVER MANY", c: "green", blocks: [
        { t: "list", items: [
          "Parameterised queries (injection)",
          "Context-aware output encoding + CSP (XSS)",
          "Server-side authorisation checks (access control)",
          "Anti-CSRF tokens + SameSite cookies",
          "Input validation as defence in depth"] },
        { t: "callout", text: "Validation helps, but the real fixes are structural: parameterised queries and server-side authorisation, not blocklists." },
      ]},
    ]},
    { t: "note", title: "Practise safely:", text: "OWASP Juice Shop and PortSwigger's Web Security Academy are deliberately vulnerable apps made for learning. Say so in interviews: it's honest and shows initiative." },
  ],
});

LEARN.push({
  id: "devsecops", track: "offense", m: "devsecops", mins: 7, c: "teal",
  title: "DevSecOps & the secure SDLC",
  sub: "Shifting security left into the pipeline: SAST, DAST, SCA, secrets scanning and threat modelling.",
  blocks: [
    { t: "lead", text: "**DevSecOps** builds security into development instead of bolting it on at the end. 'Shift left' means catching issues early, where they're cheapest to fix." },
    { t: "flow", title: "SECURITY IN THE PIPELINE", items: [
      ["code", "Code", "secrets scan, SAST in IDE"],
      ["git", "Commit / PR", "SAST, SCA, review"],
      ["box", "Build", "scan container image"],
      ["play", "Test", "DAST on staging"],
      ["cloud", "Deploy", "IaC scan, least-privilege"],
      ["eye", "Run", "monitor, log, alert"],
    ]},
    { t: "table", title: "THE TESTING TYPES", head: ["Type", "Looks at", "When"], rows: [
      ["SAST", "Source code (not running)", "Early, in IDE/CI"],
      ["DAST", "Running app from outside", "On a test build"],
      ["IAST", "Instrumented app during tests", "In testing"],
      ["SCA", "Third-party dependencies & CVEs", "Every build"],
      ["Secret scanning", "Keys & tokens in code", "Pre-commit & CI"]] },
    { t: "split", cols: [
      { title: "STRIDE THREAT MODELLING", c: "purple", blocks: [
        { t: "table", head: ["Letter", "Threat"], rows: [
          ["S", "Spoofing (identity)"], ["T", "Tampering"], ["R", "Repudiation"], ["I", "Information disclosure"], ["D", "Denial of service"], ["E", "Elevation of privilege"]] },
        { t: "callout", text: "Threat model at design time: find the threats before any code is written, when fixes are nearly free." },
      ]},
      { title: "PIPELINE & SUPPLY CHAIN", c: "blue", blocks: [
        { t: "list", items: [
          "Keep secrets in a secrets manager, injected at runtime",
          "Sign artefacts and images (Sigstore cosign); verify on deploy",
          "SBOM (SPDX, CycloneDX) lists what's in a build",
          "SLSA addresses build integrity and provenance",
          "Containers: minimal base image, run as non-root"] },
      ]},
    ]},
    { t: "note", title: "Compliance as code:", text: "Policy and controls written as code (OPA/Rego, Checkov, OSCAL) let you check compliance continuously and produce evidence on every change, instead of once a year by hand." },
  ],
});

LEARN.push({
  id: "vuln-mgmt", track: "offense", m: "vuln", mins: 7, c: "blue",
  title: "Vulnerability management & CVSS",
  sub: "The lifecycle, how CVSS scoring works, and how to prioritise what to patch first.",
  blocks: [
    { t: "flow", title: "THE LIFECYCLE", items: [
      ["search", "Discover", "scan & inventory"],
      ["scale", "Assess", "score & rate"],
      ["flag", "Prioritise", "what matters most"],
      ["wrench", "Remediate", "patch or mitigate"],
      ["check", "Verify", "rescan to confirm"],
      ["refresh", "Report", "track & repeat"],
    ]},
    { t: "split", cols: [
      { title: "THE ACRONYMS", c: "blue", blocks: [
        { t: "table", head: ["Term", "Is"], rows: [
          ["CVE", "A unique ID for one known vuln"],
          ["CVSS", "A 0-10 severity score"],
          ["CWE", "A class of weakness (e.g. CWE-79 XSS)"],
          ["EPSS", "Probability it'll be exploited soon"],
          ["KEV", "CISA's list of vulns exploited in the wild"]] },
        { t: "note", title: "Who runs what", text: "MITRE runs the CVE programme; NIST runs the NVD that enriches CVEs with CVSS scores." },
      ]},
      { title: "CVSS SEVERITY BANDS", c: "amber", blocks: [
        { t: "table", head: ["Score", "Rating"], rows: [
          ["9.0-10.0", "Critical"], ["7.0-8.9", "High"], ["4.0-6.9", "Medium"], ["0.1-3.9", "Low"], ["0.0", "None"]] },
        { t: "callout", text: "CVSS measures severity, not urgency. A 9.8 on an isolated internal box may matter less than a 7.5 on an internet-facing one." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "WHAT TO PATCH FIRST", c: "red", blocks: [
        { t: "list", items: [
          "Internet-facing and in the **CISA KEV** list",
          "High **EPSS** (likely to be exploited)",
          "On critical or sensitive systems",
          "Where no compensating control exists"] },
        { t: "callout", text: "Prioritise by real-world risk: exposure + active exploitation + business value, not CVSS alone." },
      ]},
      { title: "WHEN YOU CAN'T PATCH", c: "green", blocks: [
        { t: "list", items: [
          "Raise a formal exception with an owner and expiry",
          "Add compensating controls (segmentation, WAF, monitoring)",
          "Track it; don't let it quietly become permanent",
          "Authenticated scans find far more than unauthenticated ones"] },
        { t: "note", title: "Verify", text: "Always rescan after patching: 'deployed' isn't 'fixed' until a scan confirms it." },
      ]},
    ]},
  ],
});
