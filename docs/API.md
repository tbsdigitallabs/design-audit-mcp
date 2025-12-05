# API Documentation

## Tools

### design_extract

Extract design elements from source code.

**Input:**
```json
{
  "code": "export function Component() { return <div>...</div> }",
  "filePath": "src/components/Component.tsx"
}
```

**Output:**
```json
{
  "metadata": {
    "file": "src/components/Component.tsx",
    "timestamp": "2025-01-01T00:00:00Z",
    "framework": "React",
    "library": "shadcn"
  },
  "components": [...],
  "layout": {...},
  "spacingMap": {...},
  "typographyMap": {...},
  "imagery": [...],
  "accessibility": {...},
  "breakpoints": {...},
  "densityHeatmap": {...},
  "flowOutline": [...]
}
```

### design_get_ruleset

Get the current design ruleset configuration.

**Input:**
```json
{
  "customRulesetPath": "optional/path/to/rules"
}
```

**Output:**
```json
{
  "basePrinciples": {...},
  "libraryRules": {...},
  "brandTokens": {...},
  "accessibility": {...},
  "responsive": {...}
}
```

### design_audit

Run a complete design audit.

**Input:**
```json
{
  "code": "export function Component() { return <div>...</div> }",
  "filePath": "src/components/Component.tsx",
  "customRulesetPath": "optional/path/to/rules"
}
```

**Output:**
```json
{
  "extraction": {...},
  "critique": {
    "hierarchy": {"score": 3.5, "comments": "...", "weight": 0.20},
    "spacingRhythm": {"score": 2.8, "comments": "...", "weight": 0.15},
    ...
    "overall": 3.32,
    "severity": "Moderate",
    "violations": [...]
  }
}
```

### design_refactor

Apply deterministic fixes.

**Input:**
```json
{
  "filePath": "src/components/Component.tsx",
  "auditReport": {...},
  "applyShadcn": true
}
```

**Output:**
```json
{
  "patches": [
    {
      "type": "insert",
      "startLine": 10,
      "content": " aria-label=\"...\""
    }
  ],
  "summary": "Generated 5 patches for src/components/Component.tsx"
}
```

### design_generate

Generate new component code.

**Input:**
```json
{
  "intent": {
    "type": "button",
    "description": "Primary action button",
    "framework": "React",
    "props": {"variant": "default", "size": "lg"}
  }
}
```

**Output:**
```text
<Button variant="default" size="lg">Button</Button>
```

### design_apply_patch

Apply patches to a file.

**Input:**
```json
{
  "filePath": "src/components/Component.tsx",
  "patches": [
    {
      "type": "replace",
      "startLine": 10,
      "endLine": 12,
      "content": "new content"
    }
  ],
  "write": true
}
```

**Output:**
```json
{
  "success": true,
  "filePath": "src/components/Component.tsx",
  "content": "updated file content"
}
```

