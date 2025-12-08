// Typography map extraction

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ParseResult } from './ast-parser.js';
import { extractTailwindClasses } from './class-extractor.js';

export interface TypographyEntry {
  class: string;
  lineHeight: string;
}

export function extractTypographyMap(parseResult: ParseResult): Record<string, TypographyEntry> {
  const typographyMap: Record<string, TypographyEntry> = {};

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

  const getElementType = (node: t.JSXElement): string => {
    const name = node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      return name.name;
    }
    return 'div';
  };

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const elementType = getElementType(node);
      
      // Only track typography for text-related elements
      if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label', 'button', 'a'].includes(elementType)) {
        return;
      }

      const className = getClassName(node);
      if (!className) return;

      const classes = extractTailwindClasses(className);
      const textClass = classes.find((c) => c.property === 'font-size');
      const lineHeightClass = classes.find((c) => c.property === 'line-height');

      if (textClass) {
        typographyMap[elementType] = {
          class: textClass.class,
          lineHeight: lineHeightClass?.value || '1.5',
        };
      }
    },
  });

  return typographyMap;
}

