// Layout tree extraction

import { traverse } from '@babel/traverse';
import * as t from '@babel/types';
import { LayoutNode } from '../types/index.js';
import { getNodeLocation, ParseResult } from './ast-parser.js';
import { extractTailwindClasses } from './class-extractor.js';

export function extractLayoutTree(parseResult: ParseResult, components: Array<{ id: string; location: { start: { line: number; column: number }; end: { line: number; column: number } } }>): LayoutNode {
  let rootLayout: LayoutNode | null = null;
  const componentMap = new Map(
    components.map((c) => [`${c.location.start.line}:${c.location.start.column}`, c.id])
  );

  const findComponentId = (line: number, column: number): string | null => {
    return componentMap.get(`${line}:${column}`) || null;
  };

  const extractGap = (className?: string): string | undefined => {
    if (!className) return undefined;
    const classes = extractTailwindClasses(className);
    const gapClass = classes.find((c) => c.property === 'gap');
    return gapClass?.class;
  };

  const extractDirection = (className?: string): 'row' | 'column' | undefined => {
    if (!className) return undefined;
    if (className.includes('flex-row') || className.includes('flex-row-reverse')) {
      return 'row';
    }
    if (className.includes('flex-col') || className.includes('flex-col-reverse')) {
      return 'column';
    }
    return undefined;
  };

  const extractLayoutType = (className?: string): 'flex' | 'grid' | 'stack' | 'container' => {
    if (!className) return 'container';
    if (className.includes('grid')) return 'grid';
    if (className.includes('flex')) return 'flex';
    if (className.includes('stack') || className.includes('vstack') || className.includes('hstack')) {
      return 'stack';
    }
    return 'container';
  };

  const getClassName = (node: t.JSXElement): string | undefined => {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find(
      (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className'
    );

    if (classNameAttr && t.isJSXAttribute(classNameAttr) && classNameAttr.value) {
      if (t.isStringLiteral(classNameAttr.value)) {
        return classNameAttr.value.value;
      }
      if (t.isJSXExpressionContainer(classNameAttr.value) && t.isStringLiteral(classNameAttr.value.expression)) {
        return classNameAttr.value.expression.value;
      }
    }

    return undefined;
  };

  const buildLayoutNode = (node: t.JSXElement, depth: number = 0): LayoutNode | { ref: string } | null => {
    if (depth > 20) return null; // Prevent infinite recursion

    const className = getClassName(node);
    const location = getNodeLocation(node);
    
    if (!location) return null;

    // Check if this is a component reference
    const componentId = findComponentId(location.start.line, location.start.column);
    if (componentId) {
      return { ref: componentId };
    }

    const layoutType = extractLayoutType(className);
    const direction = extractDirection(className);
    const gap = extractGap(className);

    const children: Array<LayoutNode | { ref: string }> = [];

    for (const child of node.children) {
      if (t.isJSXElement(child)) {
        const childNode = buildLayoutNode(child, depth + 1);
        if (childNode) {
          children.push(childNode);
        }
      }
    }

    // Only create layout node if it has meaningful structure
    if (layoutType !== 'container' || children.length > 0) {
      return {
        type: layoutType,
        ...(direction && { direction }),
        ...(gap && { gap }),
        children,
      };
    }

    return null;
  };

  traverse(parseResult.ast, {
    Program(path) {
      // Find the root JSX element
      for (const statement of path.node.body) {
        if (t.isExportDefaultDeclaration(statement) && t.isFunctionDeclaration(statement.declaration)) {
          const func = statement.declaration;
          const body = func.body;
          if (body && t.isBlockStatement(body)) {
            for (const stmt of body.body) {
              if (t.isReturnStatement(stmt) && stmt.argument && t.isJSXElement(stmt.argument)) {
                rootLayout = buildLayoutNode(stmt.argument) as LayoutNode;
                break;
              }
            }
          }
        } else if (t.isExportDefaultDeclaration(statement) && t.isArrowFunctionExpression(statement.declaration)) {
          const arrow = statement.declaration;
          if (t.isJSXElement(arrow.body)) {
            rootLayout = buildLayoutNode(arrow.body) as LayoutNode;
            break;
          }
        }
      }
    },
  });

  return rootLayout || { type: 'container', children: [] };
}

