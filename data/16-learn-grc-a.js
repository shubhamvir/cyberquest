// Learn, GRC track: ISO 27001 clauses and Annex A, how an audit works.
LEARN.push({
  id: "iso-clauses", track: "grc", m: "iso", mins: 8, c: "blue",
  title: "ISO/IEC 27001:2022 — the clauses explained",
  sub: "What each mandatory clause asks for, and how the 93 Annex A controls are organised.",
  blocks: [
    { t: "lead", text: "ISO/IEC 27001 is the international standard for an **Information Security Management System (ISMS)**. Clauses 4 to 10 are the mandatory 'shall' requirements you're certified against. Annex A is a catalogue of controls you choose from." },
    { t: "flow", title: "CLAUSES 4–10 FOLLOW PLAN–DO–CHECK–ACT", items: [
      ["target", "Plan", "Clauses 4–7"],
      ["play", "Do", "Clause 8"],
      ["chart", "Check", "Clause 9"],
      ["refresh", "Act", "Clause 10"],
    ]},
    { t: "table", title: "THE MANDATORY CLAUSES", head: ["Clause", "Name", "What it asks for"], rows: [
      ["4", "Context of the organisation", "Understand internal/external issues and interested parties, then set the ISMS scope"],
      ["5", "Leadership", "Top management commitment, an information security policy, and clear roles"],
      ["6", "Planning", "Risk assessment and treatment, a Statement of Applicability, and measurable objectives"],
      ["7", "Support", "Resources, competence, awareness, communication and documented information"],
      ["8", "Operation", "Actually run the risk assessment and treatment, and control changes"],
      ["9", "Performance evaluation", "Monitor and measure, run internal audits, hold management reviews"],
      ["10", "Improvement", "Handle nonconformities with corrective action, and improve continually"]] },
    { t: "split", cols: [
      { title: "TWO DOCUMENTS TO KNOW", c: "amber", blocks: [
        { t: "grid", title: "", items: [
          { icon: "doc", name: "Statement of Applicability (SoA)", text: "Lists every Annex A control, whether it's included or excluded, why, and whether it's implemented. The auditor's map of your ISMS." },
          { icon: "list", name: "Risk treatment plan", text: "For each risk: the chosen option (modify, retain, avoid, share), the controls, the owner and the residual risk the owner accepts." },
        ]},
      ]},
      { title: "ANNEX A: 93 CONTROLS, 4 THEMES", c: "green", blocks: [
        { t: "table", head: ["Theme", "Controls", "Examples"], rows: [
          ["A.5 Organisational", "37", "Policies, supplier relationships, threat intelligence"],
          ["A.6 People", "8", "Screening, awareness training, remote working"],
          ["A.7 Physical", "14", "Secure areas, clear desk, equipment"],
          ["A.8 Technological", "34", "Access control, cryptography, logging, secure coding"]] },
        { t: "callout", text: "The 2022 edition cut 114 controls down to 93 and added 11 new ones, including threat intelligence and secure coding." },
      ]},
    ]},
    { t: "note", title: "Remember:", text: "You can't exclude clauses 4–10, they're all mandatory. You can exclude Annex A controls, but you must justify each exclusion in the SoA." },
  ],
});

LEARN.push({
  id: "how-audit-works", track: "grc", m: "audit", mins: 8, c: "navy",
  title: "How a certification audit works",
  sub: "From first contact to a certificate, and the three-year cycle that keeps it.",
  blocks: [
    { t: "timeline", title: "THE CERTIFICATION JOURNEY", items: [
      ["Prep", "Readiness / gap assessment", "Optional internal check: where does the ISMS fall short of the standard? Fix the gaps before the real audit."],
      ["Stage 1", "Documentation review", "The certification body checks your ISMS documents (scope, policy, SoA, risk assessment) and whether you're ready for Stage 2."],
      ["Stage 2", "Certification audit", "On site: the auditor gathers evidence that controls are implemented and effective. Nonconformities are raised here."],
      ["Decision", "Certificate issued", "After any major nonconformities are closed, the certificate is granted, valid for three years."],
      ["Years 2–3", "Surveillance audits", "Smaller annual audits confirm the ISMS is still maintained."],
      ["Year 3", "Recertification", "A full audit renews the certificate for another three years."]] },
    { t: "split", cols: [
      { title: "WHAT THE AUDITOR ACTUALLY DOES", c: "blue", blocks: [
        { t: "steps", title: "Testing one control", items: [
          "Read the requirement (standard, policy or law) — the audit criteria",
          "Pick a sample, e.g. 15 of 40 leavers",
          "Gather evidence: records, logs, screenshots, interviews",
          "Compare the evidence against the criteria",
          "Record conformity, or a nonconformity with the gap"],
          icons: [["doc", "Criteria"], ["list", "Sample"], ["search", "Evidence"], ["scale", "Compare"], ["flag", "Finding"]] },
        { t: "callout", text: "Evidence beats assertion. 'We disable leavers' isn't enough; the auditor checks HR dates against actual account status." },
      ]},
      { title: "FINDINGS, GRADED", c: "amber", blocks: [
        { t: "table", head: ["Finding", "Meaning"], rows: [
          ["Major NC", "A whole requirement isn't met, or a control has broken down"],
          ["Minor NC", "A single lapse against a requirement that otherwise works"],
          ["Observation / OFI", "Meets the requirement, but could be improved"],
          ["Conformity", "Requirement met, with evidence"]] },
        { t: "note", title: "Correction vs corrective action", text: "Correction fixes the one instance (disable that account). Corrective action removes the root cause (auto-disable from HR dates) so it can't recur. Auditors want both." },
      ]},
    ]},
    { t: "callout", text: "First, second and third party: a first-party audit is internal (you audit yourself), second-party is a customer auditing a supplier, and third-party is an independent certification body. Only a third party can certify you." },
  ],
});
