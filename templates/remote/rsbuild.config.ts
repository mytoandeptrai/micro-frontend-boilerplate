import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

// Replace REPLACE_APP_NAME with the app name (camelCase), e.g. "monitorApp"
// Replace REPLACE_APP_SLUG with the kebab-case name, e.g. "monitor-app"
// Replace REPLACE_PORT with the dev port, e.g. 3002
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "REPLACE_APP_NAME",
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
    assetPrefix: "auto",
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
    port: "REPLACE_PORT",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
})
