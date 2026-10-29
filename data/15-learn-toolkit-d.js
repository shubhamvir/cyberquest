// Learn, toolkit track, part 4: cryptography & authentication, virtualisation & infrastructure.
LEARN.push({
  id: "crypto-auth", track: "toolkit", m: "cry", mins: 7, c: "purple",
  title: "Cryptography & authentication tools",
  sub: "How TLS, PKI and login protocols keep data private and prove who's who.",
  blocks: [
    { t: "split", cols: [
      { title: "OPENSSL & TLS/SSL", c: "blue", blocks: [
        { t: "lead", text: "**OpenSSL** is the Swiss-army knife for certificates and encryption. **TLS** (the modern replacement for SSL) encrypts data in transit, the padlock in your browser." },
        { t: "table", title: "Everyday OpenSSL", head: ["Command", "Does"], rows: [
          ["`openssl genrsa -out key.pem 2048`", "Make a private key"],
          ["`openssl req -new -key key.pem -out csr.pem`", "Make a signing request"],
          ["`openssl x509 -in cert.pem -text -noout`", "Read a certificate"],
          ["`openssl s_client -connect host:443`", "Check a live TLS service"]] },
        { t: "callout", text: "Use TLS 1.2 or 1.3. SSL and early TLS are broken and are banned by standards like PCI DSS." },
      ]},
      { title: "PKI & CERTIFICATES", c: "green", blocks: [
        { t: "lead", text: "Public Key Infrastructure is the system of trust behind certificates: a Certificate Authority (CA) vouches that a public key really belongs to a site or person." },
        { t: "steps", title: "How a certificate is trusted", items: [
          "A server creates a key pair and a signing request",
          "A CA verifies the owner and signs the certificate",
          "The server presents the certificate on TLS connect",
          "Your device checks the CA's signature and expiry against its trust store",
          "If it all checks out, the padlock appears"],
          icons: [["key", "Keys"], ["stamp", "CA signs"], ["server", "Serve"], ["check", "Verify"], ["lock", "Trust"]] },
      ]},
    ]},
    { t: "grid", title: "AUTHENTICATION & MESSAGE PROTECTION", items: [
      { icon: "user", name: "OAuth 2.0", text: "Lets you grant one app limited access to another without sharing your password (the 'Sign in with...' buttons). It's about authorisation.", k: [["Gives out", "access tokens, scoped"]] },
      { icon: "badge", name: "OpenID Connect", text: "A thin identity layer on top of OAuth 2.0. It adds an ID token that proves who you are, so it handles authentication.", k: [["Gives out", "ID token"]] },
      { icon: "mail", name: "S/MIME", text: "Signs and encrypts email using certificates. A signature proves the sender; encryption hides the contents.", k: [["Needs", "certificates for each party"]] },
      { icon: "lock", name: "PGP / GPG", text: "Signs and encrypts files and email using a web of trust instead of central CAs. Common for sensitive files.", k: [["Needs", "exchange public keys"]] },
    ]},
    { t: "callout", text: "A quick way to keep them straight: **authentication** proves who you are (OpenID Connect, a signature), **authorisation** decides what you may do (OAuth scopes), and **encryption** keeps the contents private (TLS, S/MIME, PGP)." },
  ],
});

LEARN.push({
  id: "virtualisation", track: "toolkit", m: "cloud", mins: 6, c: "teal",
  title: "Virtualisation & infrastructure",
  sub: "How one physical machine becomes many, where storage lives, and how builds reach production.",
  blocks: [
    { t: "split", cols: [
      { title: "VIRTUAL MACHINES", c: "blue", blocks: [
        { t: "lead", text: "A **hypervisor** runs several virtual machines on one physical host, each with its own OS. It's the foundation of data centres and the cloud." },
        { t: "table", title: "Two types of hypervisor", head: ["Type", "Runs on", "Examples"], rows: [
          ["Type 1 (bare metal)", "Directly on hardware", "Hyper-V, ESXi, KVM"], ["Type 2 (hosted)", "On top of an OS", "VirtualBox, VMware Workstation"]] },
        { t: "callout", text: "**Hyper-V** is Microsoft's type 1 hypervisor. VMs vs containers: a VM carries a whole OS; a container shares the host's kernel and is much lighter." },
      ]},
      { title: "VM security basics", c: "red", blocks: [
        { t: "list", items: [
          "Patch the hypervisor host, not just the guests",
          "Tightly limit who can manage the host: it controls every VM",
          "Keep management networks separate from VM traffic",
          "Snapshot before risky changes, but don't rely on snapshots as backups",
          "Watch for VM sprawl: forgotten VMs go unpatched"] },
      ]},
    ]},
    { t: "grid", title: "STORAGE, CLOUD & DELIVERY", items: [
      { icon: "database", name: "SAN management tools", text: "A Storage Area Network pools disk and presents it to servers over a fast network. Management tools handle volumes (LUNs), zoning and replication.", k: [["Watch", "zoning, and who can mount volumes"]] },
      { icon: "cloud", name: "Cloud management APIs", text: "Cloud is run through APIs (AWS SDK, Azure, GCP). Automation and attackers both use them, so protect keys and log every call.", k: [["Watch", "leaked keys, over-broad roles"]] },
      { icon: "gear", name: "CI/CD pipeline tools", text: "Continuous Integration/Delivery tools (GitHub Actions, GitLab CI, Jenkins) build, test and deploy automatically on each change.", k: [["Watch", "pipeline secrets, who can edit it"]] },
    ]},
    { t: "note", title: "How it fits together:", text: "Developers push code, CI/CD builds and tests it, the result runs in VMs or containers on a hypervisor, and the data sits on SAN or cloud storage, all managed through APIs and Infrastructure as Code." },
  ],
});
