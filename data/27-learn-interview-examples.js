// Learn, Interview prep track: additional worked STAR examples covering more competencies.
LEARN.push({
  id: "star-ex-grow", track: "interview", m: "starq", mins: 8, c: "green",
  title: "More STAR examples — initiative, teamwork & learning",
  sub: "Four more worked answers: showing initiative, learning fast, leading a team, and owning a mistake.",
  blocks: [
    { t: "lead", text: "Panels probe how you grow and work with others as much as what you know. Here are four more **example answers** in full STAR shape — adapt them to your own experience." },
    { t: "table", title: "\"Tell me about a time you showed initiative.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "At Alphaport, security checks in the delivery pipeline were manual and inconsistent, so issues were caught late."],
      ["Task", "Nobody had asked, but I saw the gap and decided to close it."],
      ["Action", "I introduced automated SAST and DAST gates into the CI/CD workflow, tuned them to cut noise, and showed developers how to read and act on the findings."],
      ["Result", "Vulnerabilities were caught before release instead of in production, and developers got fast, actionable feedback."]] },
    { t: "table", title: "\"A time you had to learn something quickly.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "My MSc work and role pushed me into Compliance as Code, which I hadn't used before."],
      ["Task", "Get productive with the tooling fast enough to build a working pipeline."],
      ["Action", "Over a few weeks I taught myself OSCAL, OpenSCAP and Checkov by building a policy-as-code pipeline that checked controls automatically, learning from the docs and by iterating on real failures."],
      ["Result", "I could automate control checks that used to be manual, and it became my dissertation specialism."]] },
    { t: "table", title: "\"A time you worked as part of a team.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "Leading the SOC team at C-DAC, a major monitoring migration needed everyone pulling the same way."],
      ["Task", "Move to the new Security Onion setup without losing detection coverage."],
      ["Action", "I split the work to people's strengths, paired junior analysts on the harder tasks so they learned, and ran short daily syncs to clear blockers."],
      ["Result", "We completed the migration with coverage intact and the juniors came out more capable."]] },
    { t: "table", title: "\"Tell me about a mistake you made.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "Early at Cybrlytics, I included a finding in a client VAPT report that turned out to be a false positive."],
      ["Task", "Put it right and make sure it didn't happen again."],
      ["Action", "I owned it straight away, corrected the report with the client, and from then on validated every finding with a second check and evidence before it went out."],
      ["Result", "My reports became more trusted, and that validation step became a standard part of my process."]] },
    { t: "callout", text: "A good 'mistake' answer is honest, not catastrophic: a real slip, owned quickly, with a concrete change that stuck. Panels are testing self-awareness, not looking for disasters." },
  ],
});

LEARN.push({
  id: "star-ex-judge", track: "interview", m: "starq", mins: 8, c: "teal",
  title: "More STAR examples — judgement & communication",
  sub: "Four more worked answers: pushing back, competing priorities, explaining risk simply, and acting with integrity.",
  blocks: [
    { t: "lead", text: "These competencies are where GRC candidates win or lose: can you disagree well, prioritise under load, make risk understandable, and do the right thing consistently?" },
    { t: "table", title: "\"A time you disagreed with a decision.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "A project team wanted to accept a high risk to hit a release date."],
      ["Task", "Make the risk visible and get a proper decision, without just blocking the team."],
      ["Action", "I laid out the likelihood and impact in plain terms, offered a lighter compensating control that bought time, and escalated the call to a risk owner with the authority to make it."],
      ["Result", "The owner chose the compensating control, so the risk was managed and documented rather than quietly accepted."]] },
    { t: "table", title: "\"A time you juggled competing priorities.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "At C-DAC I was running internal audits, maintaining the risk register and supporting VAPT at the same time."],
      ["Task", "Deliver the time-critical work without dropping anything high-risk."],
      ["Action", "I triaged by deadline and risk, blocked protected time for the audit evidence that had a fixed external date, and was upfront with stakeholders about what would land when."],
      ["Result", "The time-critical audit completed on schedule and nothing high-risk slipped."]] },
    { t: "table", title: "\"Explaining something technical to a non-technical audience.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "Leadership had to approve risk treatment but didn't follow the technical detail."],
      ["Task", "Give them enough to make a confident funding decision."],
      ["Action", "I translated each risk into business impact with a simple high/medium/low rating and a recommended action, and used the risk register as a one-page view rather than technical reports."],
      ["Result", "They could decide quickly and signed off the treatment plan and its budget."]] },
    { t: "table", title: "\"A time you acted with integrity.\"", head: ["STAR", "Example answer"], rows: [
      ["Situation", "During an audit I found an access-control gap that involved a senior person's account."],
      ["Task", "Handle it correctly without it becoming political."],
      ["Action", "I reported it exactly as I would any other finding — factual, with the evidence and the relevant clause — and proposed the same corrective action I'd apply to anyone."],
      ["Result", "It was remediated like any other nonconformity, and treating it consistently protected both the finding and the relationship."]] },
    { t: "note", title: "The thread through all four:", text: "Show your reasoning. In GRC the panel is buying your judgement, so the Action should make clear *why* you chose what you did, not just what you did." },
  ],
});
