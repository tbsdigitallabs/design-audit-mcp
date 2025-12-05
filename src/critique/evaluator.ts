// Design evaluation engine

import { DesignExtraction } from '../types/index.js';

export function evaluateCategory(
  category: string,
  extraction: DesignExtraction,
  ruleset: unknown
): number {
  // Deterministic evaluation based on extraction data
  // Returns score 0-5

  switch (category) {
    case 'hierarchy':
      return evaluateHierarchy(extraction);
    case 'spacingRhythm':
      return evaluateSpacingRhythm(extraction);
    case 'visualNoise':
      return evaluateVisualNoise(extraction);
    case 'grouping':
      return evaluateGrouping(extraction);
    case 'flow':
      return evaluateFlow(extraction);
    case 'imagery':
      return evaluateImagery(extraction);
    case 'balanceDensity':
      return evaluateBalanceDensity(extraction);
    case 'alignmentGrid':
      return evaluateAlignmentGrid(extraction);
    case 'contrastColour':
      return evaluateContrastColour(extraction);
    case 'accessibility':
      return evaluateAccessibility(extraction);
    default:
      return 3.0; // Neutral score
  }
}

function evaluateHierarchy(extraction: DesignExtraction): number {
  // Check for heading hierarchy
  const hasH1 = Object.keys(extraction.typographyMap).includes('h1');
  const hasH2 = Object.keys(extraction.typographyMap).includes('h2');
  const hasMultipleHeadings = Object.keys(extraction.typographyMap).filter((k) => k.startsWith('h')).length > 1;

  let score = 3.0;
  if (hasH1) score += 0.5;
  if (hasH2) score += 0.5;
  if (hasMultipleHeadings) score += 0.5;
  if (extraction.components.some((c) => c.name.toLowerCase().includes('button'))) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateSpacingRhythm(extraction: DesignExtraction): number {
  const spacingValues = Object.values(extraction.spacingMap).map((s) => parseFloat(s.value));
  if (spacingValues.length === 0) return 3.0;

  // Check for consistency (simplified - would use actual spacing scale in production)
  const uniqueValues = new Set(spacingValues);
  const consistency = uniqueValues.size / spacingValues.length;

  let score = 3.0;
  if (consistency > 0.7) score += 1.0;
  if (spacingValues.length > 5) score += 0.5;
  if (extraction.layout.gap) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateVisualNoise(extraction: DesignExtraction): number {
  const imageCount = extraction.imagery.length;
  const decorativeImages = extraction.imagery.filter((img) => img.role === 'decorative').length;
  const componentCount = extraction.components.length;

  let score = 4.0;
  if (decorativeImages > imageCount * 0.5) score -= 1.0;
  if (componentCount > 20) score -= 0.5;
  if (decorativeImages === 0) score += 0.5;

  return Math.max(0, Math.min(5.0, score));
}

function evaluateGrouping(extraction: DesignExtraction): number {
  const layoutChildren = countLayoutChildren(extraction.layout);
  const componentCount = extraction.components.length;

  let score = 3.0;
  if (layoutChildren > 0) score += 1.0;
  if (componentCount > 5 && layoutChildren > componentCount * 0.3) score += 0.5;
  if (extraction.layout.type !== 'container') score += 0.5;

  return Math.min(5.0, score);
}

function evaluateFlow(extraction: DesignExtraction): number {
  const flowSteps = extraction.flowOutline.length;
  const hasInteractiveElements = extraction.components.some(
    (c) => c.name.toLowerCase().includes('button') || c.name.toLowerCase().includes('link')
  );

  let score = 3.0;
  if (flowSteps > 0) score += 1.0;
  if (hasInteractiveElements) score += 0.5;
  if (flowSteps > 3) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateImagery(extraction: DesignExtraction): number {
  const totalImages = extraction.imagery.length;
  const informativeImages = extraction.imagery.filter((img) => img.role === 'informative').length;
  const decorativeImages = extraction.imagery.filter((img) => img.role === 'decorative').length;

  if (totalImages === 0) return 4.0;

  let score = 3.0;
  if (informativeImages > decorativeImages) score += 1.0;
  if (decorativeImages === 0) score += 0.5;
  if (extraction.imagery.every((img) => img.alt)) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateBalanceDensity(extraction: DesignExtraction): number {
  const densities = Object.values(extraction.densityHeatmap);
  if (densities.length === 0) return 3.0;

  const avgDensity = densities.reduce((a, b) => a + b, 0) / densities.length;
  const maxDensity = Math.max(...densities);
  const minDensity = Math.min(...densities);
  const balance = 1 - (maxDensity - minDensity);

  let score = 3.0;
  if (balance > 0.6) score += 1.0;
  if (avgDensity > 0.3 && avgDensity < 0.7) score += 0.5;
  if (maxDensity < 0.9) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateAlignmentGrid(extraction: DesignExtraction): number {
  const hasGrid = extraction.layout.type === 'grid';
  const hasFlex = extraction.layout.type === 'flex';

  let score = 3.0;
  if (hasGrid || hasFlex) score += 1.0;
  if (extraction.layout.direction) score += 0.5;
  if (extraction.layout.gap) score += 0.5;

  return Math.min(5.0, score);
}

function evaluateContrastColour(extraction: DesignExtraction): number {
  const contrastViolations = extraction.accessibility.contrastViolations.length;

  let score = 4.0;
  if (contrastViolations === 0) score += 1.0;
  else score -= contrastViolations * 0.5;

  return Math.max(0, Math.min(5.0, score));
}

function evaluateAccessibility(extraction: DesignExtraction): number {
  const missingLabels = extraction.accessibility.missingAriaLabels.length;
  const contrastViolations = extraction.accessibility.contrastViolations.length;
  const keyboardNavigable = extraction.accessibility.keyboardNavigable;

  let score = 3.0;
  if (missingLabels === 0) score += 1.0;
  if (contrastViolations === 0) score += 0.5;
  if (keyboardNavigable) score += 0.5;
  if (missingLabels > 0) score -= missingLabels * 0.3;

  return Math.max(0, Math.min(5.0, score));
}

function countLayoutChildren(layout: { children: unknown[] }): number {
  let count = layout.children.length;
  for (const child of layout.children) {
    if (typeof child === 'object' && child !== null && 'children' in child) {
      count += countLayoutChildren(child as { children: unknown[] });
    }
  }
  return count;
}

