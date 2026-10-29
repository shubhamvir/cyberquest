// Learn, ICS/OT track: fundamentals and the Purdue model, protocols and standards, incidents and defence.
LEARN.push({
  id: "ics-fundamentals", track: "ics", m: "ics", mins: 8, c: "amber",
  title: "ICS / OT security fundamentals",
  sub: "The systems that run factories, grids and water plants, why they're different from IT, and the Purdue model.",
  blocks: [
    { t: "lead", text: "**OT (Operational Technology)** monitors and controls physical processes: pumps, valves, turbines, production lines. **ICS (Industrial Control Systems)** is the umbrella term for the kit that does it. When OT fails, things move, overflow or stop in the real world." },
    { t: "split", cols: [
      { title: "IT vs OT: FLIPPED PRIORITIES", c: "blue", blocks: [
        { t: "table", head: ["", "IT", "OT"], rows: [
          ["Top priority", "Confidentiality", "Safety & availability"],
          ["Patching", "Often, quickly", "Rare, tightly scheduled"],
          ["Lifespan", "3–5 years", "15–30 years"],
          ["A reboot", "Usually fine", "Can halt production"],
          ["Downtime", "Inconvenient", "Dangerous or very costly"]] },
        { t: "callout", text: "In OT the order is often **S-A-I-C**: Safety first, then Availability, Integrity, and Confidentiality last, the reverse of IT's CIA triad." },
      ]},
      { title: "THE BUILDING BLOCKS", c: "green", blocks: [
        { t: "grid", title: "", items: [
          { icon: "cpu", name: "PLC", text: "Programmable Logic Controller: a rugged computer reading sensors and driving motors and valves. Change its logic and you change the physical process." },
          { icon: "radar", name: "RTU", text: "Remote Terminal Unit: like a PLC, for remote sites such as substations and pipelines." },
          { icon: "monitor", name: "HMI", text: "Human-Machine Interface: the screen operators use to watch and control the process." },
          { icon: "network", name: "SCADA", text: "Supervisory Control and Data Acquisition: gathers data from many remote sites and lets operators supervise centrally." },
        ]},
      ]},
    ]},
    { t: "flow", title: "THE PURDUE MODEL — ENTERPRISE DOWN TO THE PROCESS", items: [
      ["office", "L4–5 Enterprise", "email, ERP, internet"],
      ["shield", "L3.5 IT/OT DMZ", "the buffer zone"],
      ["monitor", "L3 Operations", "historians, control room"],
      ["network", "L2 Supervisory", "SCADA, HMI"],
      ["cpu", "L1 Control", "PLCs, RTUs"],
      ["gear", "L0 Process", "sensors, actuators"],
    ]},
    { t: "callout", text: "The whole point of the model is **segmentation**. The Level 3.5 DMZ brokers IT/OT traffic so office malware can't reach the controllers directly. Internet-exposed PLCs (findable on Shodan) are how several real attacks began." },
    { t: "note", title: "Why it matters even for a GRC or SOC role:", text: "Utilities and manufacturers are in scope for NIS2, and their OT networks need an asset inventory, segmentation and monitoring just like IT, but with safety and uptime coming first." },
  ],
});

LEARN.push({
  id: "ics-protocols", track: "ics", m: "ics", mins: 7, c: "navy",
  title: "ICS protocols & the 62443 standard",
  sub: "The old protocols that trust everything, and the framework built to secure them.",
  blocks: [
    { t: "split", cols: [
      { title: "INDUSTRIAL PROTOCOLS", c: "blue", blocks: [
        { t: "lead", text: "Most were designed decades ago for isolated, trusted networks, so many have **no authentication or encryption** built in." },
        { t: "table", head: ["Protocol", "Used in", "Port"], rows: [
          ["Modbus / Modbus TCP", "General industrial", "502"],
          ["DNP3", "Electric & water utilities", "20000"],
          ["EtherNet/IP", "Factory automation", "44818 / 2222"],
          ["PROFINET", "Manufacturing", "—"],
          ["OPC UA", "Modern, secure-by-design", "4840"]] },
        { t: "callout", text: "A command on classic Modbus is trusted simply because it arrived. That's why network segmentation does the security these protocols can't." },
      ]},
      { title: "ISA/IEC 62443", c: "green", blocks: [
        { t: "lead", text: "The main standard family for industrial automation and control system security. It's built around three ideas:" },
        { t: "steps", title: "", items: [
          "**Zones**: group assets with similar security needs",
          "**Conduits**: the controlled pathways between zones",
          "**Security Levels (SL 1–4)**: how strong a protection a zone needs, SL 4 resists a well-resourced nation-state"],
          icons: [["layers", "Zones"], ["link", "Conduits"], ["gauge", "Levels"]] },
        { t: "note", title: "Also worth knowing", text: "NIST SP 800-82 is the US guide to OT security, and MITRE ATT&CK for ICS catalogues attacker techniques specific to control systems." },
      ]},
    ]},
    { t: "grid", title: "CONTROLS THAT FIT OT", items: [
      { icon: "layers", name: "Segmentation", text: "Zones and conduits with a Level 3.5 DMZ, so a compromise can't spread from IT to the plant floor." },
      { icon: "arrow", name: "Data diodes", text: "Hardware that physically allows traffic one way only, e.g. let data out for monitoring, let nothing back in." },
      { icon: "key", name: "Secure remote access", text: "Vendor access through a jump host with MFA, approval and session recording, never a direct line to a PLC." },
      { icon: "list", name: "Asset inventory", text: "You can't protect what you can't see. Passive discovery first; active scanning can crash fragile old devices." },
      { icon: "eye", name: "Passive monitoring", text: "OT-aware IDS watches a copy of traffic for abnormal commands without touching the live process." },
      { icon: "shield", name: "Safety systems (SIS)", text: "An independent system that forces the process to a safe state. Keep it separate from normal control." },
    ]},
  ],
});

LEARN.push({
  id: "ics-incidents", track: "ics", m: "ics", mins: 6, c: "red",
  title: "ICS/OT attacks & lessons",
  sub: "The landmark incidents, what each one taught, and why active scanning can be dangerous in OT.",
  blocks: [
    { t: "timeline", title: "LANDMARK OT INCIDENTS", items: [
      ["2010", "Stuxnet", "Malware targeted Siemens PLCs to damage uranium-enrichment centrifuges, while showing operators normal readings. Proved code can cause physical destruction."],
      ["2015–16", "Ukraine power grid", "Attackers opened breakers and cut power to hundreds of thousands. Industroyer/CrashOverride spoke grid protocols directly."],
      ["2017", "Triton / Trisis", "Malware targeted a plant's Safety Instrumented System, the last line of defence against disaster. A line few thought attackers would cross."],
      ["2021", "Colonial Pipeline", "Ransomware hit the IT side, but the pipeline was shut down as a precaution, showing how IT and OT risk are linked."],
      ["2023–24", "Exposed PLCs", "Internet-facing water-utility PLCs with default settings were tampered with, including small utilities in Ireland. A reminder that basic exposure is still the common way in."]] },
    { t: "split", cols: [
      { title: "COMMON THREADS", c: "amber", blocks: [
        { t: "list", items: [
          "Many started on IT, then crossed into OT",
          "Default passwords and internet exposure keep appearing",
          "Attackers studied the physical process, not just the network",
          "Flat networks let a single foothold spread",
          "Detection was slow because OT had little monitoring"] },
      ]},
      { title: "WHY SCANNING IS RISKY IN OT", c: "red", blocks: [
        { t: "lead", text: "A normal Nmap scan can crash a fragile PLC or RTU that was never built to handle unexpected traffic, taking a live process down." },
        { t: "list", items: [
          "Prefer passive discovery over active scanning",
          "Test any active tool in a lab or maintenance window first",
          "Coordinate with process engineers before touching OT",
          "Treat availability and safety as the top priority"] },
        { t: "callout", text: "In IT a crashed host is an inconvenience. In OT it can stop a production line or a water supply, so caution outranks curiosity." },
      ]},
    ]},
  ],
});
