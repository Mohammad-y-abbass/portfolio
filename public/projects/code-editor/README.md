# 🧑‍💻 Code Editor

An in-browser JavaScript / JSX code editor and live preview runner — built with React, Monaco Editor, and esbuild-wasm. Write and execute JavaScript or React components directly in the browser, with zero backend required.

---

## ✨ Features

- **Live Preview** — Run your code and see the output rendered in a sandboxed iframe instantly.
- **Monaco Editor** — Full VS Code–grade editing experience with syntax highlighting, word wrap, and customizable options.
- **Auto-run on Load** — The bundler initializes and runs the default code as soon as the page loads, no click needed.
- **JSX & React Support** — Write React components with JSX syntax; esbuild transpiles them in the browser via WebAssembly.
- **npm Package Imports** — Import any npm package directly in your code (e.g. `import axios from 'axios'`). Packages are fetched on-demand from [unpkg.com](https://unpkg.com) and cached locally with `localforage`.
- **Code Formatting** — One-click **Format** button powered by Prettier (Babel parser) to auto-format your code.
- **Error Display** — Runtime errors are caught inside the sandbox and displayed clearly in the preview pane.
- **Fira Code Font** — Ligature-enabled monospace font for a premium editing feel.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Bundler | esbuild-wasm (runs entirely in the browser) |
| Formatter | Prettier 3 (Babel + Estree plugins) |
| Package resolution | unpkg.com CDN + localforage caching |
| Build tool | Vite 5 |

---

## 🏗 Architecture

```
src/
├── App.tsx                  # Root component — manages editor state, bundling, and preview
├── components/
│   ├── CodeEditor.tsx       # Monaco Editor wrapper with Format & Run buttons
│   ├── Preview.tsx          # Sandboxed iframe that receives and executes bundled code
│   └── Loader.tsx           # Loading spinner shown while Monaco initialises
└── bundler/
    ├── index.ts             # esbuild-wasm initialisation and bundler entry point
    └── plugins/
        ├── unpkg-path-plugin.ts   # Resolves npm package paths via unpkg.com
        └── fetch-plugin.ts        # Fetches package source and caches it with localforage
```

### How it works

1. On page load, **esbuild-wasm** is initialised using its `.wasm` binary served from unpkg.
2. Once ready, the default code is **automatically bundled and rendered** in the preview pane.
3. When the user clicks **Run**, the current editor content is passed through the bundler pipeline:
   - `unpkg-path-plugin` maps import paths (e.g. `react`) → `https://unpkg.com/react`
   - `fetch-plugin` fetches the source, caches it in IndexedDB via `localforage`, and returns it to esbuild
   - The bundled output is `postMessage`d into the sandboxed iframe for execution
4. The iframe listens for the message, `eval`s the code, and catches any runtime errors to display them inline.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### Install & run

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

---

## 📝 Usage

1. Write JavaScript or JSX in the editor on the left.
2. Click **Format** to auto-format your code with Prettier.
3. Click **Run** to bundle and execute the code — the result appears in the preview pane on the right.
4. Import any npm package directly:
   ```js
   import _ from 'lodash';
   console.log(_.chunk([1, 2, 3, 4], 2));
   ```

---

## 📄 License

MIT