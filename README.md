# Quick Start

## 1. Install Bun

This project uses [Bun](https://bun.sh/) to bundle our client-side JavaScript code for shipping to the browser.

```bash
curl -fsSL https://bun.sh/install | bash
```

## 2. Clone the project

```bash
git clone git@github.com:catdadcodes/micah-help.git && cd ./micah-help
```

## 3. Install dependencies

Our bundled app needs to install a few dependencies to run. Let's install them now.

```bash
bun install
```

## 4. Build the project

Before we can run the app we need to trigger the build. The build will: bundle all our JavaScript with Bun, process our CSS using Tailwind, and copy our HTML and JSON files to the `build`` directory.

```bash
bun run build
```

## 5. Run the app

Now that we have a `build` directory we can serve the app.

```bash
bun start
```

Now we can navigate to http://localhost:8080 and see the app in all its glory!
