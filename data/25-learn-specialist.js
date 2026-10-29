// Learn, Specialist additions: social engineering & physical security (defensive/awareness framing).
LEARN.push({
  id: "social-eng", track: "ics", m: "phys", mins: 7, c: "purple",
  title: "Social engineering & phishing",
  sub: "How attackers target people instead of systems, the techniques to recognise, and how to resist them.",
  blocks: [
    { t: "lead", text: "Social engineering attacks the **human**, not the firewall. It's the most common way in, because it's easier to trick a person than to break strong encryption. Recognising it is the defence." },
    { t: "table", title: "THE TECHNIQUES", head: ["Name", "How it works"], rows: [
      ["Phishing", "Fraudulent email to steal data or deliver malware"],
      ["Spear phishing", "Phishing tailored to a specific person"],
      ["Whaling", "Targeting a senior executive (CEO/CFO)"],
      ["Smishing / Vishing", "The same by SMS / by voice call"],
      ["Quishing", "A malicious QR code"],
      ["BEC", "Business Email Compromise: fake payment requests"],
      ["Pretexting", "Inventing a scenario to build trust"],
      ["Baiting", "Leaving infected USB sticks to be found"],
      ["Tailgating", "Following someone through a secure door"]] },
    { t: "split", cols: [
      { title: "WHY IT WORKS (CIALDINI)", c: "amber", blocks: [
        { t: "list", items: [
          "**Authority**: pretending to be the boss or IT",
          "**Urgency / scarcity**: 'act now or lose access'",
          "**Social proof**: 'everyone else has done it'",
          "**Liking / reciprocity**: friendliness, a small favour first",
          "**Fear**: threats of consequences"] },
        { t: "callout", text: "The common thread is pressure to skip normal checks. Urgency plus a request to move money or credentials is the red flag." },
      ]},
      { title: "HOW TO RESIST", c: "green", blocks: [
        { t: "list", items: [
          "Verify unusual requests on a **known** channel (call back a saved number)",
          "Hover links; check the real sender domain",
          "Use dual approval for payments and bank-detail changes",
          "Report, don't just delete, so others are warned",
          "MFA limits the damage of a stolen password"] },
        { t: "note", title: "Email defences", text: "SPF, DKIM and DMARC help prove a sender is genuine; DMARC p=reject tells receivers to drop spoofed mail." },
      ]},
    ]},
    { t: "note", title: "Deepfakes raise the bar:", text: "AI can now fake a familiar voice or face on a call to approve a transfer. A call-back on a trusted number, and dual approval, beat a convincing impersonation." },
  ],
});

LEARN.push({
  id: "physical-sec", track: "ics", m: "phys", mins: 6, c: "navy",
  title: "Physical security",
  sub: "The controls that protect buildings, equipment and people, and where they fit the layered model.",
  blocks: [
    { t: "lead", text: "Security that ignores the physical world has a gap: if someone can walk up to a server, plug in a device or tailgate through a door, logical controls can be bypassed. Physical security is the first layer." },
    { t: "flow", title: "DEFENCE IN DEPTH, OUTSIDE IN", items: [
      ["building", "Perimeter", "fences, gates, lighting"],
      ["eye", "Surveillance", "CCTV, guards, sensors"],
      ["lock", "Entry control", "badges, mantraps, locks"],
      ["server", "Inside", "locked racks, cages"],
      ["key", "Device", "port locks, disk encryption"],
    ]},
    { t: "split", cols: [
      { title: "CONTROLS & CONCEPTS", c: "blue", blocks: [
        { t: "table", head: ["Control", "Does"], rows: [
          ["Access vestibule (mantrap)", "Only one of two doors opens at once; stops tailgating"],
          ["CCTV", "Deters and records (detective)"],
          ["Security guards", "Can judge and adapt to the unexpected"],
          ["Badge / biometric readers", "Control and log who enters"],
          ["Bollards / barriers", "Stop vehicles"]] },
      ]},
      { title: "GOOD PRACTICES", c: "green", blocks: [
        { t: "list", items: [
          "**Fail-safe** locks unlock on power loss (life safety); **fail-secure** stay locked (asset protection)",
          "Data centres use pre-action sprinklers to cut accidental water damage",
          "Clear desk / clear screen stops shoulder surfing and theft",
          "Privacy screens in public places",
          "**CPTED**: design spaces to discourage crime"] },
        { t: "callout", text: "Life safety always wins: exits must let people out even when that means a door is easier to open from inside." },
      ]},
    ]},
    { t: "note", title: "It ties back to data protection:", text: "A stolen, unencrypted laptop is a personal data breach. Full-disk encryption turns a physical loss into a non-event, which is why the two layers work together." },
  ],
});
