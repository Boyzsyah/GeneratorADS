import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// process.env.API_KEY akan digantikan oleh Vite selama build
// dengan nilai dari GEMINI_API_KEY di environment build.
// Jika GEMINI_API_KEY tidak ada di env build, ini akan menjadi undefined.
const apiKey = process.env.API_KEY;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Tidak dapat menemukan elemen root untuk me-mount aplikasi.");
}

if (!apiKey) {
  console.error("KESALAHAN FATAL: GEMINI_API_KEY tidak terdefinisi. Pastikan variabel ini diatur dengan benar di lingkungan build deployment Anda.");
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; text-align: center; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; padding: 2rem 2.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <h1 style="font-size: 1.75rem; font-weight: bold; color: #be123c; margin-bottom: 1rem;">Kesalahan Konfigurasi Aplikasi</h1>
        <p style="margin-bottom: 0.75rem; font-size: 1rem; color: #374151;">API Key untuk layanan AI (Gemini) tidak ditemukan.</p>
        <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5;">
          Untuk menjalankan aplikasi ini, pastikan variabel lingkungan <code>GEMINI_API_KEY</code> telah diatur dengan benar di pengaturan platform deployment Anda dan tersedia selama proses build.
        </p>
        <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-top: 0.5rem;">
          Silakan periksa dokumentasi platform deployment Anda mengenai cara mengatur variabel lingkungan.
        </p>
      </div>
    </div>
  `;
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
