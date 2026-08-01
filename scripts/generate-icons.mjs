import fs from 'fs';
import path from 'path';

// Helper to create a minimal valid PNG with orange background & headphones icon shape or solid color
function generateMinimalPng(width, height) {
  // We can write an SVG and create valid icons or minimal valid PNG buffer
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="128" fill="#0a0d14"/>
    <circle cx="256" cy="256" r="200" fill="#ea580c"/>
    <path d="M160 256v64a32 32 0 0 0 32 32h16v-128h-48zm192 0h-48v128h16a32 32 0 0 0 32-32v-64zm-192-32a96 96 0 0 1 192 0v32h32v-32a128 128 0 0 0-256 0v32h32v-32z" fill="#ffffff"/>
  </svg>`;
  return svg;
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), generateMinimalPng(512, 512));
console.log('Icons generated');
