// Flow outline generation

import { traverse } from '@babel/traverse';
import * as t from '@babel/types';
import { FlowNode } from '../types/index.js';
import { getNodeLocation, ParseResult } from './ast-parser.js';

export function extractFlowOutline(parseResult: ParseResult, components: Array<{ id: string; name: string; location: { start: { line: number; column: number }; end: { line: number; column: number } } }>): FlowNode[] {
  const flow: FlowNode[] = [];
  let stepCounter = 1;

  const isInteractive = (node: t.JSXElement): boolean => {
    const name = node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      const tagName = name.name.toLowerCase();
      return ['button', 'a', 'input', 'select', 'textarea', 'form'].includes(tagName);
    }
    return false;
  };

  const isHeading = (node: t.JSXElement): boolean => {
    const name = node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(name.name.toLowerCase());
    }
    return false;
  };

  const getComponentId = (location: { start: { line: number; column: number }; end: { line: number; column: number } }): string | null => {
    for (const comp of components) {
      if (
        comp.location.start.line === location.start.line &&
        comp.location.start.column === location.start.column
      ) {
        return comp.id;
      }
    }
    return null;
  };

  const generateDescription = (node: t.JSXElement, componentId: string | null): string => {
    const name = node.openingElement.name;
    
    if (t.isJSXIdentifier(name)) {
      const tagName = name.name.toLowerCase();
      
      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        const text = extractTextContent(node);
        return `User reads ${tagName}: "${text.substring(0, 50)}"`;
      }
      
      if (tagName === 'button') {
        const text = extractTextContent(node);
        return `User clicks button: "${text || 'Submit'}"`;
      }
      
      if (tagName === 'form') {
        return 'User fills in the form';
      }
      
      if (tagName === 'input') {
        const type = getAttributeValue(node, 'type') || 'text';
        return `User enters ${type} input`;
      }
    }
    
    if (componentId) {
      return `User interacts with ${componentId}`;
    }
    
    return 'User views content';
  };

  const extractTextContent = (node: t.JSXElement): string => {
    let text = '';
    for (const child of node.children) {
      if (t.isJSXText(child)) {
        text += child.value.trim() + ' ';
      } else if (t.isJSXElement(child)) {
        text += extractTextContent(child) + ' ';
      }
    }
    return text.trim();
  };

  const getAttributeValue = (node: t.JSXElement, name: string): string | undefined => {
    const openingElement = node.openingElement;
    const attr = openingElement.attributes.find(
      (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === name
    );

    if (attr && t.isJSXAttribute(attr) && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        return attr.value.value;
      }
    }

    return undefined;
  };

  // Traverse in order to capture flow
  const visited = new Set<string>();

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const location = getNodeLocation(node);
      
      if (!location) return;

      const key = `${location.start.line}:${location.start.column}`;
      if (visited.has(key)) return;
      visited.add(key);

      if (isHeading(node) || isInteractive(node)) {
        const componentId = getComponentId(location) || key;
        const description = generateDescription(node, componentId);
        
        flow.push({
          step: stepCounter++,
          id: componentId,
          description,
        });
      }
    },
  });

  return flow;
}

