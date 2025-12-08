// Component generation

import { Ruleset } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface GenerationIntent {
    type: 'button' | 'form' | 'card' | 'layout' | 'custom';
    description: string;
    framework: string;
    props?: Record<string, unknown>;
}

export function generateComponent(intent: GenerationIntent, ruleset: Ruleset): string {
    logger.debug('Generating component', { type: intent.type, framework: intent.framework });

    switch (intent.type) {
        case 'button':
            return generateButton(intent, ruleset);
        case 'form':
            return generateForm(intent, ruleset);
        case 'card':
            return generateCard(intent, ruleset);
        case 'layout':
            return generateLayout(intent, ruleset);
        default:
            return generateCustom(intent, ruleset);
    }
}

function generateButton(intent: GenerationIntent, ruleset: Ruleset): string {
    const libraryRules = ruleset.libraryRules as { preferredComponents?: { Button?: { variants?: string[]; sizes?: string[] } } } | undefined;
    const variants = libraryRules?.preferredComponents?.Button?.variants || ['default'];
    const sizes = libraryRules?.preferredComponents?.Button?.sizes || ['default'];

    const variant = intent.props?.variant || variants[0];
    const size = intent.props?.size || sizes[0];
    const children = intent.props?.children || 'Button';

    if (intent.framework === 'React') {
        return `<Button variant="${variant}" size="${size}">${children}</Button>`;
    }

    return `<!-- Button component for ${intent.framework} -->`;
}

function generateForm(intent: GenerationIntent, ruleset: Ruleset): string {
    if (intent.framework === 'React') {
        return `import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"

export function FormComponent() {
  return (
    <Form>
      <FormField name="field1">
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <input type="text" />
          </FormControl>
        </FormItem>
      </FormField>
    </Form>
  )
}`;
    }

    return `<!-- Form component for ${intent.framework} -->`;
}

function generateCard(intent: GenerationIntent, ruleset: Ruleset): string {
    if (intent.framework === 'React') {
        return `import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function CardComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}`;
    }

    return `<!-- Card component for ${intent.framework} -->`;
}

function generateLayout(intent: GenerationIntent, ruleset: Ruleset): string {
    const spacing = (ruleset.libraryRules as { spacingConventions?: { componentGap?: string } } | undefined)?.spacingConventions?.componentGap || 'gap-4';

    if (intent.framework === 'React') {
        return `export function Layout() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col ${spacing}">
        {/* Layout content */}
      </div>
    </div>
  )
}`;
    }

    return `<!-- Layout component for ${intent.framework} -->`;
}

function generateCustom(intent: GenerationIntent, ruleset: Ruleset): string {
    return `// Generated component based on: ${intent.description}
// Framework: ${intent.framework}
// TODO: Implement custom component logic`;
}

