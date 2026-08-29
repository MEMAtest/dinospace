import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const injectPwaPrecache = () => {
  let resolvedConfig

  const walkFiles = async (directory, prefix) => {
    try {
      const entries = await readdir(directory, { withFileTypes: true })
      const files = []
      for (const entry of entries) {
        const absolute = resolve(directory, entry.name)
        const publicPath = `${prefix}/${entry.name}`
        if (entry.isDirectory()) {
          files.push(...await walkFiles(absolute, publicPath))
        } else if (/\.(?:json|mp3|png|jpg|jpeg|webp|avif)$/i.test(entry.name)) {
          files.push(publicPath)
        }
      }
      return files
    } catch {
      // The first development build may run before generated story assets
      // exist. The app still builds; generated files are included next time.
      return []
    }
  }

  return {
    name: 'inject-pwa-precache',
    apply: 'build',
    configResolved(config) {
      resolvedConfig = config
    },
    async closeBundle() {
      const outputDir = resolve(resolvedConfig.root, resolvedConfig.build.outDir)
      const assetsDir = resolve(outputDir, 'assets')
      const germanAudioDir = resolve(outputDir, 'audio', 'de')
      const englishAudioDir = resolve(outputDir, 'audio', 'en')
      const serviceWorkerPath = resolve(outputDir, 'sw.js')
      const storybooksDir = resolve(resolvedConfig.root, 'public', 'storybooks')
      const assetFiles = await readdir(assetsDir)
      const germanAudioFiles = await readdir(germanAudioDir)
      const englishAudioFiles = await readdir(englishAudioDir)
      const appAssets = assetFiles
        .filter((file) => /\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|woff2?)$/i.test(file))
        .map((file) => `/assets/${file}`)
      const bundledGermanAudio = germanAudioFiles
        .filter((file) => /\.mp3$/i.test(file))
        .map((file) => `/audio/de/${file}`)
      const bundledEnglishAudio = englishAudioFiles
        .filter((file) => /\.mp3$/i.test(file))
        .map((file) => `/audio/en/${file}`)
      const bundledStorybooks = await walkFiles(storybooksDir, '/storybooks')

      const serviceWorker = await readFile(serviceWorkerPath, 'utf8')
      const updatedWorker = serviceWorker.replace(
        'const PRECACHE_ASSETS = []; // __PRECACHE_ASSETS__',
        `const PRECACHE_ASSETS = ${JSON.stringify([...appAssets, ...bundledGermanAudio, ...bundledEnglishAudio, ...bundledStorybooks])};`,
      )
      await writeFile(serviceWorkerPath, updatedWorker)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectPwaPrecache()],
})
