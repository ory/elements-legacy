// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { viteStaticCopy } from "vite-plugin-static-copy"
import autoprefixer from "autoprefixer"

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        autoprefixer({}) as any, // add options if needed
      ],
    },
  },
  plugins: [
    vanillaExtractPlugin({
      identifiers: ({ hash, filePath, debugId }) => {
        const name = filePath
          .split("/")
          ?.pop()
          ?.split(".")[0]
          ?.replace("-", "_")
        const id = debugId ? "_" + debugId : ""
        return `ory_elements__${name}${id}__${hash}`
      },
    }),
    dts({
      insertTypesEntry: true,
    }),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "../../src/assets",
          dest: "",
        },
      ],
    }),
  ],
  build: {
    target: "esnext",
    lib: {
      name: "@ory/elements",
      entry: path.resolve(__dirname, "../../src/react.ts"),
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.umd.js"),
    },
    rollupOptions: {
      treeshake: "smallest",
      // Externalize React AND its JSX runtime. Without the jsx-runtime entries
      // Vite bundles React 18's automatic runtime into the dist, which emits
      // React-18-format elements that React 19 rejects at render. Externalizing
      // makes each consumer supply their own runtime, so @ory/elements works on
      // both React 18 and 19.
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "react/jsx-dev-runtime": "jsxDevRuntime",
        },
      },
    },
  },
})
