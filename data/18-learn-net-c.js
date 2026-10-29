// Learn, Fundamentals track: DNS, HTTP and the web.
LEARN.push({
  id: "dns-http", track: "fund", m: "netf", mins: 8, c: "purple",
  title: "DNS, HTTP & the web",
  sub: "How names become addresses, the HTTP methods and status codes, and the headers that keep sites safe.",
  blocks: [
    { t: "split", cols: [
      { title: "DNS: NAMES TO ADDRESSES", c: "blue", blocks: [
        { t: "lead", text: "The **Domain Name System** turns `example.com` into an IP address. It's a hierarchy: root -> top-level domain (.com) -> the domain's own name servers." },
        { t: "steps", title: "A lookup, step by step", items: [
          "Your device asks its resolver (often the ISP or 8.8.8.8)",
          "Resolver asks a root server, then the .com servers",
          "They point to example.com's authoritative name server",
          "It returns the A record; the resolver caches it for the TTL"],
          icons: [["cpu", "You"], ["globe", "Root"], ["server", "TLD"], ["check", "Answer"]] },
      ]},
      { title: "DNS RECORD TYPES", c: "teal", blocks: [
        { t: "table", head: ["Record", "Points a name to"], rows: [
          ["A", "An IPv4 address"], ["AAAA", "An IPv6 address"], ["CNAME", "Another name (alias)"], ["MX", "A mail server"], ["TXT", "Free text (SPF, DKIM, verification)"], ["NS", "A name server"], ["SOA", "Zone's authority info"], ["PTR", "An IP back to a name (reverse)"], ["SRV", "A service's host and port"], ["CAA", "Which CAs may issue certs"]] },
      ]},
    ]},
    { t: "split", cols: [
      { title: "HTTP METHODS", c: "green", blocks: [
        { t: "table", head: ["Method", "Does"], rows: [
          ["GET", "Read a resource (no changes)"], ["POST", "Create / submit data"], ["PUT", "Replace a resource"], ["PATCH", "Partially update"], ["DELETE", "Remove a resource"], ["HEAD", "Headers only, no body"], ["OPTIONS", "What methods are allowed"]] },
        { t: "callout", text: "GET puts data in the URL (logged everywhere); POST puts it in the body. Never send passwords by GET." },
      ]},
      { title: "STATUS CODE FAMILIES", c: "amber", blocks: [
        { t: "table", head: ["Range", "Means", "Examples"], rows: [
          ["1xx", "Informational", "100 Continue"], ["2xx", "Success", "200 OK, 201 Created"], ["3xx", "Redirect", "301, 302, 304"], ["4xx", "Client error", "400, 401, 403, 404, 429"], ["5xx", "Server error", "500, 502, 503"]] },
        { t: "note", title: "Easy mix-up", text: "**401 Unauthorized** = you're not authenticated (log in). **403 Forbidden** = you're authenticated but not allowed." },
      ]},
    ]},
    { t: "grid", title: "SECURITY HEADERS WORTH KNOWING", items: [
      { icon: "lock", name: "Strict-Transport-Security", text: "HSTS: forces HTTPS for the domain, so a downgrade to HTTP can't happen." },
      { icon: "shield", name: "Content-Security-Policy", text: "CSP: controls which scripts and sources may load, the main defence-in-depth against XSS." },
      { icon: "eye", name: "X-Content-Type-Options", text: "`nosniff`: stops the browser guessing (and mis-running) content types." },
      { icon: "box", name: "X-Frame-Options", text: "Stops your page being framed by others: anti-clickjacking (now also CSP frame-ancestors)." },
      { icon: "key", name: "Set-Cookie flags", text: "`HttpOnly` hides a cookie from JavaScript, `Secure` sends it only over HTTPS, `SameSite` limits cross-site sending." },
      { icon: "globe", name: "CORS headers", text: "Access-Control-Allow-Origin decides which other sites may read a response. A reflected `*` with credentials is dangerous." },
    ]},
    { t: "callout", text: "Put it together: DNS finds the server, TCP + TLS connect to port 443, HTTP carries the request and response, and the security headers tell the browser how to behave safely." },
  ],
});
