import { config } from "./config.js";

export function renderInvite(profile, overrides = {}) {
  const event = {
    name: overrides.eventName || config.event.name,
    date: overrides.date || config.event.date,
    time: overrides.time || config.event.time,
    location: overrides.location || config.event.location,
    host: overrides.host || config.event.host
  };

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Quy khach";
  const avatar = profile.profilePic || avatarPlaceholder(fullName);

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thu moi ${escapeHtml(event.name)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #14213d;
      --muted: #596579;
      --paper: #fffaf2;
      --accent: #c1121f;
      --gold: #d4a017;
      --line: #eadfca;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #ece8df;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--ink);
      padding: 24px;
    }

    .invite {
      width: min(760px, 100%);
      min-height: 980px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 28px;
      background:
        linear-gradient(135deg, rgba(193, 18, 31, 0.08), transparent 36%),
        linear-gradient(315deg, rgba(212, 160, 23, 0.16), transparent 38%),
        var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: clamp(28px, 6vw, 56px);
      box-shadow: 0 24px 70px rgba(35, 31, 24, 0.18);
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
    }

    .host {
      font-size: 15px;
      line-height: 1.5;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0;
      font-weight: 700;
    }

    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #ffffff;
      box-shadow: 0 10px 28px rgba(20, 33, 61, 0.18);
      background: #f2eadc;
      flex: 0 0 auto;
    }

    main {
      align-self: center;
      text-align: center;
      display: grid;
      gap: 24px;
    }

    .eyebrow {
      margin: 0;
      color: var(--accent);
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    h1 {
      margin: 0;
      font-size: clamp(38px, 8vw, 76px);
      line-height: 1.02;
      letter-spacing: 0;
    }

    .guest {
      margin: 0;
      font-size: clamp(24px, 5vw, 44px);
      line-height: 1.16;
      color: var(--accent);
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .copy {
      max-width: 560px;
      margin: 0 auto;
      color: var(--muted);
      font-size: 20px;
      line-height: 1.7;
    }

    .details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      border-top: 1px solid var(--line);
      padding-top: 24px;
    }

    .detail {
      min-height: 92px;
      display: grid;
      align-content: center;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.52);
    }

    .label {
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0;
    }

    .value {
      font-size: 17px;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    @media (max-width: 640px) {
      body {
        padding: 12px;
      }

      .invite {
        min-height: auto;
        padding: 24px;
      }

      .top {
        align-items: flex-start;
      }

      .avatar {
        width: 72px;
        height: 72px;
      }

      .details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <section class="invite" aria-label="Thu moi su kien">
    <header class="top">
      <div class="host">${escapeHtml(event.host)}</div>
      <img class="avatar" src="${escapeAttribute(avatar)}" alt="Anh dai dien cua ${escapeAttribute(fullName)}">
    </header>

    <main>
      <p class="eyebrow">Tran trong kinh moi</p>
      <h1>${escapeHtml(event.name)}</h1>
      <p class="guest">${escapeHtml(fullName)}</p>
      <p class="copy">Ban to chuc han hanh duoc don tiep quy khach tai su kien. Su hien dien cua quy khach la niem vinh hanh cua chung toi.</p>
    </main>

    <footer class="details">
      <div class="detail">
        <div class="label">Ngay</div>
        <div class="value">${escapeHtml(event.date)}</div>
      </div>
      <div class="detail">
        <div class="label">Gio</div>
        <div class="value">${escapeHtml(event.time)}</div>
      </div>
      <div class="detail">
        <div class="label">Dia diem</div>
        <div class="value">${escapeHtml(event.location)}</div>
      </div>
    </footer>
  </section>
</body>
</html>`;
}

function avatarPlaceholder(name) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "KH";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
    <rect width="192" height="192" rx="96" fill="#c1121f"/>
    <text x="96" y="111" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#fffaf2">${escapeHtml(initials)}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
