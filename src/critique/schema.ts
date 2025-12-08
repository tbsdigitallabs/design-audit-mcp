// Critique schema definition

import { CategoryScore } from '../types/index.js';

export interface CritiqueCategory {
    name: string;
    weight: number;
    description: string;
    heuristics: string[];
    signals: string[];
}

export const CRITIQUE_CATEGORIES: Record<string, CritiqueCategory> = {
    hierarchy: {
        name: 'Hierarchy',
        weight: 0.20,
        description: 'Ensures that the most important information or actions stand out first',
        heuristics: [
            'Primary actions must be visually dominant',
            'Secondary actions must be clearly subordinate',
            'Content should be ordered from most to least important',
        ],
        signals: [
            'All elements look similar in size/weight',
            'Headings are not distinguished',
            'Primary action buttons have similar weight to secondary actions',
        ],
    },
    spacingRhythm: {
        name: 'Spacing Rhythm',
        weight: 0.15,
        description: 'Maintains consistent distances and rhythm between elements',
        heuristics: [
            'Follow the brand spacing scale',
            'Avoid micro-spacing adjustments outside the scale',
            'Apply consistent margin conventions around components',
        ],
        signals: [
            'Uneven gaps',
            'Elements crammed together',
            'Inconsistent margins or padding',
        ],
    },
    visualNoise: {
        name: 'Visual Noise',
        weight: 0.10,
        description: 'Eliminates unnecessary clutter and decorative elements',
        heuristics: [
            'Remove decorative borders, drop shadows, gradients and icons unless they serve a functional purpose',
            'Use one or two fonts and a limited colour palette',
        ],
        signals: [
            'Excessive icons, borders, shadows or textures',
            'Too many fonts or colours',
            'Decorative images unrelated to user tasks',
        ],
    },
    grouping: {
        name: 'Grouping & Proximity',
        weight: 0.10,
        description: 'Groups related elements together and separates unrelated ones',
        heuristics: [
            'Group labels closely with their inputs',
            'Cluster related fields or buttons',
            'Separate unrelated sections using space or dividers',
        ],
        signals: [
            'Related items spaced far apart',
            'Unrelated items crowded together',
            'Misaligned labels and inputs',
        ],
    },
    flow: {
        name: 'Flow & Scanning',
        weight: 0.15,
        description: 'Guides the user\'s eye through a logical path',
        heuristics: [
            'Arrange content to support natural scanning (F or Z patterns for desktop, vertical scroll for mobile)',
            'Clearly mark the next action',
            'Avoid abrupt flow breaks',
        ],
        signals: [
            'No clear start point',
            'Calls to action hidden or misaligned',
            'User forced to hunt for next step',
        ],
    },
    imagery: {
        name: 'Imagery Role',
        weight: 0.05,
        description: 'Uses images to support narrative, not merely decoration',
        heuristics: [
            'Every image must reinforce narrative or clarify an action',
            'Decorative images should be avoided',
        ],
        signals: [
            'Irrelevant stock photos',
            'Images competing with content',
            'Decorative flourishes that distract from tasks',
        ],
    },
    balanceDensity: {
        name: 'Balance & Density',
        weight: 0.10,
        description: 'Ensures distribution of visual weight and prevents crowding',
        heuristics: [
            'Distribute visual weight evenly',
            'Ensure whitespace surrounds dense blocks',
            'Avoid long continuous text without breaks',
        ],
        signals: [
            'One side of the page overloaded',
            'Multiple heavy blocks stacked together',
            'Large empty areas next to dense clusters',
        ],
    },
    alignmentGrid: {
        name: 'Alignment & Grid',
        weight: 0.05,
        description: 'Aligns elements on a consistent grid',
        heuristics: [
            'Align text, icons, and components to a common grid',
            'Maintain consistent baseline alignment',
        ],
        signals: [
            'Misaligned text, buttons or cards',
            'Inconsistent column widths',
            'Sloppy element edges',
        ],
    },
    contrastColour: {
        name: 'Contrast & Colour Usage',
        weight: 0.05,
        description: 'Uses brand colours effectively for emphasis and accessibility',
        heuristics: [
            'Follow brand colour hierarchy',
            'Ensure WCAG 2.1 contrast ratios',
            'Use colour to group related items or highlight actions',
        ],
        signals: [
            'Low contrast between text and background',
            'Misuse of accent colours',
            'Ignoring colour accessibility guidelines',
        ],
    },
    accessibility: {
        name: 'Accessibility & Affordances',
        weight: 0.05,
        description: 'Provides inclusive design and clear interactive cues',
        heuristics: [
            'Ensure all elements have sufficient touch/hover feedback',
            'Include aria labels',
            'Provide keyboard navigation',
        ],
        signals: [
            'Missing aria attributes',
            'Poor keyboard navigation',
            'Links and buttons indistinguishable',
        ],
    },
};

export function getCategoryWeights(): Record<string, number> {
    const weights: Record<string, number> = {};
    for (const [key, category] of Object.entries(CRITIQUE_CATEGORIES)) {
        weights[key] = category.weight;
    }
    return weights;
}

