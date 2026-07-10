import { pluginModuleFederation } from "@module-federation/rsbuild-plugin"
import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin"

const SECOND_APP_URL = process.env.SECOND_APP_URL || "http://localhost:3002"
const SHELL_URL = process.env.SHELL_URL || "http://localhost:3000"

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "secondApp",
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
    assetPrefix: SECOND_APP_URL,
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
  },
  tools: {
    rspack(_config, { appendPlugins }) {
      if (process.env.RSDOCTOR === "true") {
        appendPlugins(new RsdoctorRspackPlugin({ disableClientServer: true }))
      }
    },
  },
})
