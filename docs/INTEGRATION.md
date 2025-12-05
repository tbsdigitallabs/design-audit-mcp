# Library Integration Guide

## Adding New Component Libraries

### 1. Update Component Detection

Edit `src/extractor/component-tree.ts`:

```typescript
const detectLibrary = (name: string, props: Record<string, unknown>): string | undefined => {
  // Add your library detection logic
  if (name.includes('YourComponent') && props.someProp) {
    return 'your-library';
  }
  // ... existing detection
};
```

### 2. Create Library Rules

Create `src/rules/your-library-rules.json`:

```json
{
  "componentLibrary": "your-library",
  "preferredComponents": {
    "YourComponent": {
      "variants": ["default", "primary"],
      "sizes": ["sm", "md", "lg"]
    }
  }
}
```

### 3. Update Ruleset Loader

Edit `src/rules/loader.ts` to include your library rules:

```typescript
const yourLibraryRules = JSON.parse(
  readFileSync(join(rulesDir, 'your-library-rules.json'), 'utf-8')
);
```

### 4. Add Refactoring Rules

Update `src/refactor/fixes.ts` to handle your library's component replacements.

## Example: Adding Material-UI

1. Detect Material-UI components by import patterns
2. Create `material-ui-rules.json` with component conventions
3. Add Material-UI-specific refactoring in `fixes.ts`
4. Update ruleset loader to include Material-UI rules

