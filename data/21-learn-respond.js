// Learn, Respond & recover track.
LEARN.push({
  id: "incident-response", track: "respond", m: "ir", mins: 8, c: "red",
  title: "Incident response lifecycle",
  sub: "The phases of handling an incident, the roles, the severity call and the reporting clocks.",
  blocks: [
    { t: "flow", title: "NIST SP 800-61 LIFECYCLE", items: [
      ["gear", "Preparation", "plans, tools, training"],
      ["radar", "Detection & Analysis", "is it real, how bad"],
      ["shield", "Containment", "stop the spread"],
      ["wrench", "Eradication", "remove the cause"],
      ["refresh", "Recovery", "restore safely"],
      ["doc", "Lessons learned", "improve"],
    ]},
    { t: "split", cols: [
      { title: "EVENT vs INCIDENT", c: "blue", blocks: [
        { t: "list", items: [
          "An **event** is any observable occurrence (a login, a backup)",
          "An **incident** harms or threatens confidentiality, integrity or availability",
          "A **precursor** is a sign one may happen; an **indicator** is a sign one has"] },
        { t: "callout", text: "Containment comes before eradication: isolate the host first (stop the bleeding), then remove the malware and close the way in." },
      ]},
      { title: "SANS 6 STEPS (SAME IDEA)", c: "green", blocks: [
        { t: "list", items: ["Preparation", "Identification", "Containment", "Eradication", "Recovery", "Lessons learned"] },
        { t: "note", title: "Short vs long containment", text: "Short-term: isolate now. Long-term: temporary fixes that let the business run while you prepare a clean rebuild." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "SEVERITY & ROLES", c: "amber", blocks: [
        { t: "list", items: [
          "Severity is driven by **business impact, data sensitivity and scope**",
          "The **incident lead** coordinates; analysts investigate and contain",
          "Define up front who may talk to media and regulators",
          "Use **out-of-band comms**: the attacker may be reading email/chat"] },
      ]},
      { title: "REPORTING CLOCKS (EU)", c: "red", blocks: [
        { t: "table", head: ["Rule", "Deadline"], rows: [
          ["GDPR personal data breach", "72h to the regulator (if risk)"],
          ["NIS2 early warning", "24h to the CSIRT/authority"],
          ["NIS2 notification", "72h, final report in 1 month"],
          ["DORA major ICT incident", "Initial within 4h of classifying (max 24h)"]] },
        { t: "callout", text: "The clock starts when you become **aware**, not when you finish investigating. Tell the right people early." },
      ]},
    ]},
    { t: "note", title: "Key terms:", text: "A **playbook** is the step-by-step for one incident type. A **tabletop** is a discussion-based rehearsal. **Dwell time** is how long an attacker was in before detection. The lessons-learned phase exists to cut all three next time." },
  ],
});

LEARN.push({
  id: "dfir-basics", track: "respond", m: "dfir", mins: 8, c: "navy",
  title: "Digital forensics fundamentals",
  sub: "Capturing evidence without changing it, the order of volatility, and the artefacts that tell the story.",
  blocks: [
    { t: "steps", title: "THE FORENSIC PROCESS", items: [
      "**Identify** what holds evidence",
      "**Preserve** it in order of volatility, with a write blocker",
      "**Image** the media and hash it (prove it's unchanged)",
      "**Analyse** a copy, never the original",
      "**Report** with a timeline and chain of custody"],
      icons: [["search", "Identify"], ["lock", "Preserve"], ["copy", "Image"], ["eye", "Analyse"], ["doc", "Report"]] },
    { t: "split", cols: [
      { title: "ORDER OF VOLATILITY (RFC 3227)", c: "amber", blocks: [
        { t: "table", head: ["Collect first", "Why"], rows: [
          ["CPU registers & cache", "Gone in an instant"],
          ["RAM (memory)", "Lost on power-off"],
          ["Network state", "Connections, ARP, routing"],
          ["Running processes", "Change constantly"],
          ["Disk", "Survives reboot"],
          ["Backups & archives", "Most durable"]] },
        { t: "callout", text: "Capture memory before you pull the plug: keys, injected code and running malware often live only in RAM." },
      ]},
      { title: "WHY HASHING & CUSTODY", c: "red", blocks: [
        { t: "list", items: [
          "Hash the image (SHA-256) at capture; match it later to prove integrity",
          "A **write blocker** lets you read evidence media without changing it",
          "**Chain of custody** records who held evidence, when and why",
          "Break any of these and good evidence can be thrown out"] },
      ]},
    ]},
    { t: "grid", title: "ARTEFACTS THAT TELL THE STORY", items: [
      { icon: "cpu", name: "Memory", text: "Running processes, network connections, injected code, encryption keys. Analysed with Volatility." },
      { icon: "folder", name: "MFT / timestamps", text: "NTFS Master File Table and MAC(B) times show what files existed and when they changed." },
      { icon: "list", name: "Registry", text: "NTUSER.DAT, Run keys, ShellBags, UserAssist: what ran, what was opened, persistence." },
      { icon: "play", name: "Execution", text: "Prefetch, Amcache, Shimcache show which programs ran and when." },
      { icon: "network", name: "Logs & PCAP", text: "Event logs and captured packets rebuild the timeline and the network story." },
      { icon: "mail", name: "Email headers", text: "Read Received: lines bottom-up to trace where a message really came from." },
    ]},
    { t: "note", title: "Live vs dead:", text: "Live response collects from a running system (needed when volatile data matters). Dead-box forensics works from a powered-off image. In the cloud, snapshot the disk (EBS) to preserve it. NIST SP 800-86 is the guide." },
  ],
});

LEARN.push({
  id: "bcp-dr", track: "respond", m: "bcp", mins: 7, c: "green",
  title: "Business continuity & disaster recovery",
  sub: "Keeping the business running and getting it back: RTO, RPO, BIA, backups and recovery sites.",
  blocks: [
    { t: "split", cols: [
      { title: "THE TWO NUMBERS EVERYONE ASKS", c: "blue", blocks: [
        { t: "table", head: ["Metric", "Means"], rows: [
          ["RPO (Recovery Point Objective)", "Max acceptable **data loss**, in time"],
          ["RTO (Recovery Time Objective)", "Target time to **restore** a service"],
          ["MTD", "Max tolerable downtime (RTO + work recovery)"],
          ["MTBF / MTTR", "Mean time between failures / to repair"]] },
        { t: "callout", text: "RPO = how far back you'd lose data (drives backup frequency). RTO = how long you can be down (drives the recovery design)." },
      ]},
      { title: "BCP vs DR", c: "amber", blocks: [
        { t: "list", items: [
          "**BCP** keeps the whole business running through a disruption (people, process, premises)",
          "**DR** is the IT part: restoring systems and data",
          "A **BIA (Business Impact Analysis)** finds the critical processes and their RTO/RPO",
          "**HA** rides through component failures; **DR** recovers after a disaster"] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "BACKUP STRATEGY", c: "green", blocks: [
        { t: "lead", text: "The **3-2-1 rule**: 3 copies, on 2 media types, with 1 offsite. Add immutable or offline copies against ransomware." },
        { t: "table", head: ["Backup", "Restores from"], rows: [
          ["Full", "Itself"], ["Incremental", "Last full + every incremental"], ["Differential", "Last full + last differential"]] },
        { t: "callout", text: "An untested backup is a hope, not a plan. Test restores, and only restore to production after the attacker is evicted." },
      ]},
      { title: "RECOVERY SITES", c: "teal", blocks: [
        { t: "table", head: ["Site", "Ready in", "Cost"], rows: [
          ["Hot", "Minutes/hours", "High"],
          ["Warm", "Hours/days", "Medium"],
          ["Cold", "Days/weeks", "Low"],
          ["Cloud / active-active", "Near-zero RTO", "Varies"]] },
        { t: "note", title: "Testing", text: "From least to most disruptive: tabletop, walkthrough, simulation, parallel, full interruption." },
      ]},
    ]},
    { t: "note", title: "Standard:", text: "ISO 22301 specifies a Business Continuity Management System. The business process owner (not IT) approves the RTO and RPO, because they own the impact." },
  ],
});
