// Learn, GRC track additions: risk management, the frameworks map, PCI DSS.
LEARN.push({
  id: "risk-mgmt", track: "grc", m: "risk", mins: 7, c: "amber",
  title: "Risk management fundamentals",
  sub: "How risk is identified, measured, treated and accepted, with the formulas and the vocabulary.",
  blocks: [
    { t: "lead", text: "Security exists to manage **risk**: the chance and impact of a threat exploiting a vulnerability. You can't remove all risk, so you manage it down to a level the business accepts." },
    { t: "split", cols: [
      { title: "THE FOUR TREATMENTS", c: "blue", blocks: [
        { t: "table", head: ["Option", "Means", "Example"], rows: [
          ["Mitigate", "Reduce likelihood/impact", "Add controls"],
          ["Transfer / share", "Pass it on", "Insurance, outsourcing"],
          ["Avoid", "Stop the activity", "Shut the risky service"],
          ["Accept", "Knowingly keep it", "Owner signs it off"]] },
        { t: "callout", text: "Only a risk owner with authority accepts a risk, with justification and a review date. Acceptance isn't ignoring it." },
      ]},
      { title: "INHERENT vs RESIDUAL", c: "green", blocks: [
        { t: "list", items: [
          "**Inherent risk**: the raw exposure, before controls",
          "**Residual risk**: what's left after controls",
          "**Risk appetite**: how much risk the org will pursue",
          "Compare residual risk to appetite to decide if it's enough"] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "QUANTITATIVE (THE MATHS)", c: "purple", blocks: [
        { t: "table", head: ["Term", "Formula"], rows: [
          ["SLE", "Asset value × Exposure Factor"],
          ["ARO", "Expected occurrences per year"],
          ["ALE", "SLE × ARO"]] },
        { t: "note", title: "Worked example", text: "Asset €200k, EF 25% -> SLE €50k. Flood every 2 years -> ARO 0.5. ALE = €50k × 0.5 = €25k/year. A control costing less than that may be worth it." },
      ]},
      { title: "QUALITATIVE", c: "teal", blocks: [
        { t: "list", items: [
          "High/medium/low ratings and a likelihood × impact heat map",
          "Fast and intuitive, but subjective",
          "A **risk register** tracks owner, likelihood, impact, controls, treatment",
          "A **KRI** signals rising exposure before an event"] },
        { t: "callout", text: "Write a risk as cause -> event -> consequence, so it's clear what could happen and why." },
      ]},
    ]},
    { t: "note", title: "Frameworks:", text: "ISO 31000 gives general risk principles; ISO/IEC 27005 covers information security risk; NIST SP 800-30 covers risk assessments; FAIR is a quantitative model (loss event frequency × magnitude)." },
  ],
});

LEARN.push({
  id: "frameworks-map", track: "grc", m: "gov", mins: 7, c: "navy",
  title: "Security frameworks & standards map",
  sub: "ISO 27001, NIST, CIS, SOC 2, PCI DSS and COBIT, what each is for and how they relate.",
  blocks: [
    { t: "lead", text: "There are many frameworks because they answer different questions: *how do we run security?*, *what should we do?*, *how do we prove it to customers?*, *what does the law require?* Here's how the big ones fit together." },
    { t: "table", title: "THE LANDSCAPE", head: ["Framework", "What it is", "Certifiable?"], rows: [
      ["ISO/IEC 27001", "Management system for information security (ISMS)", "Yes"],
      ["NIST CSF 2.0", "Flexible cyber risk framework (6 functions)", "No"],
      ["NIST SP 800-53", "Detailed control catalogue (US federal)", "No"],
      ["CIS Controls v8", "18 prioritised, practical controls", "No"],
      ["SOC 2", "Attestation report on trust criteria", "Attestation"],
      ["PCI DSS", "Rules for handling payment cards", "Validation"],
      ["COBIT", "Governance & management of enterprise IT", "No"]] },
    { t: "split", cols: [
      { title: "HOW THEY RELATE", c: "blue", blocks: [
        { t: "list", items: [
          "**NIST CSF** to assess and talk about posture; **ISO 27001** to certify the management system",
          "**CIS Controls** are a concrete starting checklist (IG1 = basic hygiene)",
          "**800-53 / ISO Annex A** are the detailed controls you implement",
          "**SOC 2 / ISO cert** are how you prove it to customers",
          "**PCI / GDPR / NIS2** are what you must do by contract or law"] },
        { t: "callout", text: "Map one control set to several frameworks: a single access-review control can evidence ISO, SOC 2 and NIST at once." },
      ]},
      { title: "GOVERNANCE DOCUMENTS", c: "amber", blocks: [
        { t: "table", head: ["Document", "Is"], rows: [
          ["Policy", "High-level, mandatory, approved by management"],
          ["Standard", "Mandatory specifics (e.g. AES-256)"],
          ["Procedure", "Step-by-step how-to"],
          ["Guideline", "Recommended, not mandatory"]] },
        { t: "note", title: "RACI", text: "Responsible, Accountable, Consulted, Informed. Exactly one person is Accountable for a task." },
      ]},
    ]},
  ],
});

LEARN.push({
  id: "pci-dss", track: "grc", m: "pci", mins: 6, c: "red",
  title: "PCI DSS in brief",
  sub: "What it protects, the 12 requirements at a glance, and how to shrink your scope.",
  blocks: [
    { t: "lead", text: "**PCI DSS** (Payment Card Industry Data Security Standard) applies to anyone who stores, processes or transmits payment card data. It's enforced by the card brands and acquiring banks, not a law." },
    { t: "split", cols: [
      { title: "THE 12 REQUIREMENTS (6 GOALS)", c: "blue", blocks: [
        { t: "table", head: ["Goal", "Requirements"], rows: [
          ["Secure network", "1 Firewalls · 2 No vendor defaults"],
          ["Protect card data", "3 Protect stored data · 4 Encrypt in transit"],
          ["Vuln management", "5 Anti-malware · 6 Secure systems & apps"],
          ["Access control", "7 Need-to-know · 8 Unique IDs · 9 Physical"],
          ["Monitor & test", "10 Log & monitor · 11 Test security"],
          ["Policy", "12 Information security policy"]] },
      ]},
      { title: "KEY RULES", c: "amber", blocks: [
        { t: "list", items: [
          "Never store sensitive authentication data (CVV, full track) after authorisation",
          "Mask the PAN: show at most first 6 / last 4",
          "MFA for all access into the cardholder data environment (CDE)",
          "Quarterly external scans by an ASV; annual pentest",
          "Keep audit logs 12 months (3 immediately available)"] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "SHRINK YOUR SCOPE", c: "green", blocks: [
        { t: "list", items: [
          "**Tokenisation**: replace the card number with a useless token",
          "**Segmentation**: isolate the CDE from the rest of the network",
          "Outsource card capture (hosted page / iframe) so cards never touch your servers"] },
        { t: "callout", text: "The cheapest card data to protect is the data you never hold. Reducing scope reduces cost and risk together." },
      ]},
      { title: "WHO ISSUES WHAT", c: "navy", blocks: [
        { t: "table", head: ["Term", "Is"], rows: [
          ["SAQ", "Self-assessment (smaller merchants)"],
          ["ROC", "Report on Compliance (QSA, large)"],
          ["AOC", "Attestation of Compliance"],
          ["QSA / ASV", "Qualified assessor / approved scanner"]] },
      ]},
    ]},
  ],
});
