import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const TEAM_APP_URL = process.env.TEAM_APP_URL || "http://localhost:3001"
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
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        "react-router-dom": { singleton: true },
        "@tanstack/react-query": { singleton: true },
        zustand: { singleton: true },
      },
      dts: {
        consumeTypes: true,
        generateTypes: false,
      },
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
