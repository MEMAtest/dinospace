import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const injectPwaPrecache = () => {
  let resolvedConfig

  return {
    name: 'inject-pwa-precache',
    apply: 'build',
    configResolved(config) {
      resolvedConfig = config
    },
    async closeBundle() {
      const outputDir = resolve(resolvedConfig.root, resolvedConfig.build.outDir)
      const assetsDir = resolve(outputDir, 'assets')
      const serviceWorkerPath = resolve(outputDir, 'sw.js')
      const assetFiles = await readdir(assetsDir)
      const appAssets = assetFiles
        .filter((file) => /\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|woff2?)$/i.test(file))
        .map((file) => `/assets/${file}`)

      const serviceWorker = await readFile(serviceWorkerPath, 'utf8')
      const updatedWorker = serviceWorker.replace(
        'const PRECACHE_ASSETS = []; // __PRECACHE_ASSETS__',
        `const PRECACHE_ASSETS = ${JSON.stringify(appAssets)};`,
      )
      await writeFile(serviceWorkerPath, updatedWorker)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectPwaPrecache()],
})
