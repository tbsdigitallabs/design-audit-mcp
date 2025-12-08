import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractDesignElements } from '../../src/extractor/index.js';
import { loadRuleset } from '../../src/rules/loader.js';
import { scoreDesign } from '../../src/critique/scorer.js';
import { generateDeterministicFixes } from '../../src/refactor/fixes.js';
import { applyPatches } from '../../src/refactor/patch-applier.js';
import { generateComponent } from '../../src/generate/component-gen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('MCP Server Integration', () => {
  let testCode: string;
  let ruleset: unknown;

  beforeAll(async () => {
    testCode = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    ruleset = await loadRuleset();
  });

  it('should extract design elements (design_extract)', async () => {
    const extraction = await extractDesignElements(testCode, 'test.tsx');
    
    expect(extraction.metadata).toBeDefined();
    expect(extraction.metadata.file).toBe('test.tsx');
    expect(extraction.metadata.framework).toBe('React');
    expect(Array.isArray(extraction.components)).toBe(true);
    expect(extraction.layout).toBeDefined();
    expect(extraction.spacingMap).toBeDefined();
  });

  it('should load ruleset (design_get_ruleset)', async () => {
    const loaded = await loadRuleset();
    
    expect(loaded).toBeDefined();
    expect(loaded).toHaveProperty('basePrinciples');
    expect(loaded).toHaveProperty('accessibility');
  });

  it('should audit design (design_audit)', async () => {
    const extraction = await extractDesignElements(testCode, 'test.tsx');
    const critique = scoreDesign(extraction, ruleset);
    
    expect(critique).toBeDefined();
    expect(critique.overall).toBeGreaterThanOrEqual(0);
    expect(critique.overall).toBeLessThanOrEqual(5);
    expect(critique.severity).toBeDefined();
    expect(Array.isArray(critique.violations)).toBe(true);
  });

  it('should generate refactor patches (design_refactor)', async () => {
    const extraction = await extractDesignElements(testCode, 'test.tsx');
    const critique = scoreDesign(extraction, ruleset);
    const patches = generateDeterministicFixes(extraction, critique);
    
    expect(Array.isArray(patches)).toBe(true);
    patches.forEach(patch => {
      expect(patch).toHaveProperty('type');
      expect(patch).toHaveProperty('startLine');
      expect(['insert', 'delete', 'replace']).toContain(patch.type);
    });
  });

  it('should apply patches (design_apply_patch)', async () => {
    const originalCode = 'line1\nline2\nline3';
    const patches = [
      {
        type: 'insert' as const,
        startLine: 2,
        content: 'new line',
      },
    ];
    
    // Create temporary file for testing
    const tempFile = join(__dirname, '../temp-test.txt');
    const { writeFileSync, unlinkSync } = await import('fs');
    writeFileSync(tempFile, originalCode, 'utf-8');
    
    try {
      const patched = applyPatches(tempFile, patches);
      expect(patched).toContain('new line');
    } finally {
      unlinkSync(tempFile);
    }
  });

  it('should generate components (design_generate)', () => {
    const intent = {
      type: 'button' as const,
      description: 'Primary button',
      framework: 'React',
      props: { variant: 'default', size: 'lg' },
    };
    
    const code = generateComponent(intent, ruleset as { preferredComponents?: unknown });
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
  });
});

