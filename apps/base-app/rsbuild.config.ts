import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const BASE_APP_URL = process.env.BASE_APP_URL || "http://localhost:3010"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "baseApp",
      filename: "remoteEntry.js",
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
    assetPrefix: BASE_APP_URL,
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
    port: 3010,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
})
