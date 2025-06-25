
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // IMPORTANT FOR GITHUB PAGES DEPLOYMENT:
    // 1. Replace 'YOUR_REPOSITORY_NAME' with your actual GitHub repository name.
    //    For example, if your repo URL is https://github.com/username/my-cool-app,
    //    then base should be '/my-cool-app/'.
    // 2. If you are deploying to a custom domain root (e.g., your-username.github.io or www.yourdomain.com)
    //    AND that domain points directly to this repository's GitHub Pages,
    //    then base should be '/'.
    const base = mode === 'production' ? '/GeneratorADS/' : '/';

    return {
      base: base,
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
      }
    };
});