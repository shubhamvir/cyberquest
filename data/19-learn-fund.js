// Learn, Fundamentals track: security first principles and cryptography basics.
LEARN.push({
  id: "sec-basics", track: "fund", m: "fund", mins: 8, c: "red",
  title: "Security first principles",
  sub: "The vocabulary the whole field is built on: CIA, AAA, control types, and threat vs vulnerability vs risk.",
  blocks: [
    { t: "flow", title: "THE CIA TRIAD — THE GOAL OF ALL SECURITY", items: [
      ["lock", "Confidentiality", "only the right people see it"],
      ["check", "Integrity", "it isn't changed without authority"],
      ["refresh", "Availability", "it's there when needed"],
    ]},
    { t: "split", cols: [
      { title: "AAA — ACCESS, STEP BY STEP", c: "blue", blocks: [
        { t: "table", head: ["Term", "Question it answers"], rows: [
          ["Identification", "Who do you claim to be? (username)"], ["Authentication", "Can you prove it? (password, MFA)"], ["Authorisation", "What are you allowed to do?"], ["Accounting", "What did you actually do? (logs)"]] },
        { t: "note", title: "The three factors", text: "Something you **know** (password), something you **have** (phone, key), something you **are** (fingerprint). MFA = two or more different factors." },
      ]},
      { title: "THREAT vs VULNERABILITY vs RISK", c: "amber", blocks: [
        { t: "list", items: [
          "**Threat**: something that could cause harm (malware, a flood, an insider)",
          "**Vulnerability**: a weakness a threat can use (unpatched server, weak password)",
          "**Risk**: the chance and impact of a threat meeting a vulnerability"] },
        { t: "callout", text: "Risk = Likelihood × Impact. You reduce risk by removing the vulnerability, blocking the threat, or lessening the impact." },
      ]},
    ]},
    { t: "split", cols: [
      { title: "CONTROLS BY FUNCTION", c: "green", blocks: [
        { t: "table", head: ["Type", "Does what", "Example"], rows: [
          ["Preventive", "Stops it happening", "Firewall, MFA"],
          ["Detective", "Spots it", "IDS, logging, CCTV"],
          ["Corrective", "Fixes it after", "Restore from backup"],
          ["Deterrent", "Discourages it", "Warning sign"],
          ["Compensating", "Stands in for another", "Extra monitoring"]] },
      ]},
      { title: "CONTROLS BY NATURE", c: "teal", blocks: [
        { t: "table", head: ["Type", "Example"], rows: [
          ["Administrative", "Policies, training, procedures"],
          ["Technical (logical)", "Firewalls, encryption, access control"],
          ["Physical", "Locks, guards, fences"]] },
        { t: "note", title: "They stack", text: "A locked server room (physical), an access policy (administrative) and disk encryption (technical) all protect the same data." },
      ]},
    ]},
    { t: "grid", title: "PRINCIPLES THAT COME UP EVERYWHERE", items: [
      { icon: "key", name: "Least privilege", text: "Give each person or process only the access it needs to do its job, and no more." },
      { icon: "users", name: "Separation of duties", text: "Split a sensitive task so no single person can complete it alone (create vs approve a payment)." },
      { icon: "eye", name: "Need to know", text: "Access to specific information only when your duties actually require it." },
      { icon: "shield", name: "Defence in depth", text: "Layer independent controls so one failure doesn't breach everything." },
      { icon: "lock", name: "Fail secure", text: "When a control fails, default to denying access, not allowing it." },
      { icon: "compass", name: "Zero trust", text: "Never trust by network location; verify every request by identity, device and context." },
    ]},
  ],
});

LEARN.push({
  id: "crypto-basics", track: "fund", m: "cry", mins: 8, c: "purple",
  title: "Cryptography basics",
  sub: "Symmetric vs asymmetric vs hashing, what each is for, and the algorithms worth knowing by name.",
  blocks: [
    { t: "table", title: "THE THREE BUILDING BLOCKS", head: ["", "Symmetric", "Asymmetric", "Hashing"], rows: [
      ["Keys", "One shared secret key", "A public + private key pair", "No key (one-way)"],
      ["Reversible?", "Yes (encrypt/decrypt)", "Yes (encrypt/decrypt)", "No, cannot be undone"],
      ["Protects", "Confidentiality", "Confidentiality + identity", "Integrity"],
      ["Speed", "Fast", "Slow", "Very fast"],
      ["Examples", "AES, ChaCha20", "RSA, ECC, Diffie-Hellman", "SHA-256, SHA-3, bcrypt"]] },
    { t: "split", cols: [
      { title: "WHEN EACH IS USED", c: "blue", blocks: [
        { t: "list", items: [
          "**Symmetric** encrypts the actual data (fast): disk encryption, the bulk of a TLS session",
          "**Asymmetric** solves key exchange and identity: it safely shares the symmetric key and powers digital signatures",
          "**Hashing** proves data hasn't changed and stores passwords (never 'encrypt' a password, hash it)"] },
        { t: "callout", text: "TLS uses both: asymmetric to agree on a shared key and verify the certificate, then fast symmetric encryption for the rest." },
      ]},
      { title: "ALGORITHMS: USE vs AVOID", c: "red", blocks: [
        { t: "table", head: ["Use today", "Avoid (broken/weak)"], rows: [
          ["AES-256", "DES, 3DES"], ["RSA 2048+, ECC", "RSA 1024"], ["SHA-256, SHA-3", "MD5, SHA-1"], ["bcrypt, scrypt, Argon2", "Plain SHA for passwords"], ["TLS 1.2 / 1.3", "SSL, TLS 1.0/1.1"]] },
      ]},
    ]},
    { t: "steps", title: "A DIGITAL SIGNATURE (INTEGRITY + PROOF OF SENDER)", items: [
      "Sender hashes the message",
      "Sender encrypts that hash with their **private** key = the signature",
      "Receiver decrypts the signature with the sender's **public** key to get the hash",
      "Receiver hashes the message themselves and compares; a match proves it's genuine and unchanged"],
      icons: [["doc", "Hash"], ["key", "Sign"], ["stamp", "Verify"], ["check", "Trusted"]] },
    { t: "split", cols: [
      { title: "A COMMON CONFUSION", c: "amber", blocks: [
        { t: "table", head: ["Term", "Purpose", "Reversible?"], rows: [
          ["Encoding", "Format (Base64)", "Yes, no secret"], ["Encryption", "Confidentiality", "Yes, with a key"], ["Hashing", "Integrity", "No"]] },
        { t: "callout", text: "Base64 is not security. Anyone can decode it; it just makes binary data safe to transport as text." },
      ]},
      { title: "PASSWORD STORAGE DONE RIGHT", c: "green", blocks: [
        { t: "list", items: [
          "Never store passwords in plain text or 'encrypted'",
          "Hash with a slow algorithm: bcrypt, scrypt or Argon2",
          "Add a unique **salt** per password so identical passwords hash differently",
          "Slowness and salting defeat rainbow tables and brute force"] },
      ]},
    ]},
    { t: "note", title: "On the horizon:", text: "Large quantum computers would threaten RSA and ECC (via Shor's algorithm). NIST has standardised post-quantum algorithms (e.g. ML-KEM, ML-DSA); 'crypto-agility' means being able to swap algorithms without rebuilding everything." },
  ],
});
