<p align="center">
<picture>
    <source srcset="./.github/icon-dark.png" media="(prefers-color-scheme: light)">
    <source srcset="./.github/icon-light.png" media="(prefers-color-scheme: dark)">
    <img src="./.github/icon-dark.png" alt="Header banner">
</picture>
</p>

<h1 align="center">
  Enclosed - Send private and secure notes
</h1>
<p align="center">
  Minimalistic web application designed for sharing private notes and files.
</p>

<p align="center">
  <a href="https://enclosed.cc">Demo</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.enclosed.cc">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@enclosed/cli">CLI</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.enclosed.cc/self-hosting/docker">Self-hosting</a>
</p>

## Introduction

**Enclosed** is a minimalistic web application designed for sending private notes and files.

Users can define an expiration period (TTL), attach files, and choose to have the note self-destruct after being read.

A live instance is available at [enclosed.cc](https://enclosed.cc).

[![Enclosed](./.github/enclosed-mockup.png)](https://enclosed.cc)

## Features

- **File Attachments**: Share files alongside your notes.
- **Configurable Lifetime**: Set an expiration time and choose self-destruction after the note is read.
- **Short Share Links**: Notes use short IDs that are easier to copy and share.
- **Minimalistic UI**: Simple and intuitive user interface for quick note sharing.
- **i18n Support**: Available in multiple languages.
- **Authentication**: Optional email/password authentication to create notes.
- **Dark Mode**: A dark theme for late-night note sharing.
- **Responsive Design**: Works on all devices, from desktops to mobile phones.
- **Open Source**: The source code is available under the Apache 2.0 License.
- **Self-Hostable**: Run your instance of Enclosed for private note sharing.
- **CLI**: A command-line interface for creating notes from the terminal.
- **Very low environmental impact**: the app and the docs is rated A+ on websitecarbon.com (see [here](https://www.websitecarbon.com/website/enclosed-cc/) and [here](https://www.websitecarbon.com/website/docs-enclosed-cc/)).

## Self host

### Try it with Docker

You can quickly run the application using Docker.

```bash
docker run -d --name enclosed --restart unless-stopped -p 8787:8787 corentinth/enclosed
```

### To go further

Please refer to the [self-hosting documentation](https://docs.enclosed.cc/self-hosting/docker) for more information on how to configure and run the application.
For example:

- [Setup persistent storage](https://docs.enclosed.cc/self-hosting/docker#docker-with-volume-persistence)
- [Use rootless image](https://docs.enclosed.cc/self-hosting/docker#rootless-and-non-rootless-docker-images)
- [Use Docker Compose](https://docs.enclosed.cc/self-hosting/docker-compose)

### Deploy to Cloudflare Workers

The application can also be deployed as a serverless Cloudflare Workers app backed by Cloudflare KV.

1. Create a KV namespace and update the `notes` binding in [`wrangler.toml`](./wrangler.toml).
2. Build the client assets and the Worker bundle:

```bash
pnpm --filter @enclosed/app-server build:worker
```

3. Set the Worker environment variables you need, especially the public settings mirrored by the client build (`VITE_*`) and the Worker runtime settings (`PUBLIC_*`, `AUTHENTICATION_*`, and `STORAGE_DRIVER_CLOUDFLARE_KV_BINDING` if you change the binding name).
4. Deploy the Worker:

```bash
pnpm --filter @enclosed/app-server deploy:worker
```

The Worker serves `/api/*`, while the static frontend is served through Workers Assets with SPA fallback for note URLs.

#### Deploy with GitHub integration

You can also deploy the Worker by connecting the repository directly in Cloudflare Workers Builds.
The repository includes a root [`wrangler.toml`](./wrangler.toml), so the default root-level `npx wrangler deploy` flow works without having to target a nested workspace manually.

Recommended settings for this repository:

- Worker name: `enclosed-app` (must match the `name` value in [`wrangler.toml`](./wrangler.toml))
- Root directory: repository root
- Build command: optional
- Deploy command: optional

If you prefer explicit commands, these also work from the repository root:

- Build command: `pnpm run build:worker`
- Deploy command: `pnpm run deploy:worker`
- Non-production branch deploy command: `pnpm run preview:worker`

Before enabling automatic deployments on your own Cloudflare account, make sure the `notes` KV binding in [`wrangler.toml`](./wrangler.toml) points to a KV namespace you control, or replace it during your first setup.

### Configuration

You can refer to the [configuration documentation](https://docs.enclosed.cc/self-hosting/configuration) for more information on how to configure the application.

## How It Works

1. **Note Creation**: A user creates a note, optionally adds files, and chooses its lifetime.
2. **Payload Serialization**: The browser serializes the note content and attachments into a compact payload.
3. **Sending to Server**: The payload and note metadata are sent to the server.
4. **Storage and ID Assignment**: The server stores the note payload and provides a short **ID**.
5. **Link Generation**: A shareable **link** is generated from the note ID, with an optional `#dar` fragment for delete-after-reading notes.
6. **Link Sharing**: The link is shared with the intended recipient.
7. **Note Retrieval**: The recipient opens the link, and the app fetches the stored payload using the note ID.
8. **Payload Parsing**: The browser parses the payload back into note content and attached files.
9. **Optional Destruction**: Notes marked for delete-after-reading are removed after a successful read.

## CLI

The Enclosed CLI allows you to create notes from the terminal. You can install it globally using npm, yarn, or pnpm.

### Installation

```bash
# with npm
npm install -g @enclosed/cli

# with yarn
yarn global add @enclosed/cli

# with pnpm
pnpm add -g @enclosed/cli
```

### Create a note

```bash
# Basic usage
enclosed create "Hello, World!"

# Using stdin
cat file.txt | enclosed create

# With full options
enclosed create --deleteAfterReading --ttl 3600 "Hello, World!"
```

### View a note

```bash
enclosed view <note-url>
```

### Configure the enclosed instance to use

```bash
# By default, the CLI uses the public instance at enclosed.cc
enclosed config set instance-url https://enclosed.cc
```

## Project Structure

This project is organized as a monorepo using `pnpm` workspaces. The structure is as follows:

- **[packages/app-client](./packages/app-client/)**: Frontend application built with SolidJS.
- **[packages/app-server](./packages/app-server/)**: Backend application using HonoJS, with both Node and Cloudflare Workers entrypoints.
- **[packages/lib](./packages/lib/)**: Core functionalities of Enclosed.
- **[packages/cli](./packages/cli/)**: Command-line interface for Enclosed.

## Contributing

Contributions are welcome! Please refer to the [`CONTRIBUTING.md`](./CONTRIBUTING.md) file for guidelines on how to get started, report issues, and submit pull requests.
You can find easy-to-pick-up tasks with the [`good first issue` label](https://github.com/CorentinTh/enclosed/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more information.

## Credits and Acknowledgements

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).

Thank you to all the contributors who have helped make Enclosed better!

[![Contributors](https://contrib.rocks/image?repo=CorentinTh/enclosed)](https://github.com/CorentinTh/enclosed/graphs/contributors)

### Stack

Enclosed would not have been possible without the following open-source projects:

- **Frontend**
  - **[SolidJS](https://www.solidjs.com)**: A declarative JavaScript library for building user interfaces.
  - **[Shadcn Solid](https://shadcn-solid.com/)**: UI components library for SolidJS based on Shadcn designs.
  - **[UnoCSS](https://unocss.dev/)**: An instant on-demand atomic CSS engine.
  - **[Tabler Icons](https://tablericons.com/)**: A set of open-source icons.
  - And other dependencies listed in the **[client package.json](./packages/app-client/package.json)**
- **Backend**
  - **[HonoJS](https://hono.dev/)**: A small, fast, and lightweight web framework for building APIs.
  - **[Unstorage](https://unstorage.unjs.io/)**: An unified key-value storage API.
  - **[Zod](https://github.com/colinhacks/zod)**: A TypeScript-first schema declaration and validation library.
  - And other dependencies listed in the **[server package.json](./packages/app-server/package.json)**

### Hosting

The [live instance](https://enclosed.cc) of Enclosed is hosted on [Cloudflare Pages](https://pages.cloudflare.com/) using [Cloudflare KV](https://developers.cloudflare.com/kv/) for storage.
This repository also supports direct deployment to [Cloudflare Workers](https://developers.cloudflare.com/workers/) with Workers Assets + KV.

### Inspiration

- **[PrivateBin](https://github.com/PrivateBin/PrivateBin)**: A minimalist, open-source online pastebin where the server has zero knowledge of pasted data.
- **[Bitwarden Send](https://bitwarden.com/products/send/)**: A secure and ephemeral way to share sensitive information.
- The **[shadcn playground example](https://ui.shadcn.com/examples/playground)** for the ui

## Contact Information

Please use the issue tracker on GitHub for any questions or feedback.
