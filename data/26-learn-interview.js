// Learn, Interview prep track: the STAR method and worked example answers
// grounded in real cyber GRC experience. Pairs with the STAR coach (questionnaire).
LEARN.push({
  id: "star-method", track: "interview", m: "starq", mins: 7, c: "purple",
  title: "The STAR method",
  sub: "How to turn a behavioural question into a clear, scored story — structure, timing and the common traps.",
  blocks: [
    { t: "lead", text: "Behavioural questions (\"Tell me about a time you…\") are scored on **how you behaved**, not on the topic. **STAR** gives your answer a shape the panel can follow and mark: Situation, Task, Action, Result." },
    { t: "flow", title: "THE FOUR PARTS", items: [
      ["compass", "Situation", "set the scene briefly"],
      ["target", "Task", "your responsibility"],
      ["gear", "Action", "what YOU did"],
      ["chart", "Result", "the outcome, quantified"],
    ]},
    { t: "table", title: "HOW MUCH TIME ON EACH", head: ["Part", "Covers", "Share of answer"], rows: [
      ["Situation", "Context: where, when, the problem", "~15%"],
      ["Task", "Your specific goal or responsibility", "~10%"],
      ["Action", "The steps you personally took, in order", "~60%"],
      ["Result", "Outcome, impact and what you learned", "~15%"]] },
    { t: "split", cols: [
      { title: "DO", c: "green", blocks: [
        { t: "list", items: [
          "Say **\"I\"**, not \"we\" — the panel is scoring you, not your team",
          "Quantify the Result: a percentage, time saved, findings closed",
          "Pick a real, recent story you can defend under follow-up questions",
          "Match the story to the competency actually being asked about"] },
      ]},
      { title: "AVOID", c: "red", blocks: [
        { t: "list", items: [
          "A two-minute Situation and a five-second Result",
          "Hypotheticals (\"I would…\") — they want what you **did**",
          "Blaming colleagues, or dwelling on the problem",
          "Jargon with no outcome a manager would care about"] },
      ]},
    ]},
    { t: "callout", text: "The Action is the heart of the answer. If you remember one thing: spend most of your time on what you personally did, step by step." },
    { t: "note", title: "Prepare, don't memorise:", text: "Have 6–8 stories ready that each cover a different competency (a risk call, a conflict, a deadline, a mistake, a process you improved). You then reshape the same stories to fit most questions." },
  ],
});

LEARN.push({
  id: "star-grc", track: "interview", m: "starq", mins: 8, c: "blue",
  title: "STAR worked examples — GRC & risk",
  sub: "Three example answers you can adapt: building an ISMS, running a risk register, and catching a control gap.",
  blocks: [
    { t: "lead", text: "These are **example answers** in full STAR shape, drawn from real cyber GRC work. Use them as templates: keep the structure, swap in your own detail." },
    { t: "table", title: "\"Tell me about a time you improved security governance.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "At C-DAC, a government high-performance-computing centre, information security was handled ad hoc with no formal ISMS, which blocked national compliance requirements."],
      ["Task", "As the GRC lead I was asked to stand up an ISO/IEC 27001:2022-aligned ISMS the organisation could be certified and held to."],
      ["Action", "I ran a gap assessment across the Annex A controls, drafted the policies, standards and procedures, built the Statement of Applicability and risk treatment plan, and walked each department through the controls they owned."],
      ["Result", "The ISMS was adopted as official Government of India cybersecurity guidance, and internal audit readiness improved by about 30%."]] },
    { t: "table", title: "\"Describe how you manage risk.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "C-DAC had no single view of its cyber risks, so treatment decisions were inconsistent and hard to defend."],
      ["Task", "I was to build and maintain a cyber risk register the leadership could actually use to make decisions."],
      ["Action", "I identified and logged 150+ threats, scored each on likelihood and impact, assigned an owner and a treatment option (modify, retain, avoid or share), and tracked every action to closure with a review date."],
      ["Result", "Leadership got a prioritised, living view of risk, and the register became the backbone of our audit evidence and reporting."]] },
    { t: "table", title: "\"A time you found a serious control gap.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "During an internal audit against ISO 27001 and SOC 2, I was sampling the joiner–mover–leaver process."],
      ["Task", "Confirm that system access was actually removed promptly when staff left."],
      ["Action", "I pulled a sample of recent leavers, compared HR records against active accounts, found several still enabled, raised a nonconformity with the evidence, and agreed a corrective action with the system owner."],
      ["Result", "The accounts were disabled, offboarding was fixed with a dual HR/IT check, and the gap was closed before recertification."]] },
    { t: "callout", text: "Notice the pattern in all three: one line of Situation, a crisp Task, the bulk on your Actions, and a Result with a number or a closed loop." },
  ],
});

LEARN.push({
  id: "star-audit", track: "interview", m: "starq", mins: 8, c: "navy",
  title: "STAR worked examples — audit, compliance & stakeholders",
  sub: "Harder competencies: handling pushback, standing up third-party risk, and delivering to a hard deadline.",
  blocks: [
    { t: "lead", text: "GRC interviews probe judgement and people skills as much as technical knowledge. These examples show how to put the *decision* in the Action, not just the task." },
    { t: "table", title: "\"A time you dealt with a difficult stakeholder.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "During a gap assessment a department head disputed a finding, worried it made his team look bad."],
      ["Task", "Get the control remediated without damaging a working relationship I'd need again."],
      ["Action", "I took it offline, showed the evidence against the specific ISO clause rather than my opinion, reframed it as shared organisational risk, and offered a realistic timeline his team could own."],
      ["Result", "He signed up to the fix, it closed on time, and he became a reliable contact for later audits."]] },
    { t: "table", title: "\"How have you managed third-party risk?\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "At Cybrlytics, a financial-sector client was onboarding vendors with no consistent security due diligence."],
      ["Task", "Introduce a repeatable third-party risk assessment the client could run themselves."],
      ["Action", "I built a questionnaire mapped to ISO 27001 and PCI-DSS, assessed each supplier's responses and evidence, scored residual risk, and tracked gaps to closure with their procurement team."],
      ["Result", "The client reached full regulatory alignment on supplier assurance and kept a reusable process for new vendors."]] },
    { t: "table", title: "\"A time you worked to a tight deadline.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "A WebTrust assessment for India's Root Certifying Authority had a fixed external deadline."],
      ["Task", "Gather and test evidence across the control set in time for the assessment."],
      ["Action", "I prioritised the highest-risk control areas first, ran testing in parallel, kept a daily evidence tracker, and escalated blockers to control owners early rather than at the end."],
      ["Result", "Evidence was ready on schedule and the assessment completed with no slippage."]] },
    { t: "note", title: "Framing tip for GRC:", text: "Auditors and risk analysts are hired for judgement. In the Action, show *how you decided* — the clause, the risk, the trade-off — not just the task you ticked off." },
  ],
});

LEARN.push({
  id: "star-secops", track: "interview", m: "starq", mins: 7, c: "teal",
  title: "STAR worked examples — security operations",
  sub: "Technical stories told the behavioural way: an incident, an automation win, and prioritising vulnerabilities.",
  blocks: [
    { t: "lead", text: "Even hands-on stories are scored on behaviour — decision-making, communication and outcome. Keep the tooling light and the judgement visible." },
    { t: "table", title: "\"Walk me through an incident you handled.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "On the SOC team protecting HPC infrastructure, we saw alerts suggesting suspicious activity on a critical system."],
      ["Task", "Triage, contain and resolve it without disrupting live research workloads."],
      ["Action", "I followed the incident-response plan: validated the alert, scoped the affected hosts, contained the system, preserved evidence, worked the root cause, and recorded lessons for our BCP/DRP."],
      ["Result", "The incident was contained with minimal disruption, and the lessons fed straight back into our response and continuity plans."]] },
    { t: "table", title: "\"A time you improved a process with automation.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "Our Security Onion monitoring was resource-heavy and getting hard to sustain."],
      ["Task", "Keep detection coverage while cutting the overhead."],
      ["Action", "I re-architected the monitoring pipeline and automated the repetitive tuning and maintenance work that was eating capacity."],
      ["Result", "Resource utilisation dropped by about 40% with detection coverage intact."]] },
    { t: "table", title: "\"How do you prioritise vulnerabilities?\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "Clients received long VAPT reports and didn't know what to fix first."],
      ["Task", "Turn raw findings into a defensible priority order they could act on."],
      ["Action", "I scored findings with CVSS, mapped them to MITRE ATT&CK techniques to show real attacker impact, and grouped remediation by risk against effort."],
      ["Result", "Critical exposure time fell by around 25% because teams fixed the things that mattered first."]] },
    { t: "callout", text: "Resist the urge to narrate every command. The panel wants why you made each call and what changed as a result." },
  ],
});

LEARN.push({
  id: "star-map", track: "interview", m: "starq", mins: 6, c: "amber",
  title: "Which story for which question",
  sub: "Prepare one strong story per competency, then map the question to a story on the spot.",
  blocks: [
    { t: "lead", text: "Most behavioural questions are variations on a handful of competencies. Prepare one solid story for each, and you can answer almost anything by reaching for the closest match." },
    { t: "table", title: "COMPETENCY → YOUR GO-TO STORY", head: ["If they ask about…", "Reach for…"], rows: [
      ["Leadership / ownership", "Building the ISO 27001 ISMS at C-DAC"],
      ["Risk judgement", "Running the 150+ item cyber risk register"],
      ["Attention to detail", "The leaver-access audit finding"],
      ["Handling conflict", "The disputed audit finding with a department head"],
      ["Working under pressure", "The WebTrust assessment deadline"],
      ["Influencing non-technical people", "Explaining risk for leadership reporting"],
      ["Process improvement", "Automating Security Onion monitoring (−40%)"],
      ["Dealing with ambiguity", "Standing up third-party risk from scratch"]] },
    { t: "split", cols: [
      { title: "QUICK OPENERS", c: "green", blocks: [
        { t: "list", items: [
          "\"A good example of that was when…\"",
          "\"The situation was…, and my job was to…\"",
          "Name the company and your role in one line, then move to the Action"] },
      ]},
      { title: "IF YOU BLANK", c: "blue", blocks: [
        { t: "list", items: [
          "Buy a moment: \"Let me pick the best example\" is completely fine",
          "Fall back to your ISMS or risk-register story — they fit most prompts",
          "Answer the competency even if the story isn't a perfect match"] },
      ]},
    ]},
    { t: "note", title: "Pair it with the coach:", text: "Open the **STAR interview coach** from the home screen to practise these out loud against the timer, then come back here to tighten the structure." },
  ],
});
