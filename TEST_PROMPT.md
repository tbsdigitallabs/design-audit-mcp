# Design Audit MCP Server - Testing Prompt

## Setup Instructions

1. **Install the MCP server:**
   ```bash
   git clone https://github.com/tbsdigitallabs/design-audit-mcp.git
   cd design-audit-mcp
   npm install
   npm run build
   ```

2. **Configure in your IDE (Cursor/Claude Desktop):**
   Add to your MCP settings:
   ```json
   {
     "mcpServers": {
       "design-audit": {
         "command": "node",
         "args": ["/path/to/design-audit-mcp/dist/server.js"]
       }
     }
   }
   ```

## Testing Scenarios

### Scenario 1: Extract Design Elements
Use the `design_extract` tool to analyze a React/TSX component file:

```
Please use the design_extract tool to analyze the file [YOUR_FILE_PATH]. 
Extract all design elements including components, layout structure, spacing, 
typography, imagery, and accessibility indicators. Show me the complete 
extraction JSON.
```

### Scenario 2: Run Full Design Audit
Use the `design_audit` tool to get a comprehensive design critique:

```
Please use the design_audit tool to audit the design of [YOUR_FILE_PATH]. 
I want to see:
- Overall design score and severity level
- Per-category scores (hierarchy, spacing, visual noise, etc.)
- List of violations with severity
- Recommendations for improvement
```

### Scenario 3: Get Current Ruleset
Check what design rules are being applied:

```
Use the design_get_ruleset tool to show me the current design ruleset 
configuration. I want to see the base principles, accessibility rules, 
responsive breakpoints, and brand tokens.
```

### Scenario 4: Refactor Based on Audit
Generate fixes for design issues:

```
First, run design_audit on [YOUR_FILE_PATH]. Then use design_refactor 
to generate deterministic fixes for the issues found. Show me the patches 
that would be applied, but don't apply them yet (set write=false).
```

### Scenario 5: Generate New Component
Create a component following design rules:

```
Use design_generate to create a new Button component with:
- Type: button
- Framework: React
- Props: variant="primary", size="lg"
- Description: "Primary action button for forms"

Make sure it follows the design ruleset.
```

### Scenario 6: Apply Patches
Apply generated patches to a file:

```
I have these patches for [YOUR_FILE_PATH]:
[PASTE_PATCH_JSON_HERE]

Use design_apply_patch to apply them. Set write=true to actually modify 
the file, or write=false to just show me what would change.
```

## Expected Output Format

The server returns structured JSON with:
- **Extraction**: Component tree, layout, spacing map, typography, imagery, accessibility
- **Critique**: Scores (0-5) for 10 categories, overall score, severity, violations
- **Patches**: Array of insert/delete/replace operations with line numbers
- **Generated Code**: Component/layout code following the ruleset

## Testing Checklist

- [ ] Server starts without errors
- [ ] `design_extract` returns valid JSON structure
- [ ] `design_audit` calculates scores correctly
- [ ] `design_get_ruleset` loads all ruleset files
- [ ] `design_refactor` generates appropriate patches
- [ ] `design_generate` creates valid component code
- [ ] `design_apply_patch` correctly modifies files
- [ ] All tools handle errors gracefully
- [ ] Extraction is deterministic (same input → same output)

## Example Test File

Create a test component like this:

```tsx
// test-component.tsx
export function TestComponent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Test Component</h1>
      <button className="px-4 py-2 bg-blue-500">Click me</button>
      <img src="/test.jpg" alt="Test image" />
    </div>
  );
}
```

Then run:
```
Use design_audit to analyze test-component.tsx and show me the results.
```

## Troubleshooting

- **Server not found**: Check the path in MCP settings matches your installation
- **Parse errors**: Ensure the file is valid JSX/TSX
- **Empty results**: Check that components use PascalCase (not lowercase HTML elements)
- **Type errors**: Make sure TypeScript compilation succeeded (`npm run build`)

