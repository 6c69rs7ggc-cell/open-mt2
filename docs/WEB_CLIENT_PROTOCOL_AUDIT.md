# Browser client protocol audit

This document records what the current server source proves and what is still unverified. It is a work log for the browser client, not a claim that browser login works.

## Confirmed in source

- Auth and game listeners use Node TCP sockets. A browser cannot connect to these TCP sockets directly; browsers need a WebSocket transport or a native client.
- Every connection starts with a server handshake packet. The current implementation creates a random 32-bit ID, uses `performance.now()` for the time field, sets delta to zero, and sends the handshake before normal client traffic.
- Incoming data is framed on the server side before dispatch. The parser buffers partial TCP chunks, processes complete frames in order, limits a frame to 1,024 bytes and the receive buffer to 16,384 bytes, and closes on invalid lengths or malformed packets.
- Packet headers are phase-specific in practice: the auth and game servers use different packet maps and connection states. A browser implementation must not assume one global header-to-packet mapping.
- The login request class declares a fixed-size packet and reads a 31-byte username field, a 17-byte password field, and a 32-bit little-endian key. The exact byte layout must be cross-checked against the packet base classes and a real client capture before using it in production.
- The token packet carries a username, a 32-bit key, and four 32-bit XTEA key values.
- The repository explicitly says TMP4/40k real-client login has not been verified and protocol encryption remains an unresolved compatibility item.

## Browser client implementation gates

### Gate 1 — protocol fixtures
- Record exact packet bytes for handshake, client version, login request, login response, token, character list, character selection and enter-game.
- Derive packet sizes and variable-length rules from the actual packet classes and validators, not from guessed constants.
- Add unit tests for byte order, string padding/termination, packet lengths, partial frames and multiple frames in one WebSocket message.

### Gate 2 — transport gateway
- Run a persistent WSS gateway separately from static GitHub Pages.
- The gateway must use fixed upstream auth/game hosts and ports; never accept a client-supplied upstream host.
- Require WSS in production, validate allowed browser origins, cap message size, rate-limit connection attempts, and close both sides on disconnect.
- Do not log passwords, tokens or raw authentication payloads.
- Keep all upstream addresses and deployment secrets server-side.

### Gate 3 — login and character selection
- Implement the protocol only after Gate 1 establishes exact layouts and handshake/encryption behavior.
- Validate login, failure, character-list and select-character flows against a real staging server.
- A successful WebSocket connection alone is not proof of successful game login.

### Gate 4 — playable scene
- Render the world only after enter-game and movement packets are decoded correctly.
- Add end-to-end checks for movement, chat, disconnect and reconnect.
- Keep the pre-alpha page labelled as non-playable until those checks pass.

## Current blocker

The repo contains enough TCP server code to start a browser-client implementation, but not enough verified protocol evidence to safely claim or ship a playable web client. The next engineering task is a packet-layout audit and fixture tests, followed by a separately hosted secure WSS gateway. GitHub Pages can host the frontend but cannot host the persistent gateway.
