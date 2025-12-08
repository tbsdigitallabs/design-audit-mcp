// Image reference extraction

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ImageReference } from '../types/index.js';
import { getNodeLocation, ParseResult } from './ast-parser.js';

export function extractImagery(parseResult: ParseResult): ImageReference[] {
  const images: ImageReference[] = [];
  let imageIdCounter = 0;

  const generateId = (): string => {
    return `img${imageIdCounter++}`;
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
      if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
        return attr.value.expression.value;
      }
    }

    return undefined;
  };

  const determineRole = (alt?: string, src?: string): 'decorative' | 'informative' | 'functional' => {
    // If alt is empty or missing, likely decorative
    if (!alt || alt.trim() === '') {
      return 'decorative';
    }

    // If alt describes content, it's informative
    if (alt.length > 10) {
      return 'informative';
    }

    // Check if it's an icon or button (functional)
    if (src?.includes('icon') || src?.includes('button') || src?.includes('arrow')) {
      return 'functional';
    }

    return 'informative';
  };

  traverse(parseResult.ast, {
    JSXElement(path) {
      const node = path.node;
      const name = node.openingElement.name;

      // Check for <img> tags
      if (t.isJSXIdentifier(name) && name.name === 'img') {
        const location = getNodeLocation(node);
        if (!location) return;

        const src = getAttributeValue(node, 'src');
        const alt = getAttributeValue(node, 'alt');
        const role = determineRole(alt, src);

        images.push({
          id: generateId(),
          src: src || '',
          role,
          alt,
          location,
        });
        return;
      }

      // Check for Image components (React, Next.js, etc.) - img tags already handled above
      if (t.isJSXIdentifier(name) && name.name === 'Image') {
        const location = getNodeLocation(node);
        if (!location) return;

        const src = getAttributeValue(node, 'src') || getAttributeValue(node, 'source');
        const alt = getAttributeValue(node, 'alt');
        const role = determineRole(alt, src);

        images.push({
          id: generateId(),
          src: src || '',
          role,
          alt,
          location,
        });
      }
    },
  });

  return images;
}

