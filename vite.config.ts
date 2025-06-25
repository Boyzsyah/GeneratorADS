<<<<<<< HEAD
=======

>>>>>>> 49d16cb8002a6cbf9cba6fdb88fe9e9df30b2805
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

<<<<<<< HEAD
    // ==== PERHATIKAN BAGIAN INI SUDAH DIUBAH! ====
    const base = mode === 'production' ? '/GeneratorADS/' : '/'; // Pastikan '/GeneratorADS/' sesuai nama repo Anda
=======
    // IMPORTANT FOR GITHUB PAGES DEPLOYMENT:
    // 1. Replace 'YOUR_REPOSITORY_NAME' with your actual GitHub repository name.
    //    For example, if your repo URL is https://github.com/username/my-cool-app,
    //    then base should be '/my-cool-app/'.
    // 2. If you are deploying to a custom domain root (e.g., your-username.github.io or www.yourdomain.com)
    //    AND that domain points directly to this repository's GitHub Pages,
    //    then base should be '/'.
    const base = mode === 'production' ? '/GeneratorADS/' : '/';
>>>>>>> 49d16cb8002a6cbf9cba6fdb88fe9e9df30b2805

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
<<<<<<< HEAD
});
=======
});
>>>>>>> 49d16cb8002a6cbf9cba6fdb88fe9e9df30b2805
