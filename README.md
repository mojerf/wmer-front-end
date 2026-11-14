# wmer — front end

Personal website of Mojtaba Erfanrad (Persian, RTL). Angular 22 with server-side rendering,
Tailwind CSS 4, signals and zoneless change detection. The Laravel API lives in
[wmer-back-end](https://github.com/mojerf/wmer-back-end).

## Requirements

- Node.js `^22.22.3 || ^24.15.0 || >=26` (required by Angular 22)
- npm 10+

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on http://localhost:4200 |
| `npm run build` | Production build (SSR bundle in `dist/wmer-front-end`) |
| `npm run serve:ssr:wmer-front-end` | Runs the built SSR server on port 4000 |
| `npm test` | Unit tests (Vitest through `@angular/build:unit-test`) |
| `npm run lint` | ESLint, including the architecture boundary rules |

## Configuration

Build-time values live in `src/environments/` (`environment.production.ts` replaces
`environment.ts` in production builds):

| Key | Meaning |
| --- | --- |
| `apiUrl` | Absolute URL of the Laravel API (absolute so SSR can reach it) |
| `siteUrl` | Public origin of the site (canonical links, Open Graph, JSON-LD) |
| `useMockApi` | Serve placeholder content instead of calling the API |

Runtime environment variables of the SSR server (`src/server.ts`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `4000` | Listening port |
| `ALLOWED_HOSTS` | `localhost` | Comma separated hosts the server answers for; other `Host` headers get a 400 |
| `TRUST_PROXY` | unset | Set to `true` only behind your own reverse proxy so `X-Forwarded-*` headers are honoured |

Also replace the domain in `public/robots.txt` and `public/sitemap.xml` before deploying.

## Architecture

```
src/app
├── core/        app-wide singletons: config tokens, HTTP interceptors, SEO, theme
├── layout/      application shell: header, footer, command palette, theme switch
├── shared/      reusable, dependency-free UI: directives, pipes, small components
└── features/    one folder per product area, lazy-loaded from app.routes.ts
    ├── home/        page, sections, data-access (API contract, mapper, resolver)
    └── not-found/
```

Rules (enforced by ESLint, see `eslint.config.js`):

- `shared` imports nothing from `core`, `layout` or `features`.
- `core` imports nothing from `layout` or `features`.
- `layout` imports nothing from `features`.
- A feature only uses `core` and `shared`; features never import each other or `layout`.

Data flow of a feature: **route resolver → `HomeApi` (abstract) → HTTP or mock implementation →
mapper (DTO → domain model) → page input → presentational sections**. Components never touch
`HttpClient` or Laravel's response shapes, which keeps the back end free to evolve.

Rendering strategy is declared per route in `app.routes.server.ts` (home is rendered on request and
cacheable; unknown URLs return a real 404). Pages set their own title, description, canonical URL and
JSON-LD through `SeoService`.

Styling is Tailwind only, with sizes in `rem`. Design tokens (colors, animations) live in
`src/styles.css`.

## Security notes

- The SSR server validates the `Host` header (`ALLOWED_HOSTS`) and sends baseline security headers.
- JSON-LD is escaped so it can never close its `<script>` tag.
- A strict Content-Security-Policy is planned (hash-based, via `security.autoCsp`).

## License

Not decided yet — add a `LICENSE` file before treating the repository as open source.
