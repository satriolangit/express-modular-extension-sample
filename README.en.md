# extension-api — Customizations for base-api

> **Bahasa Indonesia: [README.md](README.md) | English**

This repo holds the **client customizations** for [base-api](../express-modular-sample/README.en.md). It is not a standalone application: its contents are copied into `base-api/src/extensions/` at build time (`npm run poc:copy`) and then composed with the core modules.

- **Runtime:** ESM (`"type": "module"`) — Node.js ≥ 20.11
- **Dependencies:** `uuid` (merged automatically into the base `package.json` via `npm run merge:ext`)

## How to Use

```bash
# In the base-api repo:
npm run poc:copy    # copy src/ → ../express-modular-sample/src/extensions/
npm run merge:ext   # merge the extension dependencies into base's package.json
npm install
npm start           # the route table shows the merge result ([overwrite]/[prepend]/[new])
```

`copy-extensions.js` looks for this folder under the names `extension-api` or `express-modular-extension-sample`. If your folder is named differently: `EXT_DIR=/path/to/repo npm run poc:copy`.

## Contents

```text
src/
├── user-management/            # extends the user-management module (lives in base)
│   ├── route.user.extend.js    #   overwrite GET /users/:id, new route DELETE /users/:id
│   ├── middleware.extend.js    #   auth, requireRole, requestLogger, rateLimit, validateBody
│   ├── service.helper.js       #   enrich user with roles
│   └── init.extend.js          #   NATS subscribe + WS /ws/users-ext
├── product-management/         # extends the product-management module (lives in base)
│   ├── route.product.extend.js #   overwrite GET /products/:id (+source: extension)
│   └── route.policy.extend.js  #   new route POST /products/policies
└── audit-user/                 # extension-only module (not present in base)
    ├── index.js                #   prefix /audit + init (NATS, WS, scheduler)
    ├── routes/                 #   GET /logs, GET /users/:id, POST /log, POST /notify
    ├── services/
    └── repositories/
```

## Important Rules

- Every file is ESM: `import`/`export default` — no `require`.
- Imports into base: `../../libs/deps.js` (from a module root), `../../modules/<module>/...` (add one `../` from subfolders).
- Do not create `init.extend.js` in extension-only modules (`audit-user`) — use `index.js`.
- Full details: [CONTRACT.md](../express-modular-sample/docs/en/CONTRACT.md) and the [DEVELOPER-GUIDE.md](../express-modular-sample/docs/en/DEVELOPER-GUIDE.md) tutorials.
