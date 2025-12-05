// Component tree extraction

import { traverse } from '@babel/traverse';
import * as t from '@babel/types';
import { ComponentNode, Location } from '../types/index.js';
import { getNodeLocation, isJSXElement, isJSXOpeningElement, ParseResult } from './ast-parser.js';
import { ExtractionError } from '../utils/errors.js';

export function extractComponentTree(parseResult: ParseResult, framework: string = 'React'): ComponentNode[] {
  const components: ComponentNode[] = [];
  let componentIdCounter = 0;

  const generateId = (name: string): string => {
    return `${name.toLowerCase()}${componentIdCounter++}`;
  };

  const extractProps = (attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[]): Record<string, unknown> => {
    const props: Record<string, unknown> = {};
    
    for (const attr of attributes) {
      if (t.isJSXAttribute(attr)) {
        const name = attr.name.name;
        if (typeof name === 'string') {
          if (attr.value) {
            if (t.isStringLiteral(attr.value)) {
              props[name] = attr.value.value;
            } else if (t.isJSXExpressionContainer(attr.value)) {
              if (t.isBooleanLiteral(attr.value.expression)) {
                props[name] = attr.value.expression.value;
              } else if (t.isNumericLiteral(attr.value.expression)) {
                props[name] = attr.value.expression.value;
              } else {
                props[name] = '[expression]';
              }
            } else if (t.isBooleanLiteral(attr.value)) {
              props[name] = attr.value.value;
            }
          } else {
            props[name] = true;
          }
        }
      }
    }
    
    return props;
  };

  const detectLibrary = (name: string, props: Record<string, unknown>): string | undefined => {
    // shadcn detection
    if (name.includes('Button') || name.includes('Card') || name.includes('Dialog')) {
      if (props.variant || props.size) {
        return 'shadcn';
      }
    }
    
    // Framework detection
    if (framework === 'React') {
      return 'react';
    }
    
    return undefined;
  };

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const openingElement = node.openingElement;
      const name = openingElement.name;

      let componentName: string;
      if (t.isJSXIdentifier(name)) {
        componentName = name.name;
      } else if (t.isJSXMemberExpression(name)) {
        const object = t.isJSXIdentifier(name.object) ? name.object.name : '';
        const property = t.isJSXIdentifier(name.property) ? name.property.name : '';
        componentName = `${object}.${property}`;
      } else {
        return;
      }

      // Skip HTML elements (lowercase)
      if (componentName[0] === componentName[0].toLowerCase() && componentName[0] !== componentName[0].toUpperCase()) {
        return;
      }

      const location = getNodeLocation(node);
      if (!location) return;

      const props = extractProps(openingElement.attributes);
      const library = detectLibrary(componentName, props);
      const id = generateId(componentName);

      components.push({
        id,
        name: componentName,
        library,
        props,
        location,
      });
    },
  });

  return components;
}

export function detectFramework(parseResult: ParseResult): string {
  // Check imports for framework indicators
  let framework = 'Unknown';

  traverse(parseResult.ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (typeof source === 'string') {
        if (source === 'react' || source.startsWith('react/')) {
          framework = 'React';
        } else if (source === 'vue' || source.startsWith('@vue/')) {
          framework = 'Vue';
        } else if (source === 'svelte') {
          framework = 'Svelte';
        }
      }
    },
  });

  return framework;
}

