import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const TESTING_APP_URL = process.env.TESTING_APP_URL || "http://localhost:3020"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "testingApp",
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
    assetPrefix: TESTING_APP_URL,
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
    port: 3020,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
})
