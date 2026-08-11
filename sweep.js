const fs = require('fs');
const path = require('path');

const directory = 'E:\\MIOS\\src';

const replacements = {
  // Borders and shapes
  'rounded-none': 'rounded-xl',
  'rounded-sm': 'rounded-xl',
  'rounded-md': 'rounded-2xl',
  
  // Colors (Text)
  'text-white': 'text-foreground',
  'text-zinc-100': 'text-foreground',
  'text-zinc-200': 'text-foreground',
  'text-zinc-300': 'text-foreground',
  'text-zinc-400': 'text-muted-foreground',
  'text-zinc-500': 'text-muted-foreground',
  'text-gray-200': 'text-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-black': 'text-primary-foreground', // Only on primary buttons usually
  
  // Colors (Background)
  'bg-black': 'bg-background',
  'bg-zinc-950': 'bg-card',
  'bg-zinc-900': 'bg-muted',
  'bg-zinc-800': 'bg-muted',
  'bg-zinc-700': 'bg-muted',
  'bg-gray-900': 'bg-muted',
  'bg-gray-800': 'bg-muted',
  
  // Colors (Borders)
  'border-zinc-800': 'border-border',
  'border-zinc-700': 'border-border',
  'border-zinc-600': 'border-border',
  'border-gray-800': 'border-border',
  'border-gray-700': 'border-border',
  
  // Accents
  'text-[#00dbe9]': 'text-primary',
  'bg-[#00dbe9]': 'bg-primary',
  'border-[#00dbe9]': 'border-primary',
  'text-[#00dbe9]/80': 'text-primary/80',
  'bg-[#00dbe9]/10': 'bg-primary/10',
  'bg-[#00dbe9]/20': 'bg-primary/20',
  'border-[#00dbe9]/40': 'border-primary/40',
  'border-[#00dbe9]/50': 'border-primary/50',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  // Skip the globals.css or components we deliberately want to keep original
  if (filePath.includes('ui\\button.tsx')) return;
  if (filePath.includes('globals.css')) return;
  if (filePath.includes('theme-toggle.tsx')) return;
  if (filePath.includes('dashboard-kpis.tsx')) return;
  if (filePath.includes('dashboard-header.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Perform replacements using word boundaries where appropriate to avoid partial matches
  for (const [key, value] of Object.entries(replacements)) {
    // Escape special characters for regex
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?<=^|\\s|"|'|\`)${escapedKey}(?=\\s|"|'|\`|\\/|:)`, 'g');
    content = content.replace(regex, value);
  }

  // A special pass for bg-[#00dbe9]/x since the regex above handles boundaries well but let's be sure
  content = content.replace(/bg-\[\#00dbe9\]\/(\d+)/g, 'bg-primary/$1');
  content = content.replace(/border-\[\#00dbe9\]\/(\d+)/g, 'border-primary/$1');
  content = content.replace(/text-\[\#00dbe9\]\/(\d+)/g, 'text-primary/$1');

  // Hardcode fixes for common pattern: border border-border/50 bg-card/80 backdrop-blur-xl rounded-none
  // We want to replace these big chunks if we can, but individual rules should catch them.
  // One important rule: "border border-border" which we get when replacing "border border-zinc-800"
  // Let's also fix "bg-black" inside customer table.

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walkDir(directory, processFile);
console.log('Sweep completed.');
