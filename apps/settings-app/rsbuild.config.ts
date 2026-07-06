import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const SETTINGS_APP_URL = process.env.SETTINGS_APP_URL || "http://localhost:3003"
const API_URL = process.env.API_URL || "http://localhost:4000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "settingsApp",
      filename: "remoteEntry.js",
      remotes: {},
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
    assetPrefix: SETTINGS_APP_URL,
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
    port: 3003,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
      },
    },
  },
})
