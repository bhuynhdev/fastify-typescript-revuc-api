# Node.js starter using Fastify & TypeScript

## Included in the codebase

- TypeScript (using swc for fast compilation, and tsx for development)
- Env vars
- Fastify
- CI with github actions
- Docker image
- Linting
- Prisma for database
- ESM (can be opt out by changing the tsconfig: https://www.typescriptlang.org/docs/handbook/esm-node.html)

## Set Up

- Install the dependencies.

```bash
pnpm install
```
- Start the server in development mode.

```bash
pnpm dev
```

## Env vars

Loaded from `.env` file, with schema validation through the `plugin/config.ts` file

## NPM commands

|Command | Action |
|---|---|
|`pnpm run dev` | Run the server in dev mode, automatically restarts on file change |
|`pnpm build`| Compile TypeScript to JavaScript |
|`pnpm start`| Start JavaScript from 'build' directory |
|`pnpm test`| Run unit tests (run `pnpm build` before) |
|`pnpm test:watch`| Run backend tests in watch mode, running on changed test files |
|`pnpm lint`| Run eslint |
|`pnpm lint:fix`| Run eslint in fix mode |

## CI

Run tests on push/PR to 'main' branch
Check `.github/workflows/CI.yml`

## Recommended Vscode Extensions

[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Modules and Domains
1. Adminstrator
- Search and filter hacker
- Update hacker info: Name, email, check-in status

2. Discord
- Check-in anyone by email; return the role

3. Registration page
- Add new hacker
- Verify email

4. Email sending
- Send email to hacker; filter before send

5. Judging
- Add new judge
- Add projects CSV
- Add/update project categories
- Change judge info: category, name, email
- Send email to judge: login link
- Distribute projects to judges

6. Sponsor
- Add new sponsor