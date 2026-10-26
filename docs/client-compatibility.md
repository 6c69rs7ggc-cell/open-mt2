# TMP4 / 40k client compatibility status

## Current status

**A successful login from a real TMP4/40k client has not yet been verified.** Passing automated tests proves that the emulator builds and its tested server flows work; it does not prove full client compatibility.

The repository's feature roadmap still marks protocol encryption as TODO. A client build that expects the original Metin2 stream cipher / handshake behavior may therefore disconnect or fail before login, even when the TCP ports are reachable. Do not treat an open port or a successful CI smoke test as proof that the client can play.

## Checks required for a real client

1. Use a legally obtained TMP4 / 40k client whose packet headers and structures match this emulator.
2. Configure that client's `serverinfo.py` with the reachable server address and the actual auth/game ports. `127.0.0.1` and `localhost` only refer to the same device as the client; they are not valid for a client on another device.
3. For remote clients, configure the server's public/reachable address in the game configuration used for character-list handoff as well as in the client. Check the actual `REAL_SERVER_ADDRESS` / server address setting in the current `.env.example` and game config before exposing the service.
4. Confirm that TCP connections reach auth (default port 11002) and game (default port 13001), and inspect debug logs for the last handshake and packet received.
5. Verify the complete path in order: handshake, login, character list, create/select character, enter game, movement, chat, disconnect and reconnect.
6. Test with a non-default account password. Never expose the example `admin/admin` credentials on a public server; replace the seed password before creating a real deployment.

## What CI currently proves

The remote-check workflow builds the TypeScript project, runs unit and integration tests against temporary MySQL/Redis services, and starts auth/game processes for a smoke test. These services are destroyed after the workflow. CI does not host a persistent game world and does not connect a real Metin2 client.

## Next protocol milestone

Before declaring TMP4/40k support, implement or explicitly establish that the target client does not require protocol encryption, then test captured client/server packet sequences against that exact client build. Packet layouts and encryption behavior can differ between client versions; do not enable a guessed cipher or copy a cipher key from an unrelated client.
