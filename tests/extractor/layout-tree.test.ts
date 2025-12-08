import { describe, it, expect } from 'vitest';
import { parseCode } from '../../src/extractor/ast-parser.js';
import { extractComponentTree } from '../../src/extractor/component-tree.js';
import { extractLayoutTree } from '../../src/extractor/layout-tree.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Layout Tree Extraction', () => {
  it('should extract flex layout', () => {
    const code = `
      export function Layout() {
        return <div className="flex flex-row gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    expect(layout.type).toBe('flex');
    expect(layout.direction).toBe('row');
    expect(layout.gap).toBeDefined();
  });

  it('should extract grid layout', () => {
    const code = `
      export function Grid() {
        return <div className="grid grid-cols-3 gap-6">
          <div>Item</div>
        </div>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    expect(layout.type).toBe('grid');
    expect(layout.gap).toBeDefined();
  });

  it('should handle component references', () => {
    const code = `
      export function Page() {
        return <div className="container">
          <Button>Click</Button>
        </div>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    // Should wrap component reference in container
    expect(layout.type).toBe('container');
    expect(layout.children.length).toBeGreaterThan(0);
  });

  it('should extract nested layouts', () => {
    const code = `
      export function Nested() {
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4">
              <div>Item 1</div>
              <div>Item 2</div>
            </div>
          </div>
        );
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    expect(layout.type).toBe('flex');
    expect(layout.children.length).toBeGreaterThan(0);
  });

  it('should always return valid LayoutNode', () => {
    const code = `
      export function Component() {
        return <Button>Click</Button>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    // Should always have type property (no unsafe cast)
    expect(layout).toBeDefined();
    expect(layout.type).toBeDefined();
    expect(typeof layout.type).toBe('string');
    expect(layout.children).toBeDefined();
    expect(Array.isArray(layout.children)).toBe(true);
  });

  it('should extract from fixture files', () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    const layout = extractLayoutTree(parseResult, components);
    
    expect(layout.type).toBeDefined();
    expect(layout.children).toBeDefined();
  });
});

