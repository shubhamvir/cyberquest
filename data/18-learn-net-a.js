// Learn, Fundamentals track: the networking basics everyone in security should know cold.
LEARN.push({
  id: "osi-model", track: "fund", m: "netf", mins: 7, c: "blue",
  title: "The OSI & TCP/IP models",
  sub: "The 7 layers, what each one does, which protocols live where, and how data is wrapped on the way down.",
  blocks: [
    { t: "lead", text: "Networking is taught as **layers**. Each layer does one job and talks to the same layer on the other machine. The OSI model has 7 layers; the real-world TCP/IP model collapses them into 4." },
    { t: "table", title: "THE 7 OSI LAYERS (TOP TO BOTTOM)", head: ["#", "Layer", "Job", "Examples", "Unit"], rows: [
      ["7", "Application", "What the user's app speaks", "HTTP, DNS, SMTP, FTP, SSH", "Data"],
      ["6", "Presentation", "Format, encrypt, compress", "TLS, JPEG, ASCII", "Data"],
      ["5", "Session", "Start, manage, end sessions", "NetBIOS, RPC", "Data"],
      ["4", "Transport", "End-to-end delivery, ports", "TCP, UDP", "Segment"],
      ["3", "Network", "Logical addressing, routing", "IP, ICMP, routers", "Packet"],
      ["2", "Data Link", "Local delivery on one link", "Ethernet, MAC, switches, ARP", "Frame"],
      ["1", "Physical", "Bits on the wire or air", "Cables, Wi-Fi, hubs", "Bits"]] },
    { t: "split", cols: [
      { title: "REMEMBER THE ORDER", c: "amber", blocks: [
        { t: "list", items: [
          "Top down (7 to 1): **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing",
          "Bottom up (1 to 7): **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way"] },
        { t: "callout", text: "Attacks map to layers too: ARP spoofing is Layer 2, IP spoofing Layer 3, SYN floods Layer 4, and most web attacks Layer 7." },
      ]},
      { title: "TCP/IP MODEL (THE REAL ONE)", c: "green", blocks: [
        { t: "table", head: ["TCP/IP layer", "Covers OSI"], rows: [
          ["Application", "7, 6, 5"], ["Transport", "4"], ["Internet", "3"], ["Link / Network Access", "2, 1"]] },
        { t: "note", title: "Why two models?", text: "OSI is the teaching model; TCP/IP is what the internet actually runs on. Interviewers expect you to know both and how they line up." },
      ]},
    ]},
    { t: "steps", title: "ENCAPSULATION: HOW DATA GOES DOWN THE STACK", items: [
      "App data starts at Layer 7",
      "Transport adds a TCP/UDP header with port numbers -> segment",
      "Network adds source and destination IP -> packet",
      "Data Link adds MAC addresses and a trailer -> frame",
      "Physical sends it as bits; the receiver unwraps each layer in reverse"],
      icons: [["doc", "Data"], ["link", "Segment"], ["network", "Packet"], ["cpu", "Frame"], ["arrow", "Bits"]] },
    { t: "callout", text: "One line to keep: switches work at Layer 2 (MAC), routers at Layer 3 (IP), and firewalls can work from Layer 3 up to Layer 7 (next-gen)." },
  ],
});

LEARN.push({
  id: "tcp-udp", track: "fund", m: "netf", mins: 6, c: "teal",
  title: "TCP vs UDP & the handshake",
  sub: "The two transport protocols: one reliable and ordered, one fast and fire-and-forget.",
  blocks: [
    { t: "split", cols: [
      { title: "TCP — RELIABLE", c: "blue", blocks: [
        { t: "lead", text: "**Transmission Control Protocol.** Connection-oriented: it sets up a connection, numbers every byte, confirms delivery and re-sends what's lost." },
        { t: "list", items: ["Guarantees delivery and order", "Error checking and retransmission", "Flow and congestion control", "More overhead, slightly slower", "Used when every byte matters"] },
        { t: "callout", text: "Think web pages, email, file transfer: a missing piece would corrupt the result, so TCP is worth the overhead." },
      ]},
      { title: "UDP — FAST", c: "amber", blocks: [
        { t: "lead", text: "**User Datagram Protocol.** Connectionless: it just sends datagrams with no setup, no acknowledgement and no re-sending." },
        { t: "list", items: ["No guarantee of delivery or order", "No handshake, almost no overhead", "Much faster and lighter", "App must handle any loss itself", "Used when speed beats perfection"] },
        { t: "callout", text: "Think live video, voice, online games, DNS: a dropped packet is better than a delayed one." },
      ]},
    ]},
    { t: "steps", title: "THE TCP THREE-WAY HANDSHAKE (CONNECTION SETUP)", items: [
      "Client -> Server: **SYN** (let's talk, here's my starting sequence number)",
      "Server -> Client: **SYN-ACK** (OK, and here's mine)",
      "Client -> Server: **ACK** (got it, we're connected)",
      "Data now flows reliably in both directions"],
      icons: [["arrow", "SYN"], ["refresh", "SYN-ACK"], ["check", "ACK"], ["link", "Connected"]] },
    { t: "split", cols: [
      { title: "CLOSING A CONNECTION", c: "green", blocks: [
        { t: "lead", text: "TCP closes politely with a **FIN / ACK** exchange from each side (a four-way teardown). A sudden **RST** means 'reset now', often because the port is closed." },
      ]},
      { title: "QUICK COMPARISON", c: "navy", blocks: [
        { t: "table", head: ["", "TCP", "UDP"], rows: [
          ["Connection", "Yes", "No"], ["Reliable", "Yes", "No"], ["Ordered", "Yes", "No"], ["Speed", "Slower", "Faster"], ["Header", "20+ bytes", "8 bytes"]] },
      ]},
    ]},
    { t: "note", title: "Security angle:", text: "A SYN flood sends many SYNs and never finishes the handshake, exhausting the server's half-open connection table. SYN cookies are the defence." },
  ],
});
