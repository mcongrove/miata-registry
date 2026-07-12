# Miata Registry

A community-driven project that aims to document and preserve the history of limited edition Mazda Miatas.

## 🚗 About

The Miata Registry is a public platform where owners of limited edition Mazda Miatas can register and document their vehicles. This registry helps preserve these cars' histories and builds a valuable resource for the community.

## 🌟 Why Register?

-   Help preserve the history of limited edition Miatas
-   Connect with other owners of limited editions
-   Verify authenticity of limited edition models
-   Track vehicles as they change hands over time
-   Contribute to the community's knowledge base

## 🚀 Getting Started

1. Create an account by clicking "Sign In" at [MiataRegistry.com](https://miataregistry.com)
2. Find your car on the Registry list page and click "Claim", or (if it's not there) go to Registry > Register your Miata
3. Submit your car's details and the Miata Registry team will review your submission
4. Send any supporting documentation to support@miataregistry.com to get verified faster; this can be photos, social media links, PDF files showing vehicle history, etc.

## 🧑‍💻 Development

### Prerequisites

- Node.js 22
- npm

### Tech stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, react-router-dom
- **Backend:** Hono on Cloudflare Workers
- **Data:** Cloudflare D1 (Drizzle ORM), KV, R2
- **Auth:** Clerk
- **Email:** react-email, Resend

### Architecture

Vite builds the SPA; a Cloudflare Worker serves the API. In production the frontend is hosted separately from the worker. Local dev runs the Vite dev server and a remote worker (`worker:dev`) side by side.

### Local setup

1. Clone the repository:

    ```bash
    git clone https://github.com/mcongrove/miata-registry.git
    cd miata-registry
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.dev.vars` and `.env` file in the root directory with your environment variables. Reach out to a maintainer to get the correct values.

4. Start the development application and worker:

    ```bash
    npm run dev
    npm run worker:dev
    ```

> **Note:** When running locally, `worker:dev` connects to the production Cloudflare D1 database, KV cache, and R2 storage. Be careful not to mutate production data during development.

### Deploy

Pushes to `main` trigger GitHub Actions to lint, build, and deploy the API worker to Cloudflare. The web frontend is deployed separately via the Cloudflare dashboard.

## 🤝 Contributing

We welcome contributions from the community! Whether it's adding new features, improving documentation, or reporting bugs — via [GitHub issues](https://github.com/mcongrove/miata-registry/issues) or [support@miataregistry.com](mailto:support@miataregistry.com) — see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

This means:

-   You can view and modify the code
-   You can use the code for private use
-   You must disclose the source code of any modifications
-   You must state changes you made to the code
-   You must share any modifications under the same license
-   If you use this code in a network service, you must make the complete source code available to users

For more details, see the [LICENSE](LICENSE) file.
