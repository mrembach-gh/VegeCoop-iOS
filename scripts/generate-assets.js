const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

// ── Icon SVG — basket with vegetables on deep green ──────────────────────────
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#388E3C"/>
      <stop offset="100%" stop-color="#1B5E20"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>

  <!-- Basket body -->
  <path d="M 280 520 Q 280 720 512 720 Q 744 720 744 520 Z"
        fill="#F5DEB3" stroke="#C8A96E" stroke-width="12"/>

  <!-- Basket weave lines vertical -->
  <line x1="370" y1="525" x2="345" y2="715" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
  <line x1="440" y1="522" x2="430" y2="718" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
  <line x1="512" y1="521" x2="512" y2="719" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
  <line x1="584" y1="522" x2="594" y2="718" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
  <line x1="654" y1="525" x2="679" y2="715" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>

  <!-- Basket weave lines horizontal -->
  <path d="M 292 590 Q 512 575 732 590" fill="none" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
  <path d="M 300 650 Q 512 635 724 650" fill="none" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>

  <!-- Basket rim -->
  <rect x="265" y="505" width="494" height="42" rx="21"
        fill="#D4A853" stroke="#B8860B" stroke-width="6"/>

  <!-- Basket handle left arc -->
  <path d="M 330 510 Q 280 370 370 310 Q 430 280 460 330"
        fill="none" stroke="#8B6914" stroke-width="22" stroke-linecap="round"/>

  <!-- Basket handle right arc -->
  <path d="M 694 510 Q 744 370 654 310 Q 594 280 564 330"
        fill="none" stroke="#8B6914" stroke-width="22" stroke-linecap="round"/>

  <!-- Carrot (left, sticking out of basket) -->
  <ellipse cx="400" cy="460" rx="38" ry="80" fill="#FF6F00" transform="rotate(-20 400 460)"/>
  <path d="M 378 392 Q 385 340 370 310" fill="none" stroke="#388E3C" stroke-width="12" stroke-linecap="round"/>
  <path d="M 388 388 Q 400 338 392 308" fill="none" stroke="#4CAF50" stroke-width="10" stroke-linecap="round"/>
  <path d="M 398 390 Q 415 345 414 315" fill="none" stroke="#388E3C" stroke-width="9" stroke-linecap="round"/>

  <!-- Apple (centre, sticking out) -->
  <circle cx="512" cy="430" r="88" fill="#E53935"/>
  <circle cx="485" cy="435" r="30" fill="#EF5350" opacity="0.5"/>
  <path d="M 512 348 Q 520 300 548 295" fill="none" stroke="#4CAF50" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="530" cy="294" rx="22" ry="14" fill="#4CAF50" transform="rotate(-30 530 294)"/>

  <!-- Leek / green onion (right, sticking out) -->
  <ellipse cx="628" cy="455" rx="30" ry="75" fill="#AED581" transform="rotate(18 628 455)"/>
  <ellipse cx="628" cy="455" rx="16" ry="75" fill="#7CB342" transform="rotate(18 628 455)"/>
  <path d="M 648 388 Q 660 335 655 305" fill="none" stroke="#558B2F" stroke-width="11" stroke-linecap="round"/>
  <path d="M 634 382 Q 642 330 642 300" fill="none" stroke="#689F38" stroke-width="10" stroke-linecap="round"/>
  <path d="M 620 385 Q 622 335 628 308" fill="none" stroke="#558B2F" stroke-width="9" stroke-linecap="round"/>

  <!-- Text -->
  <text x="512" y="830" text-anchor="middle"
        font-family="Georgia, serif" font-size="88" font-weight="bold"
        fill="white" opacity="0.95" letter-spacing="2">Vege</text>
  <text x="512" y="930" text-anchor="middle"
        font-family="Georgia, serif" font-size="88" font-weight="bold"
        fill="white" opacity="0.95" letter-spacing="2">Coop</text>
</svg>
`;

// ── Splash SVG — icon centred on dark background ──────────────────────────────
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <rect width="1284" height="2778" fill="#121212"/>

  <!-- Reuse icon, centred and scaled to ~500px -->
  <g transform="translate(392, 989) scale(0.488)">
    <defs>
      <radialGradient id="bg2" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#388E3C"/>
        <stop offset="100%" stop-color="#1B5E20"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" rx="220" fill="url(#bg2)"/>
    <path d="M 280 520 Q 280 720 512 720 Q 744 720 744 520 Z" fill="#F5DEB3" stroke="#C8A96E" stroke-width="12"/>
    <line x1="370" y1="525" x2="345" y2="715" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <line x1="440" y1="522" x2="430" y2="718" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <line x1="512" y1="521" x2="512" y2="719" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <line x1="584" y1="522" x2="594" y2="718" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <line x1="654" y1="525" x2="679" y2="715" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <path d="M 292 590 Q 512 575 732 590" fill="none" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <path d="M 300 650 Q 512 635 724 650" fill="none" stroke="#C8A96E" stroke-width="8" stroke-linecap="round"/>
    <rect x="265" y="505" width="494" height="42" rx="21" fill="#D4A853" stroke="#B8860B" stroke-width="6"/>
    <path d="M 330 510 Q 280 370 370 310 Q 430 280 460 330" fill="none" stroke="#8B6914" stroke-width="22" stroke-linecap="round"/>
    <path d="M 694 510 Q 744 370 654 310 Q 594 280 564 330" fill="none" stroke="#8B6914" stroke-width="22" stroke-linecap="round"/>
    <ellipse cx="400" cy="460" rx="38" ry="80" fill="#FF6F00" transform="rotate(-20 400 460)"/>
    <path d="M 378 392 Q 385 340 370 310" fill="none" stroke="#388E3C" stroke-width="12" stroke-linecap="round"/>
    <path d="M 398 390 Q 415 345 414 315" fill="none" stroke="#388E3C" stroke-width="9" stroke-linecap="round"/>
    <circle cx="512" cy="430" r="88" fill="#E53935"/>
    <circle cx="485" cy="435" r="30" fill="#EF5350" opacity="0.5"/>
    <path d="M 512 348 Q 520 300 548 295" fill="none" stroke="#4CAF50" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="530" cy="294" rx="22" ry="14" fill="#4CAF50" transform="rotate(-30 530 294)"/>
    <ellipse cx="628" cy="455" rx="30" ry="75" fill="#AED581" transform="rotate(18 628 455)"/>
    <ellipse cx="628" cy="455" rx="16" ry="75" fill="#7CB342" transform="rotate(18 628 455)"/>
    <path d="M 648 388 Q 660 335 655 305" fill="none" stroke="#558B2F" stroke-width="11" stroke-linecap="round"/>
    <path d="M 620 385 Q 622 335 628 308" fill="none" stroke="#558B2F" stroke-width="9" stroke-linecap="round"/>
    <text x="512" y="830" text-anchor="middle" font-family="Georgia, serif" font-size="88" font-weight="bold" fill="white" opacity="0.95" letter-spacing="2">Vege</text>
    <text x="512" y="930" text-anchor="middle" font-family="Georgia, serif" font-size="88" font-weight="bold" fill="white" opacity="0.95" letter-spacing="2">Coop</text>
  </g>

  <!-- Tagline -->
  <text x="642" y="1720" text-anchor="middle"
        font-family="Georgia, serif" font-size="52" fill="#4CAF50" opacity="0.9">Fresh from the market</text>
</svg>
`;

async function generate() {
    console.log('Generating icon.png (1024×1024)...');
    await sharp(Buffer.from(iconSvg))
        .resize(1024, 1024)
        .png()
        .toFile(path.join(assetsDir, 'icon.png'));

    console.log('Generating adaptive-icon.png (1024×1024)...');
    await sharp(Buffer.from(iconSvg))
        .resize(1024, 1024)
        .png()
        .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    console.log('Generating splash-icon.png (1284×2778)...');
    await sharp(Buffer.from(splashSvg))
        .resize(1284, 2778)
        .png()
        .toFile(path.join(assetsDir, 'splash-icon.png'));

    console.log('✅ All assets generated in assets/');
}

generate().catch(console.error);
