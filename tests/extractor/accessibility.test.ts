import { describe, it, expect } from 'vitest';
import { parseCode } from '../../src/extractor/ast-parser.js';
import { extractComponentTree } from '../../src/extractor/component-tree.js';
import { extractAccessibility } from '../../src/extractor/accessibility.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Accessibility Extraction', () => {
  it('should detect missing aria labels', () => {
    const code = `
      export function Form() {
        return (
          <form>
            <button>Submit</button>
          </form>
        );
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const accessibility = extractAccessibility(parseResult, components);
    
    expect(accessibility.missingAriaLabels.length).toBeGreaterThan(0);
  });

  it('should detect buttons with aria labels', () => {
    const code = `
      export function Form() {
        return (
          <form>
            <button aria-label="Submit form">Submit</button>
          </form>
        );
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const accessibility = extractAccessibility(parseResult, components);
    
    // Buttons with text content should not be flagged
    expect(accessibility.missingAriaLabels.length).toBe(0);
  });

  it('should detect contrast violations', () => {
    const code = `
      export function Component() {
        return <div className="text-gray-400">Low contrast text</div>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const accessibility = extractAccessibility(parseResult, components);
    
    expect(accessibility.contrastViolations.length).toBeGreaterThan(0);
  });

  it('should check keyboard navigability', () => {
    const code = `
      export function Component() {
        return (
          <div>
            <button>Click</button>
            <button disabled>Disabled</button>
          </div>
        );
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const accessibility = extractAccessibility(parseResult, components);
    
    expect(typeof accessibility.keyboardNavigable).toBe('boolean');
  });

  it('should extract from fixture with issues', () => {
    const code = readFileSync(join(__dirname, '../fixtures/form-with-issues.tsx'), 'utf-8');
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const accessibility = extractAccessibility(parseResult, components);
    
    expect(accessibility).toBeDefined();
    expect(accessibility.missingAriaLabels).toBeDefined();
    expect(accessibility.contrastViolations).toBeDefined();
  });
});

