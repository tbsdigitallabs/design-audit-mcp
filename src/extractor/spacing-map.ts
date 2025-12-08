// Spacing map extraction

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ParseResult } from './ast-parser.js';
import { extractTailwindClasses } from './class-extractor.js';

export interface SpacingEntry {
  class: string;
  value: string;
}

export function extractSpacingMap(parseResult: ParseResult): Record<string, SpacingEntry> {
  const spacingMap: Record<string, SpacingEntry> = {};

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

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const location = node.loc;
      if (!location) return;

      const className = getClassName(node);
      if (!className) return;

      const classes = extractTailwindClasses(className);
      const spacingClasses = classes.filter(
        (c) => c.property.startsWith('margin') || c.property.startsWith('padding') || c.property === 'gap'
      );

      for (const spacingClass of spacingClasses) {
        const key = `${location.start.line}:${location.start.column}`;
        spacingMap[key] = {
          class: spacingClass.class,
          value: spacingClass.value,
        };
      }
    },
  });

  return spacingMap;
}

