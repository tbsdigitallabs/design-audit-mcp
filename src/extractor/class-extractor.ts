// PostCSS/Tailwind class extractor

import postcss from 'postcss';
import { ExtractionError } from '../utils/errors.js';

export interface ClassToken {
  class: string;
  value: string;
  property: string;
}

const TAILWIND_SPACING_PATTERN = /^(m|p|gap|space)-([xy]|t|r|b|l)?-?(\d+|px)$/;
const TAILWIND_TYPOGRAPHY_PATTERN = /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/;
const TAILWIND_LINE_HEIGHT_PATTERN = /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/;

export function extractTailwindClasses(className: string): ClassToken[] {
  const classes = className.split(/\s+/).filter(Boolean);
  const tokens: ClassToken[] = [];

  for (const cls of classes) {
    // Spacing classes
    const spacingMatch = cls.match(TAILWIND_SPACING_PATTERN);
    if (spacingMatch) {
      const [, prefix, direction, value] = spacingMatch;
      const property = prefix === 'm' ? 'margin' : prefix === 'p' ? 'padding' : prefix;
      const remValue = convertTailwindValue(value);
      tokens.push({
        class: cls,
        value: remValue,
        property: direction ? `${property}-${direction}` : property,
      });
      continue;
    }

    // Typography classes
    if (TAILWIND_TYPOGRAPHY_PATTERN.test(cls)) {
      const sizeMatch = cls.match(/^text-(.+)$/);
      if (sizeMatch) {
        tokens.push({
          class: cls,
          value: getTypographySize(sizeMatch[1]),
          property: 'font-size',
        });
      }
    }

    // Line height classes
    if (TAILWIND_LINE_HEIGHT_PATTERN.test(cls)) {
      const lhMatch = cls.match(/^leading-(.+)$/);
      if (lhMatch) {
        tokens.push({
          class: cls,
          value: getLineHeight(lhMatch[1]),
          property: 'line-height',
        });
      }
    }
  }

  return tokens;
}

function convertTailwindValue(value: string): string {
  if (value === 'px') return '1px';
  const num = parseInt(value, 10);
  return `${num * 0.25}rem`; // Tailwind default: 1 = 0.25rem
}

function getTypographySize(size: string): string {
  const sizes: Record<string, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  };
  return sizes[size] || '1rem';
}

function getLineHeight(lh: string): string {
  const heights: Record<string, string> = {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  };
  if (heights[lh]) return heights[lh];
  const num = parseFloat(lh);
  return isNaN(num) ? '1.5' : num.toString();
}

export function parseCSSClasses(css: string): ClassToken[] {
  try {
    const root = postcss.parse(css);
    const tokens: ClassToken[] = [];

    root.walkRules((rule) => {
      rule.walkDecls((decl) => {
        tokens.push({
          class: rule.selector,
          value: decl.value,
          property: decl.prop,
        });
      });
    });

    return tokens;
  } catch (error) {
    throw new ExtractionError(
      `Failed to parse CSS: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

