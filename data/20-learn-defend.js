// Learn, Defend & detect track: the blue-team concept references.
LEARN.push({
  id: "soc-siem", track: "defend", m: "soc", mins: 8, c: "blue",
  title: "SOC & SIEM fundamentals",
  sub: "How a security operations centre is run, what a SIEM does, and the log sources and events you watch.",
  blocks: [
    { t: "lead", text: "A **SOC (Security Operations Centre)** is the team that watches for, triages and responds to security events. A **SIEM (Security Information and Event Management)** is its main tool: it collects logs from everywhere, normalises them, correlates them and raises alerts." },
    { t: "split", cols: [
      { title: "SOC ANALYST TIERS", c: "blue", blocks: [
        { t: "table", head: ["Tier", "Role"], rows: [
          ["Tier 1", "Triage alerts, add context, escalate real ones"],
          ["Tier 2", "Investigate deeper, scope the incident"],
          ["Tier 3", "Threat hunting, advanced IR, detection engineering"],
          ["SOC lead", "Runs the shift, reporting, process"]] },
        { t: "callout", text: "Most people start at Tier 1. The skill that gets you promoted is good triage: deciding fast what's real and what's noise." },
      ]},
      { title: "WHAT A SIEM DOES", c: "green", blocks: [
        { t: "steps", title: "", items: [
          "**Collect** logs from hosts, network, cloud, apps",
          "**Normalise** different formats into common fields",
          "**Correlate** events across sources into one picture",
          "**Alert** on rules and anomalies",
          "**Store** for search, hunting and compliance"],
          icons: [["download", "Collect"], ["refresh", "Normalise"], ["link", "Correlate"], ["alert", "Alert"], ["database", "Store"]] },
        { t: "note", title: "Common SIEMs", text: "Splunk, Microsoft Sentinel, Elastic, QRadar, Wazuh (open source)." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "LOG SOURCES THAT MATTER", c: "amber", blocks: [
        { t: "table", head: ["Source", "Tells you"], rows: [
          ["Windows Security log", "Logons, account & privilege changes"],
          ["Sysmon", "Process, network, file detail on hosts"],
          ["EDR", "Endpoint behaviour and response"],
          ["Firewall / proxy", "Allowed/blocked connections, URLs"],
          ["DNS", "Name lookups (tunnelling, C2)"],
          ["Cloud (CloudTrail etc.)", "API calls in the cloud"]] },
      ]},
      { title: "KEY WINDOWS EVENT IDs", c: "red", blocks: [
        { t: "table", head: ["ID", "Event"], rows: [
          ["4624 / 4625", "Logon success / failure"],
          ["4720", "User account created"],
          ["4732", "Added to a privileged group"],
          ["4688", "A process was created"],
          ["4769", "Kerberos ticket (Kerberoasting)"],
          ["1102", "Security log was cleared"]] },
        { t: "callout", text: "Log clearing (1102) and odd account creation are classic signs someone's covering tracks or persisting." },
      ]},
    ]},
    { t: "grid", title: "METRICS & CONCEPTS", items: [
      { icon: "gauge", name: "MTTD / MTTR", text: "Mean time to detect and to respond. Lower is better; they're how a SOC measures itself." },
      { icon: "radar", name: "Threat hunting", text: "Proactively looking for threats that raised no alert, using a hypothesis and the logs." },
      { icon: "gear", name: "SOAR", text: "Automates repeatable response steps with playbooks, so analysts aren't doing the same clicks all day." },
      { icon: "bell", name: "Alert fatigue", text: "Too many noisy alerts hide the real ones. Tuning and correlation are the cure." },
    ]},
  ],
});

LEARN.push({
  id: "detection", track: "defend", m: "ids", mins: 7, c: "teal",
  title: "Detection: IDS, IPS & EDR",
  sub: "Signature vs anomaly, network vs host, where each sensor sits, and how a detection rule is built.",
  blocks: [
    { t: "split", cols: [
      { title: "IDS vs IPS", c: "blue", blocks: [
        { t: "table", head: ["", "IDS", "IPS"], rows: [
          ["Action", "Alerts only", "Alerts and blocks"],
          ["Placement", "Out of band (SPAN/TAP)", "Inline"],
          ["Risk", "Misses nothing, stops nothing", "Can block legitimate traffic"]] },
        { t: "callout", text: "Run new IPS rules in alert-only mode first, so a bad rule doesn't block real business traffic." },
      ]},
      { title: "NETWORK vs HOST", c: "green", blocks: [
        { t: "list", items: [
          "**NIDS** watches a copy of network traffic (Snort, Suricata, Zeek)",
          "**HIDS** watches one machine's logs, files and processes (Wazuh, OSSEC)",
          "**EDR** is the modern endpoint sensor: behavioural telemetry plus response (isolate, kill, quarantine)"] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "SIGNATURE vs ANOMALY", c: "amber", blocks: [
        { t: "table", head: ["", "Signature", "Anomaly"], rows: [
          ["Catches", "Known attacks", "Unusual behaviour"],
          ["Misses", "Brand-new attacks", "n/a (learns normal)"],
          ["False positives", "Fewer", "More"],
          ["Example", "Snort rule for an exploit", "A host beaconing every 60s"]] },
      ]},
      { title: "FALSE POSITIVE vs NEGATIVE", c: "red", blocks: [
        { t: "table", head: ["Term", "Meaning"], rows: [
          ["True positive", "Real attack, alert fired"],
          ["False positive", "Alert fired, nothing wrong"],
          ["False negative", "Real attack, no alert (worst)"],
          ["True negative", "Nothing wrong, no alert"]] },
        { t: "callout", text: "False negatives are the dangerous ones: a real attack nobody saw. Tuning reduces false positives without creating them." },
      ]},
    ]},
    { t: "steps", title: "ANATOMY OF A SNORT/SURICATA RULE", items: [
      "**Action**: alert, drop, reject",
      "**Header**: protocol, source/dest IP and port, direction",
      "**Options**: what to match (content, pcre) and metadata (msg, sid, rev)",
      "Example idea: alert on TCP to port 22 containing a known bad pattern, with a clear message and unique SID"],
      icons: [["flag", "Action"], ["network", "Header"], ["search", "Match"], ["doc", "Message"]] },
    { t: "note", title: "Sigma", text: "Sigma is a portable YAML format for detections that converts to Splunk, Sentinel (KQL), Elastic and more, so one rule works across tools." },
  ],
});

LEARN.push({
  id: "malware-defence", track: "defend", m: "edr", mins: 7, c: "red",
  title: "Malware & endpoint defence",
  sub: "The malware families, how they persist and hide, and the controls that stop them.",
  blocks: [
    { t: "table", title: "MALWARE TYPES", head: ["Type", "What it does"], rows: [
      ["Virus", "Attaches to a file; runs when the file runs"],
      ["Worm", "Spreads across networks on its own"],
      ["Trojan", "Disguised as something useful"],
      ["Ransomware", "Encrypts data and demands payment"],
      ["Rootkit", "Hides itself and other activity from the OS"],
      ["RAT", "Remote Access Trojan: full remote control"],
      ["Keylogger", "Records keystrokes (passwords)"],
      ["Botnet agent", "Enlists the host into a C2-controlled network"],
      ["Logic bomb", "Triggers on a condition (a date, an account disabled)"]] },
    { t: "split", cols: [
      { title: "HOW IT HIDES & STAYS", c: "amber", blocks: [
        { t: "list", items: [
          "**Fileless**: lives in memory, abuses PowerShell, WMI, mshta",
          "**Persistence**: Run keys, scheduled tasks, services, startup folders",
          "**Polymorphic**: changes its code each time to dodge signatures",
          "**Packing**: compresses/encrypts itself (high entropy) to hide",
          "**Living off the land**: uses built-in tools (certutil, rundll32)"] },
        { t: "callout", text: "Because malware reuses trusted tools, behaviour beats signatures: a Word document spawning PowerShell is suspicious whatever the file hash." },
      ]},
      { title: "DEFENCES THAT WORK", c: "green", blocks: [
        { t: "list", items: [
          "EDR with behavioural detection and host isolation",
          "Application allow-listing (WDAC, AppLocker)",
          "Block Office macros from the internet (Mark of the Web)",
          "Patch fast; remove local admin rights",
          "LAPS for unique local admin passwords",
          "Immutable, offline backups against ransomware"] },
      ]},
    ]},
    { t: "steps", title: "RANSOMWARE: THE BEST FIRST RESPONSE", items: [
      "**Isolate** the host with EDR, keep it powered on (memory evidence)",
      "**Escalate** to the incident lead: it's always a major incident",
      "**Scope** it: which accounts and machines, how it got in",
      "**Recover** from clean, immutable backups only after eviction"],
      icons: [["shield", "Isolate"], ["alert", "Escalate"], ["search", "Scope"], ["refresh", "Recover"]] },
    { t: "note", title: "Analysis types:", text: "Static analysis inspects a sample without running it (strings, hashes, headers). Dynamic analysis runs it in a sandbox and watches behaviour. YARA rules match malware by byte and text patterns." },
  ],
});

LEARN.push({
  id: "threat-intel", track: "defend", m: "cti", mins: 8, c: "purple",
  title: "Threat intelligence & MITRE ATT&CK",
  sub: "The frameworks for thinking like an attacker: ATT&CK, the kill chain, the diamond model and the pyramid of pain.",
  blocks: [
    { t: "lead", text: "**Cyber Threat Intelligence (CTI)** is knowledge about attackers, their methods and their infrastructure, used to detect and prepare. It turns raw data into decisions." },
    { t: "split", cols: [
      { title: "MITRE ATT&CK", c: "blue", blocks: [
        { t: "lead", text: "A living knowledge base of real attacker behaviour, organised as **tactics** (the why) and **techniques** (the how). 14 enterprise tactics run roughly in attack order." },
        { t: "list", items: [
          "Reconnaissance -> Resource Development",
          "Initial Access -> Execution -> Persistence",
          "Privilege Escalation -> Defense Evasion",
          "Credential Access -> Discovery -> Lateral Movement",
          "Collection -> C2 -> Exfiltration -> Impact"] },
        { t: "callout", text: "Techniques have IDs (T1566 Phishing, T1059 Command & Scripting). Teams map detections to ATT&CK to see coverage gaps." },
      ]},
      { title: "IOC vs IOA", c: "amber", blocks: [
        { t: "table", head: ["", "Shows"], rows: [
          ["IOC (indicator of compromise)", "That a past attack happened: hashes, IPs, domains"],
          ["IOA (indicator of attack)", "Attacker behaviour in progress: intent, not artefact"]] },
        { t: "note", title: "Intel levels", text: "Strategic (trends, for execs), operational (campaigns), tactical (TTPs, for defenders), technical (IOCs, for tools)." },
      ]},
    ]},
    { t: "flow", title: "THE LOCKHEED MARTIN CYBER KILL CHAIN", items: [
      ["search", "Recon", "pick a target"],
      ["box", "Weaponise", "build the payload"],
      ["mail", "Deliver", "email, web, USB"],
      ["alert", "Exploit", "run it"],
      ["lock", "Install", "persist"],
      ["network", "C2", "call home"],
      ["flag", "Actions", "steal, damage"],
    ]},
    { t: "split", cols: [
      { title: "PYRAMID OF PAIN", c: "red", blocks: [
        { t: "lead", text: "How much it hurts an attacker when you block each thing. Top = hardest for them to change." },
        { t: "list", items: ["TTPs (hardest to change)", "Tools", "Network/host artefacts", "Domain names", "IP addresses", "Hash values (trivial to change)"] },
        { t: "callout", text: "Blocking a hash barely slows an attacker. Detecting their behaviour (TTPs) forces them to rebuild how they operate." },
      ]},
      { title: "OTHER MODELS", c: "teal", blocks: [
        { t: "list", items: [
          "**Diamond model**: every event = adversary, capability, infrastructure, victim",
          "**STIX / TAXII**: STIX is the data format for intel, TAXII is how it's shared",
          "**TLP**: how sensitive intel may be shared (RED, AMBER, GREEN, CLEAR)",
          "**CISA KEV**: vulnerabilities known to be exploited in the wild"] },
      ]},
    ]},
  ],
});
