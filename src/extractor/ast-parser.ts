// AST parser for JSX/TSX/HTML

import { parse, ParserOptions } from '@babel/parser';
import * as t from '@babel/types';
import { File } from '@babel/types';
import { ExtractionError } from '../utils/errors.js';

export interface ParseResult {
  ast: File;
  source: string;
}

export function parseCode(code: string, filename?: string): ParseResult {
  try {
    const plugins: ParserOptions['plugins'] = [
      'jsx',
      'typescript',
      'decorators-legacy',
      'classProperties',
      'objectRestSpread',
      'asyncGenerators',
      'functionBind',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining',
    ];

    const ast = parse(code, {
      sourceType: 'module',
      plugins,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      tokens: true,
    });

    return { ast, source: code };
  } catch (error) {
    throw new ExtractionError(
      `Failed to parse code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filename
    );
  }
}

export function isJSXElement(node: t.Node): node is t.JSXElement {
  return t.isJSXElement(node);
}

export function isJSXOpeningElement(node: t.Node): node is t.JSXOpeningElement {
  return t.isJSXOpeningElement(node);
}

export function getNodeLocation(node: t.Node): { start: { line: number; column: number }; end: { line: number; column: number } } | null {
  if (!node.loc) return null;
  
  return {
    start: {
      line: node.loc.start.line,
      column: node.loc.start.column,
    },
    end: {
      line: node.loc.end.line,
      column: node.loc.end.column,
    },
  };
}

