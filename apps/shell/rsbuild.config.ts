import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin"

const FIRST_APP_URL = process.env.FIRST_APP_URL || "http://localhost:3001"
const SECOND_APP_URL = process.env.SECOND_APP_URL || "http://localhost:3002"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "shell",
      exposes: {
        "./store": "@ops/shared-core/store",
      },
      remotes: {
        firstApp: `firstApp@${FIRST_APP_URL}/mf-manifest.json`,
        secondApp: `secondApp@${SECOND_APP_URL}/mf-manifest.json`,
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
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  tools: {
    rspack(_config, { appendPlugins }) {
      if (process.env.RSDOCTOR === "true") {
        appendPlugins(new RsdoctorRspackPlugin({ disableClientServer: true }))
      }
    },
  },
})
