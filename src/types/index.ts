// Type definitions for Design Audit MCP Server

export interface Location {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface ComponentNode {
  id: string;
  name: string;
  library?: string;
  props: Record<string, unknown>;
  location: Location;
}

export interface LayoutNode {
  type: 'flex' | 'grid' | 'stack' | 'container';
  direction?: 'row' | 'column';
  gap?: string;
  columns?: number;
  children: Array<{ ref: string } | LayoutNode>;
}

export interface ImageReference {
  id: string;
  src: string;
  role: 'decorative' | 'informative' | 'functional';
  alt?: string;
  location: Location;
}

export interface AccessibilityIndicator {
  missingAriaLabels: string[];
  keyboardNavigable: boolean;
  contrastViolations: Array<{ element: string; contrastRatio: number }>;
}

export interface BreakpointDefinition {
  minWidth: string;
}

export interface FlowNode {
  step: number;
  id: string;
  description: string;
}

export interface DesignExtraction {
  metadata: {
    file: string;
    timestamp: string;
    framework: string;
    library?: string;
  };
  components: ComponentNode[];
  layout: LayoutNode;
  spacingMap: Record<string, { class: string; value: string }>;
  typographyMap: Record<string, { class: string; lineHeight: string }>;
  imagery: ImageReference[];
  accessibility: AccessibilityIndicator;
  breakpoints: Record<string, BreakpointDefinition>;
  densityHeatmap: Record<string, number>;
  flowOutline: FlowNode[];
}

export interface CategoryScore {
  score: number;
  comments: string;
  weight: number;
}

export interface CritiqueResult {
  hierarchy: CategoryScore;
  spacingRhythm: CategoryScore;
  visualNoise: CategoryScore;
  grouping: CategoryScore;
  flow: CategoryScore;
  imagery: CategoryScore;
  balanceDensity: CategoryScore;
  alignmentGrid: CategoryScore;
  contrastColour: CategoryScore;
  accessibility: CategoryScore;
  overall: number;
  severity: 'Critical' | 'Major' | 'Moderate' | 'Minor' | 'Excellent';
  violations: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    location?: Location;
  }>;
}

export interface Ruleset {
  basePrinciples: Record<string, unknown>;
  libraryRules?: Record<string, unknown>;
  brandTokens?: Record<string, unknown>;
  frameworkSpecifics?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
  responsive?: Record<string, unknown>;
}

export interface PatchOperation {
  type: 'insert' | 'delete' | 'replace';
  startLine: number;
  endLine?: number;
  content: string;
}

export interface RefactorResult {
  patches: PatchOperation[];
  summary: string;
}

