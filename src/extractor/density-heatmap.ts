// Density heatmap calculation

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ParseResult } from './ast-parser.js';

export function calculateDensityHeatmap(parseResult: ParseResult): Record<string, number> {
  const regions: Record<string, number> = {
    header: 0,
    sidebar: 0,
    content: 0,
    footer: 0,
  };

  let totalElements = 0;
  const elementCounts: Record<string, number> = {
    header: 0,
    sidebar: 0,
    content: 0,
    footer: 0,
  };

  const classifyRegion = (node: t.JSXElement): string | null => {
    const name = node.openingElement.name;
    if (t.isJSXIdentifier(name)) {
      const tagName = name.name.toLowerCase();
      if (tagName.includes('header') || tagName.includes('nav')) {
        return 'header';
      }
      if (tagName.includes('sidebar') || tagName.includes('aside')) {
        return 'sidebar';
      }
      if (tagName.includes('footer')) {
        return 'footer';
      }
    }

    const className = getClassName(node);
    if (className) {
      if (className.includes('header') || className.includes('nav')) {
        return 'header';
      }
      if (className.includes('sidebar') || className.includes('aside')) {
        return 'sidebar';
      }
      if (className.includes('footer')) {
        return 'footer';
      }
    }

    return 'content';
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
      const region = classifyRegion(node);
      if (region) {
        elementCounts[region]++;
        totalElements++;
      }
    },
  });

  // Normalize to 0-1 scale
  if (totalElements > 0) {
    for (const region of Object.keys(regions)) {
      regions[region] = Math.min(elementCounts[region] / totalElements, 1.0);
    }
  }

  return regions;
}

