// Accessibility indicator extraction

import { traverse } from '@babel/traverse';
import * as t from '@babel/types';
import { AccessibilityIndicator } from '../types/index.js';
import { getNodeLocation, ParseResult } from './ast-parser.js';

export function extractAccessibility(parseResult: ParseResult, components: Array<{ id: string; name: string }>): AccessibilityIndicator {
  const missingAriaLabels: string[] = [];
  let keyboardNavigable = true;
  const contrastViolations: Array<{ element: string; contrastRatio: number }> = [];

  const componentMap = new Map(components.map((c) => [c.id, c.name]));

  const hasAriaLabel = (node: t.JSXElement): boolean => {
    const openingElement = node.openingElement;
    return openingElement.attributes.some(
      (attr) =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        (attr.name.name === 'aria-label' ||
          attr.name.name === 'aria-labelledby' ||
          attr.name.name === 'aria-describedby')
    );
  };

  const isInteractiveElement = (node: t.JSXElement): boolean => {
    const name = node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      const tagName = name.name.toLowerCase();
      return ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
    }
    return false;
  };

  const checkContrast = (node: t.JSXElement): void => {
    // Simplified contrast check - in production, would analyze actual color values
    const className = getClassName(node);
    if (className) {
      // Check for common low-contrast patterns
      if (className.includes('text-gray-400') || className.includes('text-gray-500')) {
        const location = getNodeLocation(node);
        if (location) {
          const elementId = `${location.start.line}:${location.start.column}`;
          contrastViolations.push({
            element: elementId,
            contrastRatio: 3.0, // Estimated
          });
        }
      }
    }
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
    }

    return undefined;
  };

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const location = getNodeLocation(node);
      
      if (!location) return;

      // Check for missing aria labels on interactive elements
      if (isInteractiveElement(node)) {
        const elementId = `${location.start.line}:${location.start.column}`;
        if (!hasAriaLabel(node)) {
          // Check if it has visible text content
          const hasText = node.children.some(
            (child) => t.isJSXText(child) && child.value.trim().length > 0
          );
          if (!hasText) {
            missingAriaLabels.push(elementId);
          }
        }
      }

      // Check for keyboard navigation (simplified - would need more analysis)
      const name = node.openingElement.name;
      if (t.isJSXIdentifier(name) && name.name === 'button') {
        const disabled = node.openingElement.attributes.some(
          (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'disabled'
        );
        if (disabled) {
          keyboardNavigable = false;
        }
      }

      // Check contrast
      checkContrast(node);
    },
  });

  return {
    missingAriaLabels,
    keyboardNavigable,
    contrastViolations,
  };
}

