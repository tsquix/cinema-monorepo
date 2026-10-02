# Run the app

Install dependencies once from the repository root:

```sh
cd ~/cinema-monorepo
pnpm install
```

Start the database:

```sh
cd ~/cinema-monorepo
docker compose up -d
```

In a separate terminal, start the backend:

```sh
cd ~/cinema-monorepo/apps/booking-backend
pnpm dev
```

In another terminal, start the web client:

```sh
cd ~/cinema-monorepo/apps/web-client
pnpm dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Stop each dev server with `Ctrl+C`. Stop the database from the repository root:

```sh
docker compose down
```
