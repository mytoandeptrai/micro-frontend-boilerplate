import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const MONITOR_APP_URL = process.env.MONITOR_APP_URL || "http://localhost:3002"
const API_URL = process.env.API_URL || "http://localhost:4000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "monitorApp",
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
      dts: false,
    }),
  ],
  output: {
    assetPrefix: MONITOR_APP_URL,
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
    port: 3002,
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
