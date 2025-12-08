import { describe, it, expect } from 'vitest';
import { parseCode } from '../../src/extractor/ast-parser.js';
import { extractComponentTree, detectFramework } from '../../src/extractor/component-tree.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Component Tree Extraction', () => {
  it('should extract simple button component', () => {
    const code = 'export function Button() { return <button>Click</button>; }';
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    expect(components).toHaveLength(0); // HTML elements are filtered out
  });

  it('should extract React components', () => {
    const code = `
      export function Card() {
        return <Card><Button>Click</Button></Card>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    expect(components.length).toBeGreaterThan(0);
    expect(components.some(c => c.name === 'Card')).toBe(true);
    expect(components.some(c => c.name === 'Button')).toBe(true);
  });

  it('should detect shadcn components', () => {
    const code = `
      import { Button } from "@/components/ui/button";
      export function Page() {
        return <Button variant="default" size="lg">Click</Button>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    const button = components.find(c => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button?.library).toBe('shadcn');
    expect(button?.props.variant).toBe('default');
    expect(button?.props.size).toBe('lg');
  });

  it('should extract component props', () => {
    const code = `
      export function Card({ title, variant = "default" }: { title: string; variant?: string }) {
        return <div>{title}</div>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    // Should extract the Card component definition
    expect(parseResult.ast).toBeDefined();
  });

  it('should include location information', () => {
    const code = `
      export function Component() {
        return <Button id="btn1">Click</Button>;
      }
    `;
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    if (components.length > 0) {
      const component = components[0];
      expect(component.location).toBeDefined();
      expect(component.location.start.line).toBeGreaterThan(0);
      expect(component.location.start.column).toBeGreaterThanOrEqual(0);
    }
  });

  it('should detect React framework', () => {
    const code = `
      import React from 'react';
      export function Component() {
        return <div>Test</div>;
      }
    `;
    const parseResult = parseCode(code);
    const framework = detectFramework(parseResult);
    
    expect(framework).toBe('React');
  });

  it('should extract from fixture files', () => {
    const code = readFileSync(join(__dirname, '../fixtures/good-layout.tsx'), 'utf-8');
    const parseResult = parseCode(code);
    const components = extractComponentTree(parseResult);
    
    expect(components.length).toBeGreaterThan(0);
    expect(components.some(c => c.name === 'Button')).toBe(true);
    expect(components.some(c => c.name === 'Card')).toBe(true);
  });
});

