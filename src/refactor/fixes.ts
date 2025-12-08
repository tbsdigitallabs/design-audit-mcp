// Deterministic fix applicators

import { DesignExtraction, CritiqueResult, PatchOperation } from '../types/index.js';
import { logger } from '../utils/logger.js';

export function generateDeterministicFixes(
    extraction: DesignExtraction,
    critique: CritiqueResult
): PatchOperation[] {
    const patches: PatchOperation[] = [];

    logger.debug('Generating deterministic fixes', { file: extraction.metadata.file });

    // Fix missing aria labels
    for (const missingLabel of extraction.accessibility.missingAriaLabels) {
        const [line, col] = missingLabel.split(':').map(Number);
        patches.push({
            type: 'insert',
            startLine: line,
            content: ' aria-label="Interactive element"',
        });
    }

    // Fix spacing inconsistencies (simplified - would use actual spacing scale)
    if (critique.spacingRhythm.score < 3.0) {
        // Add consistent gap classes to layout containers
        const layoutPatches = fixSpacingTokens(extraction);
        patches.push(...layoutPatches);
    }

    // Fix contrast violations
    for (const violation of extraction.accessibility.contrastViolations) {
        const [line] = violation.element.split(':').map(Number);
        patches.push({
            type: 'replace',
            startLine: line,
            endLine: line,
            content: '// TODO: Fix contrast ratio - replace with higher contrast color class',
        });
    }

    logger.info('Deterministic fixes generated', { count: patches.length });

    return patches;
}

function fixSpacingTokens(extraction: DesignExtraction): PatchOperation[] {
    const patches: PatchOperation[] = [];

    // This is a simplified version - in production would analyze spacing map
    // and replace with brand token values
    for (const [key, spacing] of Object.entries(extraction.spacingMap)) {
        const [line] = key.split(':').map(Number);
        // Replace with standard spacing token if not already using one
        if (!spacing.class.match(/^(m|p|gap)-\d+$/)) {
            const newClass = spacing.class.replace(/-\d+$/, '-4');
            patches.push({
                type: 'replace',
                startLine: line,
                endLine: line,
                content: `className="${newClass}"`,
            });
        }
    }

    return patches;
}

export function applyShadcnReplacements(extraction: DesignExtraction): PatchOperation[] {
  const patches: PatchOperation[] = [];

  for (const component of extraction.components) {
    // Replace custom buttons with shadcn Button
    if (component.name.toLowerCase().includes('button') && !component.library) {
      patches.push({
        type: 'replace',
        startLine: component.location.start.line,
        endLine: component.location.end.line,
        content: generateShadcnButton(component),
      });
    }
  }

  return patches;
}

function generateShadcnButton(component: { name: string; props: Record<string, unknown> }): string {
  const variant = component.props.variant || 'default';
  const size = component.props.size || 'default';
  return `<Button variant="${variant}" size="${size}">${component.props.children || 'Button'}</Button>`;
}
