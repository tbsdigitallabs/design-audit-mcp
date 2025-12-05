# Extending Rulesets

## Adding New Rulesets

1. Create a JSON file in `src/rules/` directory
2. Follow the existing structure:
   - `base-principles.json`: Core design principles
   - `shadcn-rules.json`: Component library rules
   - `accessibility.json`: WCAG compliance rules
   - `responsive.json`: Breakpoint definitions
   - `brand-tokens.json`: Brand-specific tokens

## Custom Ruleset Structure

```json
{
  "category": {
    "weight": 0.20,
    "description": "Category description",
    "heuristics": ["Rule 1", "Rule 2"],
    "signals": ["Issue 1", "Issue 2"]
  }
}
```

## Loading Custom Rulesets

Pass `customRulesetPath` to `design_get_ruleset` or `design_audit`:

```json
{
  "customRulesetPath": "/path/to/custom/rules"
}
```

## Framework-Specific Rules

Add framework detection in `src/extractor/component-tree.ts` and create framework-specific ruleset files.

