# extension-api — Kustomisasi untuk base-api

> **Bahasa Indonesia | [English](README.en.md)**

Repo ini berisi **kustomisasi klien** untuk [base-api](../express-modular-sample/README.md). Bukan aplikasi yang berjalan sendiri: isinya disalin ke `base-api/src/extensions/` saat build (`npm run poc:copy`), lalu dikomposisi dengan module inti.

- **Runtime:** ESM (`"type": "module"`) — Node.js ≥ 20.11
- **Dependency:** `uuid` (digabung otomatis ke `package.json` base via `npm run merge:ext`)

## Cara Pakai

```bash
# Di repo base-api:
npm run poc:copy    # salin src/ → ../express-modular-sample/src/extensions/
npm run merge:ext   # gabungkan dependency extension ke package.json base
npm install
npm start           # route table menampilkan hasil merge ([overwrite]/[prepend]/[new])
```

`copy-extensions.js` mencari folder ini dengan nama `extension-api` atau `express-modular-extension-sample`. Jika namanya lain: `EXT_DIR=/path/ke/repo npm run poc:copy`.

## Isi

```text
src/
├── user-management/            # extend module user-management (ada di base)
│   ├── route.user.extend.js    #   overwrite GET /users/:id, route baru DELETE /users/:id
│   ├── middleware.extend.js    #   auth, requireRole, requestLogger, rateLimit, validateBody
│   ├── service.helper.js       #   enrich user dengan roles
│   └── init.extend.js          #   subscribe NATS + WS /ws/users-ext
├── product-management/         # extend module product-management (ada di base)
│   ├── route.product.extend.js #   overwrite GET /products/:id (+source: extension)
│   └── route.policy.extend.js  #   route baru POST /products/policies
└── audit-user/                 # extension-only module (tidak ada di base)
    ├── index.js                #   prefix /audit + init (NATS, WS, scheduler)
    ├── routes/                 #   GET /logs, GET /users/:id, POST /log, POST /notify
    ├── services/
    └── repositories/
```

## Aturan Penting

- Semua file ESM: `import`/`export default` — tanpa `require`.
- Import ke base: `../../libs/deps.js` (dari root module), `../../modules/<module>/...` (dari subfolder tambah satu `../`).
- Jangan membuat `init.extend.js` di extension-only module (`audit-user`) — gunakan `index.js`.
- Detail lengkap: [CONTRACT.md](../express-modular-sample/docs/CONTRACT.md) dan tutorial [DEVELOPER-GUIDE.md](../express-modular-sample/docs/DEVELOPER-GUIDE.md).
