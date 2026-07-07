import { defineConfig } from 'astro/config';

// Static build for GitHub Pages, served at the custom domain root.
export default defineConfig({
  site: 'https://www.ascentinvestor.in',
  output: 'static',
});
