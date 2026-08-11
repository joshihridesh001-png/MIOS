const fs = require('fs');
const path = require('path');

const directory = 'E:\\MIOS\\src';

const map = {
  Loader2: 'CircleNotch',
  ArrowLeft: 'ArrowLeft',
  Plus: 'Plus',
  ChevronLeft: 'CaretLeft',
  LayoutGrid: 'SquaresFour',
  Table: 'Table',
  TableIcon: 'Table', // Special handling below
  Search: 'MagnifyingGlass',
  SearchIcon: 'MagnifyingGlass',
  Filter: 'Faders',
  Sparkles: 'Sparkle',
  Cpu: 'Cpu',
  Terminal: 'TerminalWindow',
  FlaskConical: 'Flask',
  CheckCircle2: 'CheckCircle',
  CircleCheckIcon: 'CheckCircle',
  Moon: 'Moon',
  Sun: 'Sun',
  Pencil: 'PencilSimple',
  Trash2: 'Trash',
  FileText: 'FileText',
  Flame: 'Fire',
  TrendingUp: 'TrendUp',
  AlertTriangle: 'Warning',
  TriangleAlertIcon: 'Warning',
  Layers: 'Stack',
  Target: 'Target',
  DollarSign: 'CurrencyDollar',
  Lightbulb: 'Lightbulb',
  Globe: 'Globe',
  ThumbsUp: 'ThumbsUp',
  MessageCircle: 'ChatCircle',
  Share2: 'ShareNetwork',
  ExternalLink: 'ArrowSquareOut',
  Award: 'Trophy',
  ArrowRight: 'ArrowRight',
  Activity: 'Activity',
  ShieldCheck: 'ShieldCheck',
  FileSpreadsheet: 'FileCsv',
  RefreshCw: 'ArrowsClockwise',
  Check: 'Check',
  CheckIcon: 'Check',
  AlertCircle: 'WarningCircle',
  X: 'X',
  XIcon: 'X',
  Tag: 'Tag',
  Menu: 'List',
  LogOut: 'SignOut',
  Settings: 'Gear',
  User: 'User',
  UserIcon: 'User',
  BrainCircuit: 'Brain',
  ChevronRightIcon: 'CaretRight',
  ChevronRight: 'CaretRight',
  ChevronDownIcon: 'CaretDown',
  ChevronDown: 'CaretDown',
  ChevronUpIcon: 'CaretUp',
  ChevronUp: 'CaretUp',
  InfoIcon: 'Info',
  Info: 'Info',
  OctagonXIcon: 'Prohibit',
  Loader2Icon: 'CircleNotch'
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
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Find import { ... } from "lucide-react" or 'lucide-react'
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    // importsStr looks like "Loader2, ArrowLeft as AL"
    const imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
    const newImports = new Set();
    
    imports.forEach(imp => {
      let originalName = imp;
      let alias = null;
      if (imp.includes(' as ')) {
        const parts = imp.split(' as ');
        originalName = parts[0].trim();
        alias = parts[1].trim();
      }

      const newName = map[originalName] || originalName;
      if (alias) {
        newImports.add(`${newName} as ${alias}`);
      } else if (originalName.endsWith('Icon') && newName === originalName.replace('Icon', '')) {
        // e.g. SearchIcon -> MagnifyingGlass
        // wait, we just mapped SearchIcon to MagnifyingGlass, so if alias wasn't used but the file uses SearchIcon:
        newImports.add(`${newName} as ${originalName}`);
      } else {
        newImports.add(newName);
        // Also replace occurrences in the file of originalName to newName
        if (originalName !== newName) {
           const replaceRegex = new RegExp(`\\b${originalName}\\b`, 'g');
           // But wait, we shouldn't replace it globally yet, we do it below
        }
      }
    });

    return `import { ${Array.from(newImports).join(', ')} } from "@phosphor-icons/react"`;
  });

  // Now replace all usages in JSX. We need to be careful with aliases.
  // Actually a simpler way is to just let the alias handle it for JSX, OR replace the component names.
  // E.g., if we had `Search`, we now have `MagnifyingGlass`.
  // Let's replace the usage in the rest of the file for non-aliased imports.
  const importsIter = original.matchAll(importRegex);
  for (const match of importsIter) {
    const importsStr = match[1];
    const imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
    imports.forEach(imp => {
      if (!imp.includes(' as ')) {
         const originalName = imp;
         const newName = map[originalName];
         
         // If it's something like TableIcon, we mapped it to Table, but it might not be aliased.
         // Wait, TableIcon is usually aliased: import { Table as TableIcon } from 'lucide-react'
         // Our regex parsed that as originalName=Table, alias=TableIcon.
         // So newName=Table, it creates `Table as TableIcon`. In this case we don't need to rename in JSX!
         
         // If there is no alias, and originalName != newName, we rename in JSX.
         if (newName && newName !== originalName) {
             // Only if the originalName doesn't end with Icon when mapped to something else that we didn't alias.
             if (originalName.endsWith('Icon')) {
                // we added an alias above: newName as originalName
                // so no need to rename JSX
             } else {
                 const tagStart = new RegExp(`<${originalName}(\\s|>)`, 'g');
                 const tagEnd = new RegExp(`</${originalName}>`, 'g');
                 content = content.replace(tagStart, `<${newName} weight="duotone"$1`);
                 content = content.replace(tagEnd, `</${newName}>`);
                 
                 // Also replace it if it's used as a variable (e.g. icon: Sparkles)
                 const varRegex = new RegExp(`\\b${originalName}\\b`, 'g');
                 content = content.replace(varRegex, newName);
             }
         } else if (newName === originalName) {
             // Just add weight="duotone" to the component
             const tagStart = new RegExp(`<${originalName}(\\s|>)`, 'g');
             content = content.replace(tagStart, `<${originalName} weight="duotone"$1`);
         }
      } else {
         // It was aliased, e.g. Table as TableIcon. So in JSX it's used as TableIcon.
         const parts = imp.split(' as ');
         const alias = parts[1].trim();
         const tagStart = new RegExp(`<${alias}(\\s|>)`, 'g');
         content = content.replace(tagStart, `<${alias} weight="duotone"$1`);
      }
    });
  }

  // Also replace any generic "weight="duotone"" that might have been added multiple times if script runs twice
  // (not needed since we run once)

  // Lucide icons often use `className="h-4 w-4"`. Phosphor uses `size` or just scales with font, but `className="w-4 h-4"` works fine.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated icons in: ${filePath}`);
  }
}

walkDir(directory, processFile);
console.log('Icon swap completed.');
