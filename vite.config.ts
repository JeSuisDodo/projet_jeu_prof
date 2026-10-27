/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le jeu fonctionne aussi depuis un sous-dossier (GitHub Pages, ENT…).
  base: './',
  build: {
    // Phaser pèse à lui seul environ 1,5 Mo ; inutile d'avertir pour ça.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    // Les tests de variantes tirent des milliers d'exercices : sur la CI (2 cœurs), 5 s ne suffisent plus.
    testTimeout: 30000,
  },
});
