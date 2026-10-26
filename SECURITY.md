# Security Policy

## Reporting a vulnerability

Do not publish credentials, tokens, private server addresses, or exploit details in public issues.

For a sensitive report, contact the repository owner privately through GitHub. Include the affected path, impact, and steps to reproduce without exposing real user data.

## Repository access

This project is under active development. Access to source code and deployment permissions should be limited to explicitly trusted accounts. Do not commit secrets, production credentials, private keys, database dumps, or real player data.

## Secret response

If a credential is committed, treat it as compromised: revoke or rotate it first. Removing it from the latest commit is not sufficient because Git history, forks, caches, and clones may retain it.

## Server safety

- Keep production secrets in the server environment or a secret manager.
- Do not expose database ports or game-server administration interfaces to the public internet.
- Keep GM permissions allowlisted by stable account IDs and validate permissions on the server.
- Never trust client-side role checks.
