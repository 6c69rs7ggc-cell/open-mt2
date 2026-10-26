# Open MT2 in GitHub Codespaces

This repository is a development setup for the open-mt2 Node.js/TypeScript server emulator. It is not a production server and still requires a compatible Metin2 client.

## Open the development environment

Create a Codespace from this repository's `master` branch. The dev container installs Node.js 22, Docker tooling, and project dependencies. On first creation, wait for `npm ci --ignore-scripts` to finish.

## Start local dependencies

In the Codespaces terminal:

```bash
cp .env.example .env
```

Before running the server, replace the example database and admin passwords in `.env` with unique development-only values. Do not commit `.env`.

Then start MySQL and Redis:

```bash
docker compose -f docker-compose.dep.yml up -d
```

Wait until both containers are healthy/ready. Run the database migrations:

```bash
npm run migrate
```

Open two terminal tabs and run:

```bash
npm run dev:auth
```

and:

```bash
npm run dev:game
```

Codespaces can forward the authentication and game ports for development. A forwarded Codespaces address is not the same as a stable public game-server address and should not be treated as a production deployment.

## Current limitations

- The upstream project's guide calls for a compatible TMP4 (40k) client; use only client files you are legally entitled to use.
- The upstream emulator is incomplete and is intended for study/fun; a successful build does not prove that all original Metin2 gameplay systems work.
- Do not expose MySQL or Redis publicly, and do not use the example passwords for a public server.
