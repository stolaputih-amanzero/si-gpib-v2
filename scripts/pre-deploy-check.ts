import fs from 'fs';
import path from 'path';

/**
 * Pre-Deployment Automated Security & Code Quality Check
 * Validates zero secrets leaked, no residual console.logs, and proper RP ID configuration.
 */

let hasError = false;

function logSuccess(msg: string) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

function logWarning(msg: string) {
  console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`);
}

function logError(msg: string) {
  console.log(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
  hasError = true;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// 1. Check SUPABASE_SERVICE_ROLE_KEY leakage in src/
console.log('\n🔍 1. Validating secret leaks in src/...');
const srcFiles = getAllFiles(path.join(process.cwd(), 'src'));
let leakedServiceRoleFiles: string[] = [];

srcFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('service_role')) {
    // Exclude legitimate server-only admin files if any, but flag any client component
    if (content.includes("'use client'") || content.includes('"use client"')) {
      leakedServiceRoleFiles.push(path.relative(process.cwd(), filePath));
    }
  }
});

if (leakedServiceRoleFiles.length > 0) {
  logError(`SUPABASE_SERVICE_ROLE_KEY references found in client files:\n  ${leakedServiceRoleFiles.join('\n  ')}`);
} else {
  logSuccess('Zero SUPABASE_SERVICE_ROLE_KEY leaks detected in client code.');
}

// 2. Check residual console.log in src/components and src/app
console.log('\n🔍 2. Validating residual console.log statements...');
const targetDirFiles = [
  ...getAllFiles(path.join(process.cwd(), 'src', 'app')),
  ...getAllFiles(path.join(process.cwd(), 'src', 'components')),
];

let consoleLogFiles: { file: string; line: number; text: string }[] = [];

targetDirFiles.forEach((filePath) => {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  lines.forEach((line, idx) => {
    // Ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    if (/console\.log\s*\(/.test(line)) {
      consoleLogFiles.push({
        file: path.relative(process.cwd(), filePath),
        line: idx + 1,
        text: trimmed,
      });
    }
  });
});

if (consoleLogFiles.length > 0) {
  logError(`Residual console.log statements found in app/components (${consoleLogFiles.length} occurrences):\n` +
    consoleLogFiles.map(c => `  ${c.file}:${c.line} -> ${c.text}`).slice(0, 10).join('\n') +
    (consoleLogFiles.length > 10 ? `\n  ... and ${consoleLogFiles.length - 10} more` : '')
  );
} else {
  logSuccess('No residual console.log statements found in app and components.');
}

// 3. Check NEXT_PUBLIC_RP_ID environment configuration
console.log('\n🔍 3. Validating WebAuthn / Biometric RP_ID environment configuration...');
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const envRpId = process.env.NEXT_PUBLIC_RP_ID || '';

if (isProduction && (envRpId === 'localhost' || !envRpId)) {
  logError(`Production deployment detected, but NEXT_PUBLIC_RP_ID is set to '${envRpId}'. Must be your production domain (e.g. sigpib.org).`);
} else if (!envRpId) {
  logWarning('NEXT_PUBLIC_RP_ID is currently empty in environment variables. Falling back to window.location.hostname.');
} else {
  logSuccess(`NEXT_PUBLIC_RP_ID is configured properly: '${envRpId}'.`);
}

// Final Summary
console.log('\n----------------------------------------');
if (hasError) {
  console.log('\x1b[31m❌ PRE-DEPLOYMENT CHECK FAILED. Please resolve the errors above before deploying.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32m✅ ALL PRE-DEPLOYMENT CHECKS PASSED SUCCESSFULLY. Ready for Production!\x1b[0m\n');
  process.exit(0);
}
