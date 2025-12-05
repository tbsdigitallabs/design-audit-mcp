// Code transformation utilities

import { DesignExtraction } from '../types/index.js';

export function transformToShadcn(extraction: DesignExtraction): string {
  // Transform component structure to use shadcn components
  // This is a simplified version - in production would generate full component code
  
  let output = `import { Button } from "@/components/ui/button"\n`;
  output += `import { Card } from "@/components/ui/card"\n\n`;

  output += `export function Component() {\n`;
  output += `  return (\n`;
  output += `    <div className="container">\n`;

  for (const component of extraction.components) {
    if (component.name.toLowerCase().includes('button')) {
      output += `      <Button variant="default">${component.name}</Button>\n`;
    } else if (component.name.toLowerCase().includes('card')) {
      output += `      <Card>\n`;
      output += `        {/* Card content */}\n`;
      output += `      </Card>\n`;
    }
  }

  output += `    </div>\n`;
  output += `  )\n`;
  output += `}\n`;

  return output;
}

export function standardizeSpacing(extraction: DesignExtraction): Record<string, string> {
  // Map current spacing values to standard tokens
  const spacingMap: Record<string, string> = {};

  for (const [key, spacing] of Object.entries(extraction.spacingMap)) {
    const value = parseFloat(spacing.value);
    // Map to nearest standard spacing token (0.25rem increments)
    const standardValue = Math.round(value / 0.25) * 0.25;
    const token = `spacing-${standardValue / 0.25}`;
    spacingMap[key] = token;
  }

  return spacingMap;
}

