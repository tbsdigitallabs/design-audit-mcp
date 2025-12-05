// Unified extraction interface

import { DesignExtraction } from '../types/index.js';
import { parseCode, ParseResult } from './ast-parser.js';
import { detectFramework, extractComponentTree } from './component-tree.js';
import { extractLayoutTree } from './layout-tree.js';
import { extractSpacingMap } from './spacing-map.js';
import { extractTypographyMap } from './typography-map.js';
import { extractImagery } from './imagery-extractor.js';
import { extractAccessibility } from './accessibility.js';
import { calculateDensityHeatmap } from './density-heatmap.js';
import { extractFlowOutline } from './flow-outline.js';
import { logger } from '../utils/logger.js';

export async function extractDesignElements(
  code: string,
  filePath: string
): Promise<DesignExtraction> {
  logger.debug('Starting design extraction', { file: filePath });

  const parseResult = parseCode(code, filePath);
  const framework = detectFramework(parseResult);
  
  logger.debug('Framework detected', { framework });

  const components = extractComponentTree(parseResult, framework);
  logger.debug('Components extracted', { count: components.length });

  const layout = extractLayoutTree(parseResult, components);
  logger.debug('Layout tree extracted');

  const spacingMap = extractSpacingMap(parseResult);
  logger.debug('Spacing map extracted', { entries: Object.keys(spacingMap).length });

  const typographyMap = extractTypographyMap(parseResult);
  logger.debug('Typography map extracted', { entries: Object.keys(typographyMap).length });

  const imagery = extractImagery(parseResult);
  logger.debug('Imagery extracted', { count: imagery.length });

  const accessibility = extractAccessibility(parseResult, components);
  logger.debug('Accessibility indicators extracted');

  // Extract breakpoints (simplified - would parse media queries in production)
  const breakpoints: Record<string, { minWidth: string }> = {
    sm: { minWidth: '640px' },
    md: { minWidth: '768px' },
    lg: { minWidth: '1024px' },
    xl: { minWidth: '1280px' },
  };

  const densityHeatmap = calculateDensityHeatmap(parseResult);
  logger.debug('Density heatmap calculated');

  const flowOutline = extractFlowOutline(parseResult, components);
  logger.debug('Flow outline extracted', { steps: flowOutline.length });

  const extraction: DesignExtraction = {
    metadata: {
      file: filePath,
      timestamp: new Date().toISOString(),
      framework,
      library: components.find((c) => c.library)?.library,
    },
    components,
    layout,
    spacingMap,
    typographyMap,
    imagery,
    accessibility,
    breakpoints,
    densityHeatmap,
    flowOutline,
  };

  logger.info('Design extraction completed', { file: filePath, components: components.length });

  return extraction;
}

