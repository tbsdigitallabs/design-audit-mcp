// Layout generation

import { Ruleset } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface LayoutIntent {
  type: 'page' | 'section' | 'grid' | 'flex';
  columns?: number;
  responsive?: boolean;
  framework: string;
}

export function generateLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  logger.debug('Generating layout', { type: intent.type, framework: intent.framework });

  switch (intent.type) {
    case 'page':
      return generatePageLayout(intent, ruleset);
    case 'section':
      return generateSectionLayout(intent, ruleset);
    case 'grid':
      return generateGridLayout(intent, ruleset);
    case 'flex':
      return generateFlexLayout(intent, ruleset);
    default:
      return generateDefaultLayout(intent, ruleset);
  }
}

function generatePageLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  const spacing = (ruleset.libraryRules as { spacingConventions?: { pageGap?: string } } | undefined)?.spacingConventions?.pageGap || 'gap-8';

  if (intent.framework === 'React') {
    return `export function PageLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        {/* Header content */}
      </header>
      <main className="container mx-auto p-4">
        <div className="flex flex-col ${spacing}">
          {/* Main content */}
        </div>
      </main>
      <footer className="border-t mt-auto">
        {/* Footer content */}
      </footer>
    </div>
  )
}`;
  }

  return `<!-- Page layout for ${intent.framework} -->`;
}

function generateSectionLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  const spacing = (ruleset.libraryRules as { spacingConventions?: { sectionGap?: string } } | undefined)?.spacingConventions?.sectionGap || 'gap-6';

  if (intent.framework === 'React') {
    return `export function SectionLayout() {
  return (
    <section className="py-8">
      <div className="flex flex-col ${spacing}">
        {/* Section content */}
      </div>
    </section>
  )
}`;
  }

  return `<!-- Section layout for ${intent.framework} -->`;
}

function generateGridLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  const columns = intent.columns || 3;
  const responsive = intent.responsive !== false;

  if (intent.framework === 'React') {
    const gridClass = responsive
      ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`
      : `grid grid-cols-${columns} gap-4`;

    return `export function GridLayout() {
  return (
    <div className="${gridClass}">
      {/* Grid items */}
    </div>
  )
}`;
  }

  return `<!-- Grid layout for ${intent.framework} -->`;
}

function generateFlexLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  const spacing = (ruleset.libraryRules as { spacingConventions?: { componentGap?: string } } | undefined)?.spacingConventions?.componentGap || 'gap-4';

  if (intent.framework === 'React') {
    return `export function FlexLayout() {
  return (
    <div className="flex flex-row ${spacing}">
      {/* Flex items */}
    </div>
  )
}`;
  }

  return `<!-- Flex layout for ${intent.framework} -->`;
}

function generateDefaultLayout(intent: LayoutIntent, ruleset: Ruleset): string {
  return `// Generated layout: ${intent.type}
// Framework: ${intent.framework}
// TODO: Implement layout structure`;
}

