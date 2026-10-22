import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le jeu fonctionne aussi depuis un sous-dossier (GitHub Pages, ENT…).
  base: './',
  build: {
    // Phaser pèse à lui seul environ 1,5 Mo ; inutile d'avertir pour ça.
    chunkSizeWarningLimit: 2000,
  },
});
