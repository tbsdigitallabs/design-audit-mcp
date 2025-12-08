import { describe, it, expect } from 'vitest';
import { scoreDesign } from '../../src/critique/scorer.js';
import { extractDesignElements } from '../../src/extractor/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Design Scorer', () => {
  it('should score design with all categories', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    const critique = scoreDesign(extraction, {});
    
    expect(critique.hierarchy).toBeDefined();
    expect(critique.spacingRhythm).toBeDefined();
    expect(critique.visualNoise).toBeDefined();
    expect(critique.grouping).toBeDefined();
    expect(critique.flow).toBeDefined();
    expect(critique.imagery).toBeDefined();
    expect(critique.balanceDensity).toBeDefined();
    expect(critique.alignmentGrid).toBeDefined();
    expect(critique.contrastColour).toBeDefined();
    expect(critique.accessibility).toBeDefined();
  });

  it('should calculate overall score', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    const critique = scoreDesign(extraction, {});
    
    expect(critique.overall).toBeGreaterThanOrEqual(0);
    expect(critique.overall).toBeLessThanOrEqual(5);
  });

  it('should assign severity level', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    const critique = scoreDesign(extraction, {});
    
    expect(['Critical', 'Major', 'Moderate', 'Minor', 'Excellent']).toContain(critique.severity);
  });

  it('should generate violations', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/form-with-issues.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    const critique = scoreDesign(extraction, {});
    
    expect(Array.isArray(critique.violations)).toBe(true);
  });

  it('should be deterministic', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    
    const critique1 = scoreDesign(extraction, {});
    const critique2 = scoreDesign(extraction, {});
    
    // Same input should produce same output
    expect(critique1.overall).toBe(critique2.overall);
    expect(critique1.severity).toBe(critique2.severity);
    expect(critique1.hierarchy.score).toBe(critique2.hierarchy.score);
  });

  it('should weight categories correctly', async () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const extraction = await extractDesignElements(code, 'test.tsx');
    const critique = scoreDesign(extraction, {});
    
    // Hierarchy should have weight 0.20
    expect(critique.hierarchy.weight).toBe(0.20);
    // Spacing should have weight 0.15
    expect(critique.spacingRhythm.weight).toBe(0.15);
  });
});

