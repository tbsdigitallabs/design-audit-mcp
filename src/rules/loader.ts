// Ruleset loader

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Ruleset } from '../types/index.js';
import { RulesetError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadRuleset(customRulesetPath?: string): Promise<Ruleset> {
    try {
        const rulesDir = customRulesetPath || join(__dirname, '..', 'rules');

        const basePrinciples = JSON.parse(
            readFileSync(join(rulesDir, 'base-principles.json'), 'utf-8')
        );
        const shadcnRules = JSON.parse(
            readFileSync(join(rulesDir, 'shadcn-rules.json'), 'utf-8')
        );
        const accessibility = JSON.parse(
            readFileSync(join(rulesDir, 'accessibility.json'), 'utf-8')
        );
        const responsive = JSON.parse(
            readFileSync(join(rulesDir, 'responsive.json'), 'utf-8')
        );
        const brandTokens = JSON.parse(
            readFileSync(join(rulesDir, 'brand-tokens.json'), 'utf-8')
        );

        const ruleset: Ruleset = {
            basePrinciples,
            libraryRules: shadcnRules,
            brandTokens,
            frameworkSpecifics: responsive,
            accessibility,
            responsive,
        };

        logger.info('Ruleset loaded', { rulesDir });
        return ruleset;
    } catch (error) {
        throw new RulesetError(
            `Failed to load ruleset: ${error instanceof Error ? error.message : 'Unknown error'}`,
            customRulesetPath
        );
    }
}

