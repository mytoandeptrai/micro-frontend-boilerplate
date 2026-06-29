import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

const SHELL_URL = process.env.SHELL_URL || "http://localhost:3000"
const TEAM_APP_URL = process.env.TEAM_APP_URL || "http://localhost:3001"
const API_URL = process.env.API_URL || "http://localhost:4000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "teamApp",
      filename: "remoteEntry.js",
      remotes: {
        shell: `shell@${SHELL_URL}/mf-manifest.json`,
      },
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
    assetPrefix: TEAM_APP_URL,
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
    port: 3001,
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
