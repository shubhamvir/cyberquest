// Learn, GRC track, part 2: audit types, NIST CSF, SOC 2, GDPR.
LEARN.push({
  id: "audit-types", track: "grc", m: "audit", mins: 7, c: "teal",
  title: "Types of audit & assurance reports",
  sub: "Different audits answer different questions. Here's who does each, against what, and for whom.",
  blocks: [
    { t: "grid", title: "COMMON AUDIT TYPES", items: [
      { icon: "shield", name: "Internal audit", text: "Independent assurance from within the organisation on how well governance, risk and controls work.", k: [["Against", "policies, risk appetite"], ["For", "management and the board"]] },
      { icon: "scale", name: "Compliance audit", text: "Checks conformity with laws, regulations, contracts or policies.", k: [["Against", "rules and obligations"], ["For", "regulators, customers"]] },
      { icon: "gear", name: "Operational audit", text: "Looks at whether processes are effective and efficient, not just compliant.", k: [["Against", "process performance"], ["For", "process owners"]] },
      { icon: "cpu", name: "IT / cybersecurity audit", text: "Evaluates technology governance, security, resilience and data controls.", k: [["Against", "digital risk and controls"], ["For", "CISO, management"]] },
      { icon: "badge", name: "Management system audit", text: "Audits a system (like an ISMS) against a standard using structured, evidence-based method.", k: [["Against", "ISO 27001, 9001…"], ["For", "certification"]] },
      { icon: "coins", name: "Financial statement audit", text: "Independent opinion that the financial statements are free from material misstatement.", k: [["Against", "accounting standards"], ["For", "investors, lenders"]] },
    ]},
    { t: "split", cols: [
      { title: "FIRST / SECOND / THIRD PARTY", c: "blue", blocks: [
        { t: "table", head: ["Party", "Who audits whom"], rows: [
          ["First", "You audit your own organisation (internal audit)"],
          ["Second", "A customer audits its supplier"],
          ["Third", "An independent body audits you (certification, attestation)"]] },
        { t: "callout", text: "Independence rises left to right, and so does the weight others give the result." },
      ]},
      { title: "ASSURANCE REPORTS YOU'LL MEET", c: "green", blocks: [
        { t: "table", head: ["Report", "What it covers"], rows: [
          ["SOC 1", "Controls relevant to customers' financial reporting"],
          ["SOC 2", "Security, availability, processing integrity, confidentiality, privacy"],
          ["SOC 3", "A public, summary version of SOC 2"],
          ["ISO 27001 cert", "That an ISMS meets the standard"]] },
        { t: "note", title: "Type I vs Type II", text: "A SOC 2 Type I checks control design on one date. A Type II also tests that controls operated effectively over a period (often 6–12 months), so it carries more weight." },
      ]},
    ]},
    { t: "callout", text: "Specialist audits exist too: fraud audits examine suspected wrongdoing, ESG audits review sustainability data, and supplier audits check a vendor's own controls. Same method, different scope and criteria." },
  ],
});

LEARN.push({
  id: "nist-csf", track: "grc", m: "nist", mins: 6, c: "purple",
  title: "NIST Cybersecurity Framework 2.0",
  sub: "A voluntary, flexible way to understand and talk about cyber risk, built on six functions.",
  blocks: [
    { t: "flow", title: "THE SIX FUNCTIONS (2.0 ADDED GOVERN)", items: [
      ["compass", "Govern", "strategy, oversight"],
      ["search", "Identify", "assets & risks"],
      ["shield", "Protect", "safeguards"],
      ["radar", "Detect", "spot attacks"],
      ["alert", "Respond", "contain & report"],
      ["refresh", "Recover", "restore & learn"],
    ]},
    { t: "split", cols: [
      { title: "WHY TEAMS USE IT", c: "blue", blocks: [
        { t: "list", items: [
          "Free and voluntary, not a certification",
          "Technology-neutral: says what to achieve, not how",
          "A common language from analyst to board",
          "Govern sits at the centre and shapes the other five",
          "Maps to ISO 27001, SOC 2 and CIS Controls, so one control can evidence several frameworks"] },
      ]},
      { title: "HOW IT'S STRUCTURED", c: "amber", blocks: [
        { t: "table", head: ["Level", "Example"], rows: [
          ["Function", "Protect (PR)"], ["Category", "PR.AA — Identity & Access Control"], ["Subcategory", "A specific outcome to achieve"]] },
        { t: "note", title: "Profiles & Tiers", text: "A Current vs Target profile shows the gap and what to prioritise. Four Tiers (Partial → Adaptive) describe how rigorous your risk practices are, they're not a maturity score to certify." },
      ]},
    ]},
    { t: "callout", text: "ISO 27001 vs NIST CSF: ISO is a certifiable management-system standard; the CSF is a flexible risk framework with no certificate. Many organisations use the CSF to assess posture and ISO 27001 to certify it." },
  ],
});

LEARN.push({
  id: "gdpr-map", track: "grc", m: "gdpr", mins: 7, c: "green",
  title: "GDPR on one page",
  sub: "The principles, the lawful bases, people's rights and the breach clock, for anyone handling EU personal data.",
  blocks: [
    { t: "split", cols: [
      { title: "THE SEVEN PRINCIPLES", c: "blue", blocks: [
        { t: "list", items: [
          "Lawfulness, fairness and transparency",
          "Purpose limitation: only use data for the stated reason",
          "Data minimisation: collect only what you need",
          "Accuracy: keep it correct and up to date",
          "Storage limitation: don't keep it longer than needed",
          "Integrity and confidentiality: keep it secure",
          "Accountability: be able to demonstrate all of the above"] },
      ]},
      { title: "SIX LAWFUL BASES (ARTICLE 6)", c: "amber", blocks: [
        { t: "list", items: ["Consent", "Contract", "Legal obligation", "Vital interests", "Public task", "Legitimate interests"] },
        { t: "callout", text: "You need a lawful basis before you process. 'It's useful for us' is not one of them. Consent must be freely given, specific, informed and easy to withdraw." },
      ]},
    ]},
    { t: "grid", title: "KEY ROLES", items: [
      { icon: "user", name: "Data subject", text: "The living person the data is about." },
      { icon: "badge", name: "Controller", text: "Decides why and how data is processed. Carries the accountability." },
      { icon: "gear", name: "Processor", text: "Processes data only on the controller's instructions (needs an Article 28 contract)." },
      { icon: "shield", name: "DPO", text: "Data Protection Officer: advises, monitors compliance and is the regulator's contact." },
    ]},
    { t: "split", cols: [
      { title: "DATA SUBJECT RIGHTS", c: "teal", blocks: [
        { t: "list", items: ["Be informed", "Access (a DSAR, answered within one month)", "Rectification", "Erasure ('right to be forgotten')", "Restrict processing", "Data portability", "Object", "Rights around automated decisions"] },
      ]},
      { title: "WHEN A BREACH HAPPENS", c: "red", blocks: [
        { t: "steps", title: "The clock starts at awareness", items: [
          "Contain the breach and assess the risk to people",
          "Notify the supervisory authority within **72 hours** if there's a risk",
          "Tell affected individuals without undue delay if the risk is **high**",
          "Record every breach, even those you don't report"],
          icons: [["lock", "Contain"], ["bell", "Notify"], ["users", "Inform"], ["doc", "Record"]] },
        { t: "callout", text: "A breach isn't only a hack. A misdirected email of personal data counts too. Max fines reach €20m or 4% of global turnover." },
      ]},
    ]},
  ],
});
