// Learn, Fundamentals track: the comprehensive ports & protocols reference.
LEARN.push({
  id: "ports", track: "fund", m: "netf", mins: 9, c: "navy",
  title: "Ports & protocols reference",
  sub: "The port numbers worth memorising, grouped by what they do. T = TCP, U = UDP.",
  blocks: [
    { t: "lead", text: "A **port** is a numbered door on a host (0-65535). The IP address finds the machine; the port finds the service on it. **Well-known ports** are 0-1023. Learn these cold, they come up in interviews, firewall rules and log analysis constantly." },
    { t: "split", cols: [
      { title: "WEB", c: "blue", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["80 T", "HTTP"], ["443 T", "HTTPS (HTTP over TLS)"], ["8080 T", "HTTP alternate / proxy"], ["8443 T", "HTTPS alternate"]] },
      ]},
      { title: "EMAIL", c: "purple", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["25 T", "SMTP (server to server)"], ["587 T", "SMTP submission (TLS)"], ["465 T", "SMTPS (legacy TLS)"], ["110 T", "POP3"], ["995 T", "POP3S"], ["143 T", "IMAP"], ["993 T", "IMAPS"]] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "REMOTE ACCESS & MANAGEMENT", c: "red", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["22 T", "SSH / SFTP / SCP"], ["23 T", "Telnet (clear text, avoid)"], ["3389 T", "RDP (Windows remote desktop)"], ["5900 T", "VNC"], ["5985 T", "WinRM (HTTP)"], ["5986 T", "WinRM (HTTPS)"]] },
      ]},
      { title: "FILE TRANSFER & SHARING", c: "teal", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["20 T", "FTP data"], ["21 T", "FTP control"], ["69 U", "TFTP"], ["445 T", "SMB / CIFS (Windows shares)"], ["139 T", "NetBIOS session (legacy SMB)"], ["2049 T", "NFS"]] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "NAMES, ADDRESSES & TIME", c: "green", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["53 T/U", "DNS (U for lookups, T for zone transfer)"], ["853 T", "DNS over TLS"], ["67 U", "DHCP server"], ["68 U", "DHCP client"], ["123 U", "NTP (time)"], ["137/138 U", "NetBIOS name / datagram"]] },
      ]},
      { title: "DIRECTORY & AUTHENTICATION", c: "amber", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["88 T/U", "Kerberos"], ["389 T/U", "LDAP"], ["636 T", "LDAPS"], ["3268 T", "Global Catalog (AD)"], ["3269 T", "Global Catalog (TLS)"], ["1812/1813 U", "RADIUS (auth / accounting)"]] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "DATABASES", c: "navy", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["1433 T", "Microsoft SQL Server"], ["1521 T", "Oracle"], ["3306 T", "MySQL / MariaDB"], ["5432 T", "PostgreSQL"], ["6379 T", "Redis"], ["27017 T", "MongoDB"], ["9200 T", "Elasticsearch"]] },
      ]},
      { title: "MANAGEMENT, VPN & LOGS", c: "blue", blocks: [
        { t: "table", head: ["Port", "Service"], rows: [
          ["161/162 U", "SNMP / SNMP trap"], ["514 U", "Syslog"], ["500 U", "IKE (IPsec VPN)"], ["4500 U", "IPsec NAT-T"], ["1194 U/T", "OpenVPN"], ["1701 U", "L2TP"], ["1723 T", "PPTP (legacy)"]] },
      ]},
    ]},
    { t: "note", title: "Secure vs insecure pairs:", text: "Many protocols have a plain and a TLS version. Prefer the secure one: HTTPS over HTTP, SSH over Telnet, SFTP over FTP, LDAPS over LDAP, IMAPS/POP3S over IMAP/POP3, SNMPv3 over v1/v2c." },
    { t: "callout", text: "You don't need all 65,536. Know the well-known ones above, and remember the ranges: 0-1023 well-known, 1024-49151 registered, 49152-65535 dynamic/ephemeral (the random source port your client uses)." },
  ],
});

LEARN.push({
  id: "ip-subnet", track: "fund", m: "netf", mins: 8, c: "green",
  title: "IP addressing & subnetting",
  sub: "How IPv4 addresses are built, public vs private, CIDR, and the subnet maths you actually need.",
  blocks: [
    { t: "lead", text: "An **IPv4 address** is 32 bits, written as four octets (e.g. `192.168.1.10`). Part of it identifies the **network**, part identifies the **host**. The **subnet mask** (or CIDR suffix) says where that split is." },
    { t: "split", cols: [
      { title: "PRIVATE RANGES (RFC 1918)", c: "blue", blocks: [
        { t: "table", head: ["Range", "CIDR", "Size"], rows: [
          ["10.0.0.0 - 10.255.255.255", "/8", "~16.7M"], ["172.16.0.0 - 172.31.255.255", "/12", "~1M"], ["192.168.0.0 - 192.168.255.255", "/16", "65,536"]] },
        { t: "callout", text: "Private addresses aren't routable on the internet; **NAT** translates them to a public IP at the router. That's why your home devices all share one public address." },
      ]},
      { title: "ADDRESSES YOU SHOULD RECOGNISE", c: "amber", blocks: [
        { t: "table", head: ["Address", "Meaning"], rows: [
          ["127.0.0.1", "Loopback (localhost)"], ["169.254.x.x", "APIPA (no DHCP reply)"], ["0.0.0.0", "This host / any"], [".255 (typically)", "Broadcast for the subnet"], ["8.8.8.8", "Public (Google DNS)"]] },
      ]},
    ]},
    { t: "table", title: "CIDR ↔ SUBNET MASK ↔ HOSTS", head: ["CIDR", "Mask", "Usable hosts", "Typical use"], rows: [
      ["/8", "255.0.0.0", "16,777,214", "Very large network"],
      ["/16", "255.255.0.0", "65,534", "Large site"],
      ["/24", "255.255.255.0", "254", "A typical LAN"],
      ["/25", "255.255.255.128", "126", "Half a /24"],
      ["/26", "255.255.255.192", "62", "Small segment"],
      ["/27", "255.255.255.224", "30", "Small office"],
      ["/30", "255.255.255.252", "2", "Point-to-point link"]] },
    { t: "split", cols: [
      { title: "THE MATHS IN ONE BREATH", c: "green", blocks: [
        { t: "list", items: [
          "Host bits = 32 - CIDR (e.g. /24 -> 8 host bits)",
          "Total addresses = 2^(host bits) (8 bits -> 256)",
          "Usable hosts = that minus 2 (network + broadcast)",
          "So a /24 = 256 - 2 = **254** usable hosts"] },
      ]},
      { title: "IPv6 IN ONE PANEL", c: "purple", blocks: [
        { t: "lead", text: "IPv6 is **128 bits**, written in hex groups: `2001:db8::1`. No more address shortage, and NAT is largely unnecessary." },
        { t: "list", items: ["`::` compresses one run of zeros", "`fe80::/10` = link-local (like APIPA)", "`::1` = loopback", "No broadcast; uses multicast instead"] },
      ]},
    ]},
    { t: "note", title: "Why it matters for security:", text: "Segmentation is subnetting with intent: put finance, guests and servers in separate subnets so a firewall can control what crosses between them. Reading an IP and its mask tells you which network a host is on." },
  ],
});
