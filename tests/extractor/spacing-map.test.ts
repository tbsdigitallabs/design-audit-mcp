import { describe, it, expect } from 'vitest';
import { parseCode } from '../../src/extractor/ast-parser.js';
import { extractSpacingMap } from '../../src/extractor/spacing-map.js';

describe('Spacing Map Extraction', () => {
  it('should extract margin classes', () => {
    const code = `
      export function Component() {
        return <div className="mt-4 mb-2">Content</div>;
      }
    `;
    const parseResult = parseCode(code);
    const spacingMap = extractSpacingMap(parseResult);
    
    expect(Object.keys(spacingMap).length).toBeGreaterThan(0);
    const entries = Object.values(spacingMap);
    expect(entries.some(e => e.class.includes('mt-'))).toBe(true);
  });

  it('should extract padding classes', () => {
    const code = `
      export function Component() {
        return <div className="px-4 py-2">Content</div>;
      }
    `;
    const parseResult = parseCode(code);
    const spacingMap = extractSpacingMap(parseResult);
    
    const entries = Object.values(spacingMap);
    expect(entries.some(e => e.class.includes('p'))).toBe(true);
  });

  it('should extract gap classes', () => {
    const code = `
      export function Component() {
        return <div className="flex gap-4">Content</div>;
      }
    `;
    const parseResult = parseCode(code);
    const spacingMap = extractSpacingMap(parseResult);
    
    const entries = Object.values(spacingMap);
    expect(entries.some(e => e.class.includes('gap'))).toBe(true);
  });

  it('should map spacing to locations', () => {
    const code = `
      export function Component() {
        return <div className="mt-4">Line 2</div>;
      }
    `;
    const parseResult = parseCode(code);
    const spacingMap = extractSpacingMap(parseResult);
    
    const keys = Object.keys(spacingMap);
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach(key => {
      expect(key).toMatch(/^\d+:\d+$/); // Format: line:column
    });
  });

  it('should extract spacing values', () => {
    const code = `
      export function Component() {
        return <div className="mt-4">Content</div>;
      }
    `;
    const parseResult = parseCode(code);
    const spacingMap = extractSpacingMap(parseResult);
    
    const entries = Object.values(spacingMap);
    if (entries.length > 0) {
      expect(entries[0].value).toBeDefined();
      expect(entries[0].class).toBeDefined();
    }
  });
});

