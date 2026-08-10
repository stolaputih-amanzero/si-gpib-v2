import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Helper to get all TS files in a directory recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });
  return arrayOfFiles;
}

describe('Integration: Prohibited Patterns (Static Analysis)', () => {
  
  const getServerActionFiles = () => {
    const actionsDir = path.join(process.cwd(), 'src/app/actions');
    const dashboardDir = path.join(process.cwd(), 'src/app/(dashboard)');
    
    let allFiles = getAllFiles(actionsDir);
    allFiles = getAllFiles(dashboardDir, allFiles);
    
    // Filter only actions.ts or action-*.ts
    return allFiles.filter(f => f.includes('action') && f.endsWith('.ts'));
  };

  test('No 6th Error Code exists in the codebase', () => {
    const errorFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/authorization/types/error.types.ts'), 'utf-8');
    const typeMatch = errorFile.match(/export type FrozenErrorCode =([^;]+);/);
    expect(typeMatch).not.toBeNull();
    if (typeMatch) {
      const codes = typeMatch[1].match(/'[A-Z_]+'/g);
      expect(codes?.length).toBe(5);
    }
  });

  test('No RLS policy for t_kompetensi_pendeta (PIP-05)', () => {
    const rlsFile = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20260714000003_authorization_rls_policies.sql'), 'utf-8');
    expect(rlsFile.toLowerCase()).not.toContain('t_kompetensi_pendeta');
  });

  test('No Shadow Authorization in Server Actions (SA-03)', () => {
    const files = getServerActionFiles();
    // Some patterns may appear in comments or types. We'll be specific.
    const prohibitedPatterns = [
      /if\s*\(\s*user\.role\s*===/i,
      /if\s*\(\s*session\.user\.role/i,
      /assertPosWriteAccess\(/i, 
    ];

    for (const file of files) {
      // Ignore settings/users/actions.ts if it imports isSuperUserRole but doesn't use it.
      // We fixed unused vars in phase 5, but just in case, we focus on usage.
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of prohibitedPatterns) {
        expect(content, `File ${file} contains prohibited shadow auth pattern: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  test('OC-PERSON-007 is NOT wrapped in enforceContract (SA-A1)', () => {
    const files = getServerActionFiles();
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('addKompetensiAction')) {
        expect(content).not.toContain("enforceContract('OC-PERSON-007'");
      }
    }
  });
});
