# ASHEN REALM browser client plan

## Goal

Provide an actual browser-playable client at `https://ashenrealm.eu/play/`. The marketing website alone is not a game client, and a visual mock-up must not be presented as connected gameplay.

## Current verified state

- `website/index.html` is a static landing page deployed with GitHub Pages.
- The TypeScript emulator exposes native TCP auth and game servers (default ports 11002 and 13001).
- There is no browser client or WebSocket gateway in the repository yet.
- `docs/client-compatibility.md` states that real TMP4/40k client login has not been verified and protocol encryption remains unfinished.
- GitHub Actions tests do not provide a persistent public game server.

## Required architecture

1. **Browser client** — HTML/TypeScript rendering, login UI, character selection, input and game scene.
2. **WebSocket gateway** — a separately hosted Node.js service that accepts WSS from browsers and bridges framed binary data to the emulator's TCP auth/game endpoints. It must enforce origin checks, connection limits, message-size limits, timeouts, and rate limits. It must never expose database/cache ports or credentials to the browser.
3. **Protocol codec** — browser-side packet framing and handshake compatible with the selected emulator protocol. Do not assume the stock client encryption is unnecessary; prove compatibility against the server implementation and test client first.
4. **Persistent server deployment** — auth/game/database/cache must run on a persistent host with configured public endpoints. GitHub Pages can serve static client assets but cannot run the game server.
5. **End-to-end validation** — verify connect, handshake, login, character list/create/select, enter world, movement, chat, disconnect and reconnect against the same deployed build.

## Delivery milestones

- [ ] Confirm and document the exact packet protocol, framing, handshake and encryption requirements.
- [ ] Add a browser client shell under `website/play/` without claiming that it is online before it has a real server connection.
- [ ] Implement and test a secured WebSocket-to-TCP gateway as a separate deployable service.
- [ ] Implement browser packet codec and login/character selection against integration fixtures.
- [ ] Add a minimal playable scene and movement only after packets are exchanged successfully.
- [ ] Run end-to-end tests against a persistent staging server before announcing public play.

## Safety and deployment rules

- Never publish `.env`, seeded passwords, account tokens, or database credentials.
- Do not put database or Redis endpoints in client-side JavaScript.
- Do not label the browser client playable until a real browser session completes the end-to-end checks above.
