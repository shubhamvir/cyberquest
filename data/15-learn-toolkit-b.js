// Learn, toolkit track, part 2: networking, DevOps & cloud, scripting & databases.
LEARN.push({
  id: "networking-tools", track: "toolkit", m: "netf", mins: 6, c: "navy",
  title: "Networking tools",
  sub: "Configure the network with Cisco IOS, then see and measure it with Wireshark, Nmap and Netcat.",
  blocks: [
    { t: "split", cols: [
      { title: "CISCO IOS", c: "blue", blocks: [
        { t: "lead", text: "The operating system on Cisco routers and switches. You configure it from a command line, one mode at a time." },
        { t: "steps", title: "Moving between modes", items: [
          "`Router>` user EXEC: look, don't change",
          "`enable` takes you to `Router#` privileged EXEC",
          "`configure terminal` opens global config",
          "`interface g0/0` opens interface config",
          "`end`, then save with `copy running-config startup-config`"],
          icons: [["eye", "View"], ["key", "Enable"], ["gear", "Config"], ["link", "Interface"], ["download", "Save"]] },
        { t: "table", title: "Security basics", head: ["Command", "Why"], rows: [
          ["`enable secret <pw>`", "Hashed privileged password"],
          ["`ip ssh version 2` + `transport input ssh`", "SSH only, no Telnet"],
          ["`service password-encryption`", "Hide passwords in the config"],
          ["`show running-config`", "Check what's actually set"]] },
      ]},
      { title: "CISCO SDM", c: "teal", blocks: [
        { t: "lead", text: "**Security Device Manager**: an older web GUI for configuring Cisco routers, with wizards for firewalls and VPNs and a one-click audit and lockdown." },
        { t: "list", items: ["Ran from the router over HTTPS", "Security Audit compared the config against best practice", "One-Step Lockdown applied the recommended settings", "Replaced by Cisco Configuration Professional; today it's mostly CLI or central controllers"] },
        { t: "callout", text: "GUIs change, the CLI stays. Learn what each wizard setting does as an IOS command." },
      ]},
    ]},
    { t: "grid", title: "SEE AND MEASURE THE NETWORK", items: [
      { icon: "eye", name: "Wireshark", text: "Captures and decodes packets so you can see exactly what crossed the wire. Use display filters like `dns` or `tcp.port == 443`, then Follow TCP Stream to read a whole conversation.", k: [["Best for", "troubleshooting and analysis"]] },
      { icon: "search", name: "Nmap", text: "Discovers which hosts are up and which services and versions they expose. Defenders use it to check that only expected ports are open. Only scan systems you're authorised to scan.", k: [["Best for", "asset discovery, exposure checks"]] },
      { icon: "terminal", name: "Netcat (nc)", text: "A simple tool to connect to or listen on a TCP/UDP port. Admins use it to test whether a port is reachable and whether a service answers.", k: [["Best for", "quick connectivity tests"]] },
    ]},
    { t: "callout", text: "Rule of thumb: Nmap tells you what's exposed, Wireshark tells you what's being said, and Netcat lets you knock on a single door to see if it opens. Keep all three to systems you own or are authorised to test." },
  ],
});

LEARN.push({
  id: "devops-cloud", track: "toolkit", m: "cac", mins: 7, c: "teal",
  title: "DevOps & cloud toolchain",
  sub: "How code travels from a laptop to running infrastructure: Git, containers, Kubernetes, Terraform, Ansible and AWS.",
  blocks: [
    { t: "flow", title: "THE PIPELINE, END TO END", items: [
      ["code", "Code", "Git & GitHub"],
      ["box", "Build", "Docker image"],
      ["ship", "Store", "image registry"],
      ["layers", "Run", "Kubernetes"],
      ["cloud", "Host", "AWS cloud"],
    ]},
    { t: "split", cols: [
      { title: "SOURCE & CONTAINERS", c: "blue", blocks: [
        { t: "grid", title: "", items: [
          { icon: "git", name: "Git & GitHub", text: "Git tracks every change; GitHub hosts repos and runs pipelines. Pull-request reviews and branch protection are where security checks belong." },
          { icon: "box", name: "Docker", text: "Packages an app with its dependencies into an image that runs the same everywhere. Use a minimal base image and run as a non-root user." },
          { icon: "layers", name: "Kubernetes", text: "Runs and scales containers across many machines, restarting them when they fail. Secrets are only base64-encoded by default, so protect them." },
          { icon: "ship", name: "Docker Swarm", text: "Docker's own, simpler clustering tool. Same idea as Kubernetes, fewer moving parts, for smaller setups." },
        ]},
      ]},
      { title: "CLOUD & AUTOMATION", c: "amber", blocks: [
        { t: "grid", title: "", items: [
          { icon: "cloud", name: "AWS", text: "Amazon's cloud. Remember the shared responsibility model: AWS secures the cloud, you secure what you put in it (data, IAM, config)." },
          { icon: "gear", name: "Terraform", text: "Infrastructure as Code: describe servers, networks and policies in files, and Terraform builds them. Always review `terraform plan` before `apply`." },
          { icon: "wrench", name: "Ansible", text: "Automates server configuration over SSH with YAML playbooks, no agent needed. Great for applying hardening consistently." },
        ]},
        { t: "callout", text: "Why it matters for security: the same file builds every environment, so you can review, scan and roll back infrastructure like code." },
      ]},
    ]},
    { t: "table", title: "WHERE SECURITY FITS IN", head: ["Stage", "Control"], rows: [
      ["Commit", "Pre-commit secret scanning, so keys never reach the repo"],
      ["Build", "Scan images for known vulnerabilities (e.g. Trivy)"],
      ["Infrastructure", "Scan Terraform for misconfigurations (e.g. Checkov) on the pull request"],
      ["Deploy", "Least-privilege IAM roles; inject secrets at runtime from a secrets manager"],
      ["Run", "Central logging, and alerts on changes to IAM and security groups"]] },
    { t: "note", title: "Practise it:", text: "Put a small app in a GitHub repo, write a Dockerfile, build the image, and use Terraform in an AWS free-tier account to create one resource, then destroy it. Add a secret-scanning check to the repo." },
  ],
});

LEARN.push({
  id: "scripting-db", track: "toolkit", m: "lnx", mins: 6, c: "purple",
  title: "Scripting & databases: Python, Bash, MySQL",
  sub: "The glue of security work: automate the boring parts and store what you collect.",
  blocks: [
    { t: "split", cols: [
      { title: "PYTHON", c: "blue", blocks: [
        { t: "lead", text: "The default language for security automation: readable, batteries included, huge library ecosystem." },
        { t: "table", title: "Libraries worth knowing", head: ["Library", "For"], rows: [
          ["`requests`", "Talking to web APIs"], ["`pandas`", "Crunching log and finding data"], ["`scapy`", "Crafting and reading packets"], ["`boto3`", "Automating AWS"], ["`re`", "Pattern matching in text"]] },
        { t: "callout", text: "A short Python script that reads a CSV of findings and sorts by CVSS beats doing it by hand every week." },
      ]},
      { title: "BASH SCRIPTING", c: "green", blocks: [
        { t: "lead", text: "Stitches Linux commands together. Perfect for quick, repeatable server tasks." },
        { t: "list", items: [
          "Start scripts with `#!/usr/bin/env bash` and `set -euo pipefail`",
          "Loop over hosts or files to repeat a check",
          "Schedule with cron for regular jobs (backups, log rotation)",
          "Keep secrets out of scripts; read them from the environment"] },
        { t: "callout", text: "Rule of thumb: Bash to glue commands, Python when there's real logic or data to handle." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "MYSQL", c: "amber", blocks: [
        { t: "lead", text: "A popular relational database. Security tools store findings, assets and evidence in databases like this." },
        { t: "table", title: "Reading data safely", head: ["Query", "Returns"], rows: [
          ["`SHOW DATABASES;`", "Databases on the server"], ["`SELECT * FROM users LIMIT 10;`", "First 10 rows"], ["`SELECT COUNT(*) FROM logs;`", "How many rows"], ["`DESCRIBE assets;`", "A table's columns"]] },
      ]},
      { title: "KEEP A DATABASE SAFE", c: "red", blocks: [
        { t: "list", items: [
          "Don't expose port 3306 to the internet",
          "One least-privilege account per app, not root",
          "Always use parameterised queries, never build SQL from user input (stops SQL injection)",
          "Encrypt backups and test restoring them",
          "Turn on the audit or general query log for sensitive data"] },
        { t: "callout", text: "SQL injection is still OWASP Top 10. The fix lives in the code (parameterised queries), not only in the database." },
      ]},
    ]},
  ],
});
