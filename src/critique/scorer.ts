// Weighted scoring system

import { CritiqueResult, CategoryScore, DesignExtraction } from '../types/index.js';
import { CRITIQUE_CATEGORIES } from './schema.js';
import { evaluateCategory } from './evaluator.js';
import { logger } from '../utils/logger.js';

export function calculateSeverity(score: number): 'Critical' | 'Major' | 'Moderate' | 'Minor' | 'Excellent' {
    if (score >= 0 && score <= 1.0) return 'Critical';
    if (score > 1.0 && score <= 2.5) return 'Major';
    if (score > 2.5 && score <= 3.5) return 'Moderate';
    if (score > 3.5 && score <= 4.5) return 'Minor';
    return 'Excellent';
}

export function scoreDesign(extraction: DesignExtraction, ruleset: unknown): CritiqueResult {
    logger.debug('Scoring design', { file: extraction.metadata.file });

    const categoryScores: Record<string, CategoryScore> = {};

    // Evaluate each category
    for (const [key, category] of Object.entries(CRITIQUE_CATEGORIES)) {
        const score = evaluateCategory(key, extraction, ruleset);
        const comments = generateComments(key, score, extraction);

        categoryScores[key] = {
            score,
            comments,
            weight: category.weight,
        };
    }

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const [key, categoryScore] of Object.entries(categoryScores)) {
        totalWeightedScore += categoryScore.score * categoryScore.weight;
        totalWeight += categoryScore.weight;
    }

    const overall = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const severity = calculateSeverity(overall);

    // Generate violations
    const violations = generateViolations(categoryScores, extraction);

    const result: CritiqueResult = {
        hierarchy: categoryScores.hierarchy,
        spacingRhythm: categoryScores.spacingRhythm,
        visualNoise: categoryScores.visualNoise,
        grouping: categoryScores.grouping,
        flow: categoryScores.flow,
        imagery: categoryScores.imagery,
        balanceDensity: categoryScores.balanceDensity,
        alignmentGrid: categoryScores.alignmentGrid,
        contrastColour: categoryScores.contrastColour,
        accessibility: categoryScores.accessibility,
        overall,
        severity,
        violations,
    };

    logger.info('Design scored', { file: extraction.metadata.file, overall, severity });

    return result;
}

function generateComments(category: string, score: number, extraction: DesignExtraction): string {
    const categoryInfo = CRITIQUE_CATEGORIES[category];
    if (!categoryInfo) return 'No evaluation available';

    if (score >= 4.5) {
        return `Excellent ${categoryInfo.name.toLowerCase()}. ${categoryInfo.description}`;
    }
    if (score >= 3.5) {
        return `Good ${categoryInfo.name.toLowerCase()} with minor improvements possible.`;
    }
    if (score >= 2.5) {
        return `Moderate ${categoryInfo.name.toLowerCase()}. Some issues detected: ${categoryInfo.signals.slice(0, 2).join(', ')}.`;
    }
    if (score >= 1.0) {
        return `Poor ${categoryInfo.name.toLowerCase()}. Significant issues: ${categoryInfo.signals.slice(0, 3).join(', ')}.`;
    }
    return `Critical ${categoryInfo.name.toLowerCase()} issues. Requires immediate attention.`;
}

function generateViolations(
    categoryScores: Record<string, CategoryScore>,
    extraction: DesignExtraction
): Array<{ category: string; severity: 'critical' | 'high' | 'medium' | 'low'; message: string; location?: { start: { line: number; column: number }; end: { line: number; column: number } } }> {
    const violations: Array<{ category: string; severity: 'critical' | 'high' | 'medium' | 'low'; message: string; location?: { start: { line: number; column: number }; end: { line: number; column: number } } }> = [];

    for (const [category, score] of Object.entries(categoryScores)) {
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (score.score <= 1.0) severity = 'critical';
        else if (score.score <= 2.5) severity = 'high';
        else if (score.score <= 3.5) severity = 'medium';

        if (score.score < 4.0) {
            violations.push({
                category,
                severity,
                message: score.comments,
            });
        }
    }

    // Add specific accessibility violations
    for (const missingLabel of extraction.accessibility.missingAriaLabels) {
        violations.push({
            category: 'accessibility',
            severity: 'high',
            message: `Missing aria-label for interactive element: ${missingLabel}`,
        });
    }

    for (const contrastViolation of extraction.accessibility.contrastViolations) {
        violations.push({
            category: 'contrastColour',
            severity: 'high',
            message: `Low contrast ratio (${contrastViolation.contrastRatio}) for element: ${contrastViolation.element}`,
        });
    }

    return violations;
}

