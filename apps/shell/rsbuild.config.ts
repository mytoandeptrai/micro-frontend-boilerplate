import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const TEAM_APP_URL = process.env.TEAM_APP_URL || "http://localhost:3001"
const MONITOR_APP_URL = process.env.MONITOR_APP_URL || "http://localhost:3002"
const SETTINGS_APP_URL = process.env.SETTINGS_APP_URL || "http://localhost:3003"
const API_URL = process.env.API_URL || "http://localhost:4000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "shell",
      exposes: {
        "./store": "@ops/shared/store",
      },
      remotes: {
        teamApp: `teamApp@${TEAM_APP_URL}/mf-manifest.json`,
        monitorApp: `monitorApp@${MONITOR_APP_URL}/mf-manifest.json`,
        settingsApp: `settingsApp@${SETTINGS_APP_URL}/mf-manifest.json`,
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        "react-router-dom": { singleton: true },
        "@tanstack/react-query": { singleton: true },
        zustand: { singleton: true },
      },
      dts: false,
    }),
  ],
  output: {
    assetPrefix: "/",
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
    port: 3000,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
      },
    },
  },
})
