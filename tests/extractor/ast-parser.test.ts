import { describe, it, expect } from 'vitest';
import { parseCode } from '../../src/extractor/ast-parser.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('AST Parser', () => {
  it('should parse simple JSX code', () => {
    const code = 'export function Button() { return <button>Click</button>; }';
    const result = parseCode(code);
    
    expect(result.ast).toBeDefined();
    expect(result.source).toBe(code);
    expect(result.ast.type).toBe('File');
  });

  it('should parse TypeScript with JSX', () => {
    const code = `
      interface Props {
        label: string;
      }
      export function Button({ label }: Props) {
        return <button>{label}</button>;
      }
    `;
    const result = parseCode(code);
    
    expect(result.ast).toBeDefined();
    expect(result.ast.program.body.length).toBeGreaterThan(0);
  });

  it('should handle complex component with props', () => {
    const code = `
      export function Card({ title, children }: { title: string; children: React.ReactNode }) {
        return (
          <div className="card">
            <h2>{title}</h2>
            {children}
          </div>
        );
      }
    `;
    const result = parseCode(code);
    
    expect(result.ast).toBeDefined();
  });

  it('should throw error on invalid syntax', () => {
    const code = 'export function Button() { return <button>; }';
    
    expect(() => parseCode(code)).toThrow();
  });

  it('should parse fixture files', () => {
    const fixtures = ['simple-button.tsx', 'form-with-issues.tsx', 'good-layout.tsx'];
    
    for (const fixture of fixtures) {
      const code = readFileSync(join(__dirname, '../fixtures', fixture), 'utf-8');
      const result = parseCode(code, fixture);
      
      expect(result.ast).toBeDefined();
      expect(result.source).toBe(code);
    }
  });
});

