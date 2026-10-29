// Learn, toolkit track, part 3: security & defensive tools, digital forensics.
LEARN.push({
  id: "sec-tools", track: "toolkit", m: "netsec", mins: 7, c: "red",
  title: "Security & testing tools",
  sub: "The defensive toolkit: what web-app testing, SAST/DAST, firewalls, IDS/IPS, honeypots and scanners each do.",
  blocks: [
    { t: "split", cols: [
      { title: "APPLICATION SECURITY TESTING", c: "blue", blocks: [
        { t: "grid", title: "", items: [
          { icon: "shield", name: "OWASP testing tools", text: "Tools and guides from OWASP for finding web-app weaknesses (OWASP ZAP for scanning, the Testing Guide for method). Aligned to the OWASP Top 10." },
          { icon: "code", name: "SAST", text: "Static Application Security Testing reads source code without running it, flagging risky patterns early. Example: SonarQube in the pipeline." },
          { icon: "play", name: "DAST", text: "Dynamic Application Security Testing probes a running app from the outside, like an attacker would. Run it against staging, not production." },
          { icon: "eye", name: "JSGuard add-on", text: "A Firefox add-on that inspects and flags malicious or obfuscated JavaScript on pages, used for safer analysis." },
        ]},
      ]},
      { title: "MOBILE & ENDPOINT", c: "purple", blocks: [
        { t: "lead", text: "**ADB (Android Debug Bridge)** is the command-line bridge to an Android device or emulator, used to install apps, read logs and inspect a device during mobile analysis." },
        { t: "table", title: "SAST vs DAST", head: ["", "SAST", "DAST"], rows: [
          ["Sees", "Source code", "Running app"], ["Finds", "Insecure code patterns", "Exploitable behaviour"], ["When", "Early, in the IDE/CI", "Later, on a test build"], ["Blind spot", "Runtime and config issues", "Code it can't reach"]] },
        { t: "callout", text: "SAST and DAST are complementary, not rivals. Mature teams run both, plus SCA for third-party libraries." },
      ]},
    ]},
    { t: "grid", title: "NETWORK DEFENCE", items: [
      { icon: "shield", name: "Firewalls", text: "Allow or block traffic by rules. Modern next-generation firewalls also understand applications and users, and include IPS.", k: [["Key idea", "default deny, allow only what's needed"]] },
      { icon: "radar", name: "IDS / IPS", text: "An IDS detects and alerts on suspicious traffic; an IPS sits inline and can block it. Snort and Suricata are common engines.", k: [["Key idea", "signatures catch known attacks"]] },
      { icon: "honey", name: "Honeypots", text: "Deliberately exposed fake systems that have no business use, so any interaction with them is suspicious by definition.", k: [["Key idea", "early warning, low false positives"]] },
      { icon: "search", name: "Vulnerability scanners", text: "Check systems against databases of known flaws and misconfigurations (e.g. Nessus, OpenVAS). Authenticated scans find far more.", k: [["Key idea", "find and prioritise, then patch"]] },
      { icon: "eye", name: "Network sniffing tools", text: "Capture traffic for analysis (Wireshark, tcpdump). Defenders use them to investigate; they only see what reaches the sensor.", k: [["Key idea", "encrypted traffic hides content"]] },
    ]},
    { t: "callout", text: "Defence in depth: no single tool is enough. Firewalls reduce exposure, IDS/IPS and sniffers give visibility, scanners find gaps, and honeypots catch what slips through. Use every one against systems you're authorised to protect." },
  ],
});

LEARN.push({
  id: "forensics", track: "toolkit", m: "dfir", mins: 6, c: "navy",
  title: "Digital forensics toolkit",
  sub: "How to capture evidence without changing it, and the tools that read what's left behind.",
  blocks: [
    { t: "steps", title: "THE FORENSIC PROCESS", items: [
      "**Identify** what holds evidence (disk, memory, phone, logs)",
      "**Preserve** it: capture in order of volatility, memory before disk",
      "**Image** the media with a write blocker, then hash it",
      "**Analyse** a copy, never the original",
      "**Report** with a clear timeline and chain of custody"],
      icons: [["search", "Identify"], ["lock", "Preserve"], ["copy", "Image"], ["eye", "Analyse"], ["doc", "Report"]] },
    { t: "split", cols: [
      { title: "WHY HASHING MATTERS", c: "amber", blocks: [
        { t: "lead", text: "Take a SHA-256 hash of the image at capture. If the hash still matches later, you can prove the evidence hasn't changed since." },
        { t: "callout", text: "Chain of custody is the paper trail of who handled the evidence, when, and why. Without it, good evidence can be thrown out." },
        { t: "table", title: "Order of volatility", head: ["Collect first", "Then"], rows: [
          ["CPU registers, cache", "Most fleeting"], ["RAM (memory)", "Lost on power-off"], ["Network state", "Connections, ARP"], ["Disk", "Survives reboot"], ["Backups, archives", "Most durable"]] },
      ]},
      { title: "THE TOOLS", c: "blue", blocks: [
        { t: "grid", title: "", items: [
          { icon: "wrench", name: "Sysinternals Suite", text: "Free Microsoft tools for live Windows analysis: Process Explorer, Autoruns (persistence), TCPView, Procmon." },
          { icon: "copy", name: "FTK Imager", text: "Creates forensic disk and memory images and calculates hashes, without altering the source." },
          { icon: "search", name: "FTK (Forensic Toolkit)", text: "A full suite for indexing and searching an image: files, email, deleted data and artefacts." },
          { icon: "box", name: "OSF (OSForensics)", text: "Another analysis suite: recent activity, file carving, hash matching and reporting." },
          { icon: "code", name: "Hex editors", text: "Show raw bytes so you can read file headers (magic numbers) and recover data manually." },
          { icon: "shield", name: "Cyber Check Suite", text: "An Indian (C-DAC) forensic suite used by law enforcement for disk imaging and analysis." },
        ]},
      ]},
    ]},
    { t: "note", title: "Practise it:", text: "In a VM, use FTK Imager to image a small USB stick, record the hash, then open the image and recover a deleted file. Note the hash again and confirm it's unchanged." },
  ],
});
