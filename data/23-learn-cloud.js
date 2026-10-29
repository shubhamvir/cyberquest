// Learn, Cloud & identity track.
LEARN.push({
  id: "cloud-sec", track: "cloudid", m: "cloud", mins: 8, c: "blue",
  title: "Cloud security fundamentals",
  sub: "Shared responsibility, the service models, the AWS services to know, and why misconfiguration is the top risk.",
  blocks: [
    { t: "lead", text: "The cloud isn't 'someone else's computer' you can ignore. Security is **shared**: the provider secures the cloud, you secure what you put in it." },
    { t: "flow", title: "SHARED RESPONSIBILITY (WHO SECURES WHAT)", items: [
      ["cloud", "Provider", "hardware, hypervisor, physical"],
      ["arrow", "Shifts with model", "IaaS -> PaaS -> SaaS"],
      ["user", "You", "data, identities, config, access"],
    ]},
    { t: "split", cols: [
      { title: "SERVICE MODELS", c: "green", blocks: [
        { t: "table", head: ["Model", "You manage", "Example"], rows: [
          ["IaaS", "OS, apps, data", "EC2, VMs"],
          ["PaaS", "Apps & data only", "App Service, RDS"],
          ["SaaS", "Just your data & access", "Microsoft 365"]] },
        { t: "callout", text: "The more the provider manages, the less you do, but you always own your data, identities and access settings." },
      ]},
      { title: "TOP RISK: MISCONFIGURATION", c: "red", blocks: [
        { t: "list", items: [
          "Public storage buckets (S3 Block Public Access)",
          "Over-broad IAM permissions",
          "Leaked access keys in code",
          "Open security groups (0.0.0.0/0)",
          "No logging or monitoring turned on"] },
        { t: "note", title: "Not usually the provider", text: "Most cloud breaches come from customer mistakes, not the provider being hacked." },
      ]},
    ]},
    { t: "grid", title: "AWS SECURITY SERVICES TO KNOW", items: [
      { icon: "list", name: "CloudTrail", text: "Records every API call in the account. Your main audit log in the cloud." },
      { icon: "gear", name: "Config", text: "Records configuration over time and checks it against rules." },
      { icon: "radar", name: "GuardDuty", text: "Threat detection from CloudTrail, VPC flow and DNS logs." },
      { icon: "shield", name: "Security Hub", text: "Aggregates findings and benchmarks accounts against standards." },
      { icon: "eye", name: "Macie", text: "Finds sensitive data (PII) in S3." },
      { icon: "key", name: "KMS", text: "Managed keys for encryption; envelope encryption of data." },
    ]},
    { t: "note", title: "Good habits:", text: "Protect the root account (MFA, no keys), use IAM roles and temporary credentials instead of long-lived keys, enforce MFA, turn on logging everywhere, and encrypt by default. IMDSv2 protects EC2 instance credentials from SSRF." },
  ],
});

LEARN.push({
  id: "iam", track: "cloudid", m: "iam", mins: 8, c: "purple",
  title: "Identity & access management",
  sub: "Authentication vs authorisation, MFA, SSO, the login protocols, and privileged access.",
  blocks: [
    { t: "split", cols: [
      { title: "THE CORE DISTINCTION", c: "blue", blocks: [
        { t: "table", head: ["", "Answers"], rows: [
          ["Authentication", "Are you who you say? (prove it)"],
          ["Authorisation", "What are you allowed to do?"],
          ["Accounting", "What did you do? (audit)"]] },
        { t: "note", title: "The three factors", text: "Know (password), have (phone, FIDO2 key), are (biometric). MFA combines two different factors." },
      ]},
      { title: "MFA, STRONGEST FIRST", c: "green", blocks: [
        { t: "list", items: [
          "**FIDO2 / passkeys**: phishing-resistant, best",
          "Authenticator app with number matching",
          "Push approval (watch for MFA fatigue spam)",
          "SMS codes: better than nothing, SIM-swappable"] },
        { t: "callout", text: "Phishing-resistant MFA (FIDO2) stops the stolen-session attacks that defeat codes and push prompts." },
      ]},
    ]},
    { t: "table", title: "THE LOGIN PROTOCOLS", head: ["Protocol", "For", "Gives out"], rows: [
      ["SAML 2.0", "Enterprise SSO to web apps", "Signed XML assertions"],
      ["OAuth 2.0", "Delegated authorisation", "Access tokens (scoped)"],
      ["OpenID Connect", "Authentication on top of OAuth", "ID token"],
      ["Kerberos", "Windows/AD authentication", "Tickets (TGT, then service tickets)"],
      ["LDAP", "Querying a directory", "Directory entries"]] },
    { t: "split", cols: [
      { title: "ACCESS MODELS & LIFECYCLE", c: "amber", blocks: [
        { t: "list", items: [
          "**RBAC**: access by role/job function (most common)",
          "**ABAC**: access by attributes (user, device, context)",
          "**JML**: Joiner-Mover-Leaver, the account lifecycle",
          "**Access reviews** catch privilege creep",
          "Disable leaver accounts promptly (a classic audit finding)"] },
      ]},
      { title: "PRIVILEGED ACCESS (PAM)", c: "red", blocks: [
        { t: "list", items: [
          "Vault, rotate and record privileged sessions",
          "**JIT** access: granted when needed, then removed",
          "Break-glass accounts: tightly controlled, monitored",
          "Service accounts: least privilege, no interactive logon"] },
        { t: "callout", text: "Modern password guidance (NIST 800-63B): length over complexity, check against breached lists, no forced periodic changes." },
      ]},
    ]},
  ],
});

LEARN.push({
  id: "zero-trust", track: "cloudid", m: "zt", mins: 7, c: "teal",
  title: "Zero trust & emerging tech",
  sub: "Never trust, always verify, plus the AI, quantum and regulatory shifts changing security now.",
  blocks: [
    { t: "lead", text: "**Zero trust** drops the idea of a trusted internal network. Every request is verified by identity, device health and context, wherever it comes from. The motto: *never trust, always verify.*" },
    { t: "split", cols: [
      { title: "THE PRINCIPLES", c: "blue", blocks: [
        { t: "list", items: [
          "No implicit trust from network location",
          "Verify explicitly: identity, device, context, every time",
          "Least privilege and just-in-time access",
          "**Assume breach**: segment and monitor so it can't spread",
          "Continuous verification, not one check at login"] },
        { t: "callout", text: "Micro-segmentation, strong identity and continuous monitoring together limit lateral movement after any single foothold." },
      ]},
      { title: "BUILDING BLOCKS", c: "green", blocks: [
        { t: "table", head: ["Term", "Is"], rows: [
          ["ZTNA", "Per-app access after verification (vs a flat VPN)"],
          ["SASE", "Cloud-delivered networking + security"],
          ["PEP / PE", "Policy enforcement point / engine (NIST 800-207)"],
          ["CASB", "Controls use of cloud/SaaS apps"]] },
      ]},
    ]},
    { t: "grid", title: "EMERGING RISKS & RULES", items: [
      { icon: "cpu", name: "AI / LLM security", text: "OWASP Top 10 for LLMs: prompt injection (direct & indirect), data poisoning, excessive agency. Don't paste secrets into public chatbots." },
      { icon: "eye", name: "Deepfakes", text: "AI-made fake audio/video used to impersonate executives for fraud. Verify requests on a known channel." },
      { icon: "key", name: "Post-quantum", text: "Quantum computers would threaten RSA/ECC. NIST has standardised PQC (ML-KEM, ML-DSA); aim for crypto-agility." },
      { icon: "shield", name: "Shadow AI", text: "Staff using unapproved AI tools with company data. Needs policy and approved alternatives." },
      { icon: "scale", name: "EU AI Act", text: "Risk-based rules for AI systems (unacceptable, high, limited, minimal)." },
      { icon: "badge", name: "ISO/IEC 42001", text: "The management-system standard for governing AI, the 'ISO 27001 for AI'." },
    ]},
  ],
});
