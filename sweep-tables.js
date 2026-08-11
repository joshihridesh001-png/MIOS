const fs = require('fs');
const path = require('path');

const directory = 'E:\\MIOS\\src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace common table wrapper styles with neo-flat
  content = content.replace(/border border-border\/50 bg-card\/80 backdrop-blur-xl/g, 'neo-flat border-none p-4');
  
  // Also fix the font-mono that makes the table hard to read
  content = content.replace(/font-mono text-sm/g, 'font-bold font-sans text-sm');

  // Any remaining uppercase font-mono should be uppercase font-bold text-xs
  content = content.replace(/font-mono text-xs uppercase tracking-wider/g, 'font-bold font-sans text-xs uppercase tracking-wider');

  // Also replace some residual font-mono in Customer Table
  content = content.replace(/font-mono font-bold hover:bg-primary\/80/g, 'font-sans font-bold hover:bg-primary/80');
  content = content.replace(/font-mono text-xs uppercase tracking-wide/g, 'font-bold font-sans text-xs uppercase tracking-wide');
  content = content.replace(/font-mono/g, 'font-sans font-bold');

  // The previous sweep might have messed up button variants if they were explicitly using bg-primary text-primary-foreground 
  // but button.tsx is handling most of that.
  
  // Clean up any remaining text-muted-foreground text-foreground duplicates
  content = content.replace(/text-muted-foreground text-foreground/g, 'text-muted-foreground');
  content = content.replace(/text-foreground font-semibold text-foreground/g, 'text-foreground font-bold');
  content = content.replace(/text-muted-foreground font-sans font-bold text-sm uppercase tracking-wider/g, 'text-muted-foreground font-bold font-sans text-sm uppercase tracking-wider');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated table/UI style: ${filePath}`);
  }
}

walkDir(directory, processFile);
console.log('Table styling sweep completed.');
