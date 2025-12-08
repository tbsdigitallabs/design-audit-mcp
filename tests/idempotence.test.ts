import { describe, it, expect } from 'vitest';
import { extractDesignElements } from '../src/extractor/index.js';
import { scoreDesign } from '../src/critique/scorer.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Idempotence Tests', () => {
  it('should produce identical extractions for same input', async () => {
    const code = readFileSync(join(__dirname, 'fixtures/good-layout.tsx'), 'utf-8');
    
    const extraction1 = await extractDesignElements(code, 'test.tsx');
    const extraction2 = await extractDesignElements(code, 'test.tsx');
    
    // Metadata timestamp will differ, so compare other fields
    expect(extraction1.components.length).toBe(extraction2.components.length);
    expect(extraction1.layout.type).toBe(extraction2.layout.type);
    expect(extraction1.spacingMap).toEqual(extraction2.spacingMap);
    expect(extraction1.typographyMap).toEqual(extraction2.typographyMap);
    expect(extraction1.imagery.length).toBe(extraction2.imagery.length);
  });

  it('should produce identical scores for same extraction', async () => {
    const code = readFileSync(join(__dirname, 'fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    
    const critique1 = scoreDesign(extraction, {});
    const critique2 = scoreDesign(extraction, {});
    
    expect(critique1.overall).toBe(critique2.overall);
    expect(critique1.severity).toBe(critique2.severity);
    expect(critique1.hierarchy.score).toBe(critique2.hierarchy.score);
    expect(critique1.spacingRhythm.score).toBe(critique2.spacingRhythm.score);
    expect(critique1.violations.length).toBe(critique2.violations.length);
  });

  it('should handle multiple runs consistently', async () => {
    const code = readFileSync(join(__dirname, 'fixtures/simple-button.tsx'), 'utf-8');
    
    const results = [];
    for (let i = 0; i < 5; i++) {
      const extraction = await extractDesignElements(code, 'test.tsx');
      const critique = scoreDesign(extraction, {});
      results.push({
        components: extraction.components.length,
        overall: critique.overall,
        severity: critique.severity,
      });
    }
    
    // All runs should produce same results
    const first = results[0];
    results.forEach(result => {
      expect(result.components).toBe(first.components);
      expect(result.overall).toBe(first.overall);
      expect(result.severity).toBe(first.severity);
    });
  });
});

