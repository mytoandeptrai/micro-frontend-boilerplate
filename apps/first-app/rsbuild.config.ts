import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const FIRST_APP_URL = process.env.FIRST_APP_URL || "http://localhost:3001"
const SHELL_URL = process.env.SHELL_URL || "http://localhost:3000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "firstApp",
      filename: "remoteEntry.js",
      remotes: {
        shell: `shell@${SHELL_URL}/mf-manifest.json`,
      },
      // Simple form — expose a single file:
      // "./App": "./src/App"
      //
      // Extended form — expose with a custom chunk name (for bundle optimization):
      // "./App": {
      //   import: "./src/App",
      //   name: "AppChunk",
      // }
      exposes: {
        "./App": "./src/App",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router-dom": { singleton: true },
        "@tanstack/react-query": { singleton: true },
        zustand: { singleton: true },
      },
      dts: {
        generateTypes: {
          tsConfigPath: "./tsconfig.dts.json",
        },
      },
    }),
  ],
  output: {
    assetPrefix: FIRST_APP_URL,
  },
  html: {
    template: "./public/index.html",
  },
  source: {
    entry: {
      index: "./src/index.tsx",
    },
  },
  server: {
    port: "3001",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
})
