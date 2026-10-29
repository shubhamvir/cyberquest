// Learn: one-page visual explainers. The toolkit track follows the C-DAC ITISS tools and technologies list,
// at overview level: what each tool is, what it's for, and how admins and defenders use it.
// Block types: split{cols:[{title,c,blocks}]}, lead{text}, steps{title,items,icons?}, table{title?,head,rows},
// list{title?,items}, callout{text}, grid{title,items:[{icon,name,text,k?}]}, flow{title,items:[[icon,label,sub?]]},
// note{title,text}, timeline{title,items:[[when,title,text]]}. Colours: blue green red amber purple teal navy.
// Text supports `code` and **bold**.
LEARN.push({
  id: "win-ad", track: "toolkit", m: "win", mins: 7, c: "blue",
  title: "Windows Server & Active Directory",
  sub: "The roles that run most company networks, what each one does, and how to keep them safe.",
  blocks: [
    { t: "split", cols: [
      { title: "ACTIVE DIRECTORY (AD DS)", c: "blue", blocks: [
        { t: "lead", text: "A directory of users, computers and groups, stored on **domain controllers** (DCs). It decides who you are and what you can reach across the whole domain." },
        { t: "steps", title: "How a domain sign-in works", items: [
          "You sign in on a domain-joined PC",
          "DNS finds a domain controller",
          "The DC checks your password and issues a Kerberos ticket",
          "Group Policy settings download and apply",
          "Your ticket opens file shares and apps without typing the password again"],
          icons: [["user", "Sign in"], ["network", "DNS"], ["key", "Kerberos"], ["doc", "GPO"], ["server", "Access"]] },
        { t: "table", title: "Ports to know", head: ["Port", "Used by"], rows: [
          ["53", "DNS"], ["88", "Kerberos"], ["389 / 636", "LDAP / LDAPS"], ["445", "SMB (SYSVOL, file shares)"], ["3268", "Global Catalog"]] },
      ]},
      { title: "GROUP POLICY (GPO)", c: "green", blocks: [
        { t: "lead", text: "Central settings pushed to users and computers: password rules, firewall, software, scripts, mapped drives, USB blocking." },
        { t: "steps", title: "Order of application (LSDOU)", items: [
          "**L**ocal policy on the machine",
          "**S**ite policies",
          "**D**omain policies",
          "**OU** policies, parent OU first, then child"],
          icons: [["cpu", "Local"], ["building", "Site"], ["network", "Domain"], ["layers", "OU"]] },
        { t: "callout", text: "Last applied wins: an OU policy overrides a domain policy, unless the domain link is set to Enforced." },
        { t: "table", title: "Handy commands", head: ["Command", "What it does"], rows: [
          ["`gpupdate /force`", "Apply policy now"], ["`gpresult /r`", "Show which GPOs applied"], ["`rsop.msc`", "Resultant set of policy, in a GUI"]] },
      ]},
    ]},
    { t: "grid", title: "OTHER WINDOWS SERVER ROLES", items: [
      { icon: "network", name: "DNS", text: "Turns names into IP addresses. AD cannot work without it.", k: [["Watch", "unexpected zone transfers"]] },
      { icon: "link", name: "DHCP", text: "Leases IP address, gateway and DNS settings to clients.", k: [["Watch", "rogue DHCP servers on the LAN"]] },
      { icon: "chart", name: "IPAM", text: "IP Address Management: tracks, plans and audits DHCP and DNS address space from one console.", k: [["Helps", "find which device had an IP and when"]] },
      { icon: "globe", name: "IIS", text: "Internet Information Services, Microsoft's web server for sites and APIs.", k: [["Watch", "unexpected files in web folders"]] },
      { icon: "download", name: "WDS", text: "Windows Deployment Services: installs Windows over the network using PXE boot.", k: [["Watch", "old images with stale passwords"]] },
      { icon: "box", name: "Hyper-V", text: "Microsoft's type 1 hypervisor for running virtual machines.", k: [["Watch", "who can manage the host"]] },
      { icon: "folder", name: "FSRM", text: "File Server Resource Manager: quotas, file screening (e.g. block .exe on shares) and storage reports.", k: [["Helps", "spot mass file changes"]] },
      { icon: "lock", name: "NPS", text: "Network Policy Server: Microsoft's RADIUS server for VPN, Wi-Fi and 802.1X sign-ins.", k: [["Helps", "central network access rules"]] },
      { icon: "layers", name: "NLB", text: "Network Load Balancing: spreads traffic across several servers so one failure doesn't stop the service.", k: [["Helps", "availability"]] },
      { icon: "mail", name: "Exchange Server", text: "On-premises email and calendars. Unpatched Exchange servers have been mass-exploited before (ProxyLogon, 2021).", k: [["Watch", "patch level above all"]] },
    ]},
    { t: "split", cols: [
      { title: "POWERSHELL", c: "purple", blocks: [
        { t: "lead", text: "Windows' shell and scripting language for automating admin work." },
        { t: "table", head: ["Try", "Result"], rows: [
          ["`Get-ADUser -Filter * -Properties LastLogonDate`", "Domain users and last logon"],
          ["`Get-LocalGroupMember Administrators`", "Who is a local admin"],
          ["`Get-WinEvent -LogName Security -MaxEvents 20`", "Latest security events"],
          ["`Get-HotFix`", "Installed updates"]] },
        { t: "callout", text: "Turn on Script Block Logging (Event ID 4104) so defenders can see what PowerShell ran." },
      ]},
      { title: "HARDENING CHECKLIST", c: "red", blocks: [
        { t: "list", items: [
          "Separate admin accounts: never read email or browse as a domain admin",
          "Unique local admin passwords with LAPS",
          "Patch domain controllers and Exchange first",
          "Limit who can sign in to domain controllers",
          "Alert on 4625, 4720, 4732 and 1102 (log cleared)",
          "Disable SMBv1, LLMNR and NetBIOS name resolution",
          "Back up AD and test a restore"] },
        { t: "callout", text: "Whoever controls AD controls the company. Protect domain admin like the keys to the building." },
      ]},
    ]},
    { t: "note", title: "Practise it:", text: "Install a Windows Server evaluation VM, promote it to a domain controller, join a Windows client, create an OU and a GPO, then read the Security log while you sign in and out." },
  ],
});

LEARN.push({
  id: "linux-services", track: "toolkit", m: "lnx", mins: 7, c: "green",
  title: "Linux services & hardening",
  sub: "SSH, VNC, Samba, Apache and BIND on one page, plus how SELinux and AppArmor contain them.",
  blocks: [
    { t: "split", cols: [
      { title: "LINUX & BASH BASICS", c: "green", blocks: [
        { t: "lead", text: "Most servers, containers and security tools run on Linux. Almost every setting is a text file under /etc." },
        { t: "table", title: "Where things live", head: ["Path", "What's there"], rows: [
          ["/etc", "Configuration files"], ["/var/log", "Logs (auth.log or secure, syslog)"], ["/home", "Users' home folders"], ["/tmp", "Temporary files; check it for anything odd"], ["/usr/bin", "Programs"]] },
        { t: "table", title: "Everyday admin commands", head: ["Command", "Use"], rows: [
          ["`systemctl status sshd`", "Is a service running?"], ["`journalctl -u sshd`", "That service's logs"], ["`ss -tln`", "Which ports are listening"], ["`df -h` / `free -h`", "Disk and memory"], ["`sudo apt update && sudo apt upgrade`", "Patch (Debian/Ubuntu)"]] },
      ]},
      { title: "SSH & VNC", c: "blue", blocks: [
        { t: "lead", text: "**SSH** gives an encrypted remote shell. **VNC** shares a full desktop, but most VNC traffic isn't encrypted by default." },
        { t: "steps", title: "Harden SSH in five steps", items: [
          "Create a key pair: `ssh-keygen -t ed25519`",
          "Copy the public key to the server: `ssh-copy-id user@server`",
          "In /etc/ssh/sshd_config set `PasswordAuthentication no`",
          "Set `PermitRootLogin no` and limit users with `AllowUsers`",
          "Restart sshd, testing from a second session before you log out"],
          icons: [["key", "Key"], ["upload", "Copy"], ["lock", "No passwords"], ["user", "No root"], ["check", "Test"]] },
        { t: "callout", text: "Need VNC? Run it over an SSH tunnel so the session is encrypted, and never expose port 5900 to the internet." },
      ]},
    ]},
    { t: "table", title: "SERVICES AT A GLANCE", head: ["Service", "What it does", "Port", "Config", "Security tip"], rows: [
      ["SSH (sshd)", "Encrypted remote shell and file copy", "22", "/etc/ssh/sshd_config", "Keys only, no root login"],
      ["VNC", "Remote desktop", "5900 + display", "~/.vnc/", "Tunnel over SSH, strong password"],
      ["Samba", "Windows-compatible file shares (SMB)", "139, 445", "/etc/samba/smb.conf", "No guest shares; require SMB3"],
      ["Apache (httpd)", "Web server", "80, 443", "/etc/apache2/ or /etc/httpd/", "Hide version details, HTTPS only"],
      ["BIND (named)", "DNS server", "53", "/etc/bind/ or /etc/named.conf", "Restrict zone transfers and recursion"]] },
    { t: "split", cols: [
      { title: "SELINUX", c: "red", blocks: [
        { t: "lead", text: "Label-based mandatory access control. On by default in RHEL, Fedora, Rocky and AlmaLinux." },
        { t: "list", items: ["Modes: enforcing, permissive, disabled", "`getenforce` and `sestatus` show the mode", "`ls -Z` shows a file's security label", "Fix wrong labels with `restorecon`", "Denials are logged in /var/log/audit/audit.log"] },
      ]},
      { title: "APPARMOR", c: "amber", blocks: [
        { t: "lead", text: "Path-based profiles, one per program. On by default in Ubuntu, Debian and SUSE." },
        { t: "list", items: ["Modes: enforce and complain", "`sudo aa-status` lists loaded profiles", "Profiles live in /etc/apparmor.d/", "Complain mode logs without blocking while you test", "Denials appear in the kernel log"] },
      ]},
    ]},
    { t: "callout", text: "Both add a second wall on top of normal file permissions: if a web server is compromised, its policy still stops it reading files it was never meant to touch. Don't switch them off just to make an error go away." },
  ],
});
