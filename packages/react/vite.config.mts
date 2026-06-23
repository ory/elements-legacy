// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { viteStaticCopy } from "vite-plugin-static-copy"
import autoprefixer from "autoprefixer"

// The ESM and UMD artifacts are built in two passes so they can treat React's
// JSX runtime differently (see `external` below). `make build` / the build
// script runs `vite build` (ESM) then `ORY_BUILD_FORMAT=umd vite build` (UMD).
const isUmd = process.env.ORY_BUILD_FORMAT === "umd"

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
    react(),
    // Types and static assets only need to be emitted once; do it on the ESM
    // pass so the UMD pass can append its bundle without regenerating them.
    ...(isUmd
      ? []
      : [
          dts({ insertTypesEntry: true }),
          viteStaticCopy({
            targets: [
              {
                src: "../../src/assets",
                dest: "",
              },
            ],
          }),
        ]),
  ],
  build: {
    target: "esnext",
    // The ESM pass runs first and cleans the output; the UMD pass appends to it.
    emptyOutDir: !isUmd,
    lib: {
      name: "@ory/elements",
      entry: path.resolve(__dirname, "../../src/react.ts"),
      formats: [isUmd ? "umd" : "es"],
      fileName: () => (isUmd ? "index.umd.js" : "index.mjs"),
    },
    rollupOptions: {
      treeshake: "smallest",
      // ESM additionally externalizes React's JSX runtime so the artifact uses
      // the consumer's runtime and stays React-version-agnostic (works on React
      // 18 and 19). UMD keeps the JSX runtime bundled because the
      // react/jsx-runtime subpath has no UMD global; this matches the previous
      // self-contained UMD behavior.
      external: isUmd
        ? ["react", "react-dom"]
        : ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
})
