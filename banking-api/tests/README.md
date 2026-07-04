    cv# Tests

## Install (one time)

```bash
npm install
```

This pulls in the new devDependencies added to `package.json`:
`vitest`, `@vitest/coverage-v8`, `supertest`, `sqlite3`, `cross-env`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          v                                                                                                                                                                                                                                                                 nnn  n n nnn n 

## Run

```bash
npm test               # everything, once
npm run test:watch     # watch mode while you write code
npm run test:unit      # only tests/unit
npm run test:integration
npm run test:coverage
```

## Layout

```
tests/
  setup.js                      # global hooks: loads .env.test, syncs the
                                 # in-memory DB, wipes tables after each test
  unit/
    helpers.test.js             # pure functions, no mocking needed
    services/
      accountService.test.js    # models mocked with vi.mock (test doubles)
      transactionService.test.js
      authService.test.js
  integration/
    auth.test.js                # supertest hits the real Express app;
    accounts_and_transactions.test.js   # real routes/controllers/services,
                                         # backed by an in-memory SQLite DB
```

## Why two layers (matches the course slides)

- **Unit tests** isolate one service from its collaborators (the Sequelize
  models) using test doubles created with `vi.mock`. They run in
  milliseconds and pin down business rules: "withdraw throws when funds are
  insufficient", "closeAccount refuses a non-zero balance", etc.
- **Integration tests** send real HTTP requests (via `supertest`) through
  the actual Express app — routes, validators, middleware, controllers,
  services, and models all run for real. The only thing swapped out is
  MySQL itself, replaced by an in-memory SQLite database (see
  `src/config/database.js`, branches on `NODE_ENV=test`) so tests don't
  need a running MySQL server and each run starts from a clean schema.

## Two small changes made to the app for testability

1. `src/app.js` — the `sequelize.authenticate()` / `app.listen()` block is
   now guarded by `if (require.main === module)`, so requiring `app.js`
   from a test file no longer tries to open a real DB connection or bind a
   port. `node src/app.js` / `npm start` behave exactly as before.
2. `src/config/database.js` — when `NODE_ENV=test`, it builds an in-memory
   SQLite `Sequelize` instance instead of a MySQL one. Same models, same
   associations, same hooks — just a disposable database.

## Extending this to the rest of the project

Not every file has an example test yet. Follow the same two patterns:

- For another **service** (e.g. `adminService.js`): copy the
  `vi.mock('../../../src/models', ...)` pattern from
  `accountService.test.js`, one `describe` block per exported function, one
  `it` per business rule / branch (happy path + each error path).
- For another **route** (e.g. `admin.js`): copy the `supertest` pattern
  from `accounts_and_transactions.test.js` — register a user (or an admin,
  see note below), get a token, hit the endpoint, assert the status code
  and response shape.

**Admin routes**: there's currently no way to create an `admin` user
through the API (role defaults to `client`). To test `adminController.js`
you'll need to either create the user directly through the `User` model in
the test's `Arrange` step (bypassing HTTP), or add a seeding step — ask
your instructor which is expected.
