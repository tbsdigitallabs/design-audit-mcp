# **Design Auditor: Comprehensive Deliverables**

This document packages everything needed to empower an IDE or agent to perform intelligent design critique and improvement using a language model. It includes a **design critique schema**, a **scoring system**, a **prompt template** for the IDE’s LLM, and a **structured extraction output format** for the MCP server. Each section is self‑contained so you can adopt them individually or as a complete workflow.

---

## **1\. Design Critique Schema**

The **design critique schema** defines the vocabulary and criteria by which an LLM can judge whether a user interface is clear, balanced and aligned with brand rules. This schema provides the “recipe” that turns brand tokens and structural data into a useful design evaluation.

### **Categories and Criteria**

Each category describes what “good” and “bad” look like, along with questions the model should answer and the typical signals to look for. You can extend or modify categories to fit your organisation’s design principles.

| Category | Purpose | Signals of Poor Design | Questions for the Model |
| :---- | :---- | :---- | :---- |
| **Hierarchy** | Ensures that the most important information or actions stand out first. | All elements look similar in size/weight; headings are not distinguished; primary action buttons have similar weight to secondary actions. | *Is the most important item clearly dominant? Are headings and subheadings visually distinct?* |
| **Spacing Rhythm** | Maintains consistent distances and rhythm between elements for readability and breathing room. | Uneven gaps; elements crammed together; inconsistent margins or padding; abrupt changes between sections. | *Do spacings follow the defined scale? Are margins and paddings consistent across breakpoints?* |
| **Visual Noise** | Eliminates unnecessary clutter and decorative elements that distract from core content. | Excessive icons, borders, shadows or textures; too many fonts or colours; decorative images unrelated to user tasks. | *Does every element serve a functional or narrative purpose? Where can content be removed or simplified?* |
| **Grouping & Proximity** | Groups related elements together and separates unrelated ones. | Related items spaced far apart; unrelated items crowded together; misaligned labels and inputs. | *Are logically related items grouped? Are groups separated clearly?* |
| **Flow & Scanning** | Guides the user’s eye through a logical path and minimises cognitive load. | No clear start point; calls to action hidden or misaligned; user forced to hunt for next step; unnatural reading order. | *Does the layout follow a natural reading pattern (e.g. F‑pattern/Z‑pattern)? Is the primary action obvious?* |
| **Imagery Role** | Uses images to support narrative, not merely decoration. | Irrelevant stock photos; images competing with content; decorative flourishes that distract from tasks. | *Does each image add context or explanation? Would the layout improve if an image was removed or replaced?* |
| **Balance & Density** | Ensures distribution of visual weight and prevents crowding. | One side of the page overloaded; multiple heavy blocks stacked together; large empty areas next to dense clusters. | *Is the layout balanced left/right and top/bottom? Are there crowded areas that need breathing room?* |
| **Alignment & Grid** | Aligns elements on a consistent grid to aid scanning and perception of order. | Misaligned text, buttons or cards; inconsistent column widths; sloppy element edges. | *Are items aligned to a common grid? Do edges and baselines line up across components?* |
| **Contrast & Colour Usage** | Uses brand colours effectively for emphasis and accessibility. | Low contrast between text and background; misuse of accent colours; ignoring colour accessibility guidelines. | *Is there sufficient colour contrast for readability? Are brand colours used consistently and meaningfully?* |
| **Accessibility & Affordances** | Provides inclusive design and clear interactive cues. | Missing aria attributes; poor keyboard navigation; links and buttons indistinguishable; unclear touch targets. | *Are all interactive elements easily discoverable? Is the design inclusive for different abilities?* |

### **Heuristic Statements**

Below is a list of heuristic statements that can be used to generate qualitative feedback. These expand on the categories above. They can be presented to the model as check‑list items or guidelines for evaluation:

* **Hierarchy clarity**: primary actions must be visually dominant; secondary actions must be clearly subordinate; content should be ordered from most to least important.

* **Spacing consistency**: follow the brand spacing scale; avoid micro‑spacing adjustments outside the scale; apply consistent margin conventions around components.

* **Minimal noise**: remove decorative borders, drop shadows, gradients and icons unless they serve a functional purpose; use one or two fonts and a limited colour palette.

* **Logical grouping**: group labels closely with their inputs; cluster related fields or buttons; separate unrelated sections using space or dividers.

* **Natural flow**: arrange content to support natural scanning (F or Z patterns for desktop, vertical scroll for mobile); clearly mark the next action; avoid abrupt flow breaks.

* **Supportive imagery**: every image must reinforce narrative or clarify an action; decorative images should be avoided; illustrations can guide a user through steps.

* **Balance & density**: distribute visual weight evenly; ensure whitespace surrounds dense blocks; avoid long continuous text without breaks.

* **Alignment discipline**: align text, icons, and components to a common grid; maintain consistent baseline alignment; avoid stray misaligned items.

* **Colour & contrast**: follow brand colour hierarchy (primary, secondary, tertiary); ensure WCAG 2.1 contrast ratios; use colour to group related items or highlight actions.

* **Accessibility & affordance**: ensure all elements have sufficient touch/hover feedback; include aria labels; provide keyboard navigation; ensure interactive elements look clickable.

---

## **2\. Scoring System**

To make critique actionable, define a **scoring system** that assigns values to each category and combines them into a holistic rating. The model can return both numeric scores and textual explanations.

### **Scoring Mechanics**

* **Category Weights**: Decide how important each category is for your brand. For example, hierarchy might account for 20 % of the overall score, while imagery might account for 10 %.

* **Rating Scale**: Use a consistent scale—0 (very poor) to 5 (excellent)—for each category. Higher values indicate closer adherence to the ruleset and heuristics.

* **Aggregate Score**: Calculate the weighted average across all categories. Example:

* \[ \= \]

* **Severity Levels**: Translate scores into descriptive severity levels:

| Score Range | Severity | Interpretation |
| :---- | :---- | :---- |
| 0 – 1.0 | Critical | Requires immediate attention; significant design issues. |
| 1.1 – 2.5 | Major | Noticeable flaws; strongly impacts user experience. |
| 2.6 – 3.5 | Moderate | Mild issues; could be improved but usable. |
| 3.6 – 4.5 | Minor | Mostly aligned; only minor tweaks required. |
| 4.6 – 5.0 | Excellent | Very well aligned with the design rules. |

### **Example Category Weights**

Below is an example of how you might weight categories. Adjust weights based on the type of product (e.g. a dashboard might emphasise hierarchy and density).

| Category | Weight |
| :---- | :---- |
| Hierarchy | 0.20 |
| Spacing Rhythm | 0.15 |
| Visual Noise | 0.10 |
| Grouping & Proximity | 0.10 |
| Flow & Scanning | 0.15 |
| Imagery Role | 0.05 |
| Balance & Density | 0.10 |
| Alignment & Grid | 0.05 |
| Contrast & Colour | 0.05 |
| Accessibility & Affordances | 0.05 |

### **Output Format**

The LLM can return a JSON object or a structured list for easy consumption by the IDE.

{  
  "hierarchy": { "score": 3.5, "comments": "Primary buttons could be more dominant." },  
  "spacing": { "score": 2.8, "comments": "Inconsistent spacing between form fields." },  
  "visual\_noise": { "score": 4.5, "comments": "Minimal decorative elements detected." },  
  "grouping": { "score": 3.0, "comments": "Related fields are separated by large gaps." },  
  "flow": { "score": 4.0, "comments": "User flow follows a clear Z‑pattern." },  
  "imagery": { "score": 2.0, "comments": "Images are decorative and distract from tasks." },  
  "balance\_density": { "score": 3.8, "comments": "Overall layout is well balanced." },  
  "alignment\_grid": { "score": 2.5, "comments": "Elements misaligned with grid on mobile." },  
  "contrast\_colour": { "score": 4.2, "comments": "Colour usage meets contrast guidelines." },  
  "accessibility": { "score": 3.0, "comments": "Some buttons lack aria-labels." },  
  "overall": 3.32,  
  "severity": "Moderate"  
}

---

## **3\. Prompt Template for the IDE’s LLM**

The IDE or agent uses a language model to interpret extracted structure, apply the ruleset, evaluate with the design critique schema and scoring system, and produce improved layouts or code. A well‑structured prompt ensures consistent results across models. Replace the tokens in {{UPPERCASE}} with actual data or references.

You are a design critique and refactoring agent.  You receive structured UI metadata, a brand design ruleset, example layouts, and a design critique schema.  Your tasks are to evaluate the current layout, explain design issues, assign scores per category, and propose a redesigned layout that adheres to the ruleset.

Inputs:  
1\. \*\*Design Ruleset\*\* (\`{{DESIGN\_RULESET}}\`): defines spacing scale, typography scale, allowed components, responsive breakpoints, colour palette, interaction patterns, and accessibility guidelines.  
2\. \*\*Design Critique Schema\*\* (\`{{CRITIQUE\_SCHEMA}}\`): describes how to judge hierarchy, spacing rhythm, visual noise, grouping, flow, imagery, balance, alignment, contrast, and accessibility.  
3\. \*\*Example Layouts\*\* (\`{{EXAMPLE\_LAYOUTS}}\`): canonical examples of excellent pages, forms, dashboards, and mobile views with annotated rationale and spacing logic.  
4\. \*\*Extracted Structure\*\* (\`{{EXTRACTED\_STRUCTURE}}\`): the JSON structure produced by the MCP server, including component tree, layout maps, spacing maps, typography maps, imagery references, accessibility indicators, and breakpoints.  
5\. \*\*Screenshot Reference\*\* (optional \`{{SCREENSHOT\_REFERENCE}}\`): a description or reference to a screenshot for visual context.  Use this only if available.

Steps:  
1\. \*\*Interpretation\*\*: Summarise the intent of the current UI based on the extracted structure.  
2\. \*\*Evaluation\*\*:  
   \- Apply the design critique schema category by category.  
   \- Assign a score between 0–5 for each category.  
   \- Provide a brief comment for each category explaining the reasoning.  
   \- Compute an overall score based on the provided weights.  
3\. \*\*Critique\*\*: Write a human‑readable list of the most significant design issues, referring to specific components or areas (by location identifiers in \`{{EXTRACTED\_STRUCTURE}}\`).  
4\. \*\*Redesign Proposal\*\*:  
   \- Describe a better layout in prose.  
   \- Highlight improvements in hierarchy, spacing, grouping, flow, imagery use, balance, alignment, contrast, and accessibility.  
5\. \*\*Code Transformation\*\* (if requested): Provide a unified diff or full rewritten code reflecting the improved layout and adherence to the design ruleset.  Only modify what is necessary and preserve functional logic.

Output:  
\- JSON with the per‑category scores and comments.  
\- Written critique in clear bullet points.  
\- Proposed redesign description.  
\- Optional code diff or rewritten file.

You can adjust wording, include or omit sections depending on whether you want the LLM to generate code changes or only provide critiques.

---

## **4\. MCP Extraction Output Format**

The **MCP server** should extract structural and design information from the codebase and return a structured JSON that is easy for the LLM to consume. The extractor acts as a deterministic pre‑processor: it does not evaluate design—only describes it in detail.

### **Top‑Level Structure**

{  
  "metadata": {  
    "file": "src/components/Form.tsx",  
    "timestamp": "2025-12-05T02:00:00Z",  
    "framework": "React",  
    "library": "shadcn"  
  },  
  "components": \[ **/\*** **component** **usage** **map** **\*/** \],  
  "layout": { **/\*** **layout** **tree** **\*/** },  
  "spacingMap": { **/\*** **spacing** **tokens** **and** **locations** **\*/** },  
  "typographyMap": { **/\*** **typography** **scale** **usage** **\*/** },  
  "imagery": \[ **/\*** **images** **and** **their** **roles** **\*/** \],  
  "accessibility": { **/\*** **accessibility** **indicators** **\*/** },  
  "breakpoints": { **/\*** **responsive** **definitions** **\*/** },  
  "densityHeatmap": { **/\*** **relative** **density** **per** **region** **\*/** },  
  "flowOutline": \[ **/\*** **user** **path** **through** **the** **UI** **\*/** \]  
}

### **Sections Explained**

* **metadata**: Includes file path, extraction timestamp, framework or template details, and the library used (e.g. shadcn). Useful for context and debugging.

* **components**: An array of objects representing each component instance. Each object contains:

* {  
    "id": "btn1",  
    "name": "Button",  
    "library": "shadcn",  
    "props": {  
      "variant": "primary",  
      "size": "lg"  
    },  
    "location": {  
      "start": { "line": 12, "column": 5 },  
      "end": { "line": 14, "column": 5 }  
    }  
  }

* *id* is a unique identifier for cross‑referencing. *location* uses line/column to help the IDE apply patches.

* **layout**: A nested tree describing the structural arrangement. Each node can be of type flex, grid, stack, container, etc. Nodes may have properties such as direction, columns, gap, children, and references to component IDs. Example:

* {  
    "type": "flex",  
    "direction": "column",  
    "gap": "gap-6",  
    "children": \[  
      { "ref": "header1" },  
      {  
        "type": "flex",  
        "direction": "row",  
        "gap": "gap-4",  
        "children": \[ { "ref": "form" }, { "ref": "sidebar" } \]  
      },  
      { "ref": "footer" }  
    \]  
  }

* **spacingMap**: Records every spacing class or inline spacing used, keyed by location. Useful for enforcing spacing rhythm. Example:

* {  
    "12:5": { "class": "mt-4", "value": "1rem" },  
    "14:9": { "class": "pb-2", "value": "0.5rem" }  
  }

* **typographyMap**: Lists all typography scale tokens used for headings, body text, captions, etc. Example:

* {  
    "h1": { "class": "text-2xl", "lineHeight": "1.25" },  
    "body": { "class": "text-base", "lineHeight": "1.5" }  
  }

* **imagery**: Describes each image used, its role, and its alt text. Example:

* \[  
    {  
      "id": "img1",  
      "src": "/assets/hero.png",  
      "role": "decorative",  
      "alt": "Team working together",  
      "location": { "line": 26, "column": 7 }  
    }  
  \]

* **accessibility**: Summarises the accessibility features present (or missing). Example:

* {  
    "missingAriaLabels": \[ "btn1", "img1" \],  
    "keyboardNavigable": **true**,  
    "contrastViolations": \[ { "element": "btn2", "contrastRatio": 3.0 } \]  
  }

* **breakpoints**: Defines responsive behaviour based on classes or media queries. Example:

* {  
    "sm": { "minWidth": "640px" },  
    "md": { "minWidth": "768px" },  
    "lg": { "minWidth": "1024px" }  
  }

* **densityHeatmap**: A coarse map indicating how dense each region is. Values range from 0 (empty) to 1 (very dense). Example:

* {  
    "header": 0.3,  
    "sidebar": 0.6,  
    "content": 0.8,  
    "footer": 0.2  
  }

* **flowOutline**: An ordered list describing the expected user path through the UI. Example:

* \[  
    { "step": 1, "id": "header1", "description": "User reads page heading" },  
    { "step": 2, "id": "form", "description": "User fills in the form" },  
    { "step": 3, "id": "btnSubmit", "description": "User submits the form" }  
  \]

### **Why This Output Matters**

By returning structured data instead of raw code, the MCP server enables the LLM to reason about layout and design rules without parsing or hallucinating. The model receives:

* A map of components and their properties.

* A layout tree that reveals the overall structure.

* Spacing and typography usage to check against the ruleset.

* Information about images and their roles.

* Accessibility and responsive context.

* Density and flow clues for assessing scanning patterns and rhythm.

This output forms the **context** the LLM needs to apply the design critique schema and scoring system defined earlier.

---

## **Using All Deliverables Together**

1. **Extraction**: The MCP server runs on your codebase, producing the structured output described above.

2. **Prompt Preparation**: The IDE collects the ruleset, critique schema, example layouts, extracted structure, and an optional screenshot. These are inserted into the LLM prompt template.

3. **Evaluation & Redesign**: The LLM applies the critique schema and scoring system, returning scores, explanations, and redesign proposals. It may generate patches or code diffs if instructed.

4. **Application**: The IDE applies patches via the MCP server’s design\_apply\_patch tool. Designers or developers can review the critique and iterate.

By following this workflow, your existing tokens and design system are enforced through a clear vocabulary of design judgment, enabling the LLM to avoid “ugly” results even when it can view the project and take screenshots. The critique schema and scoring system translate aesthetic principles into deterministic rules; the extraction format provides structured context; and the prompt template orchestrates the LLM’s reasoning and output. This combination transforms your LLM from an autocomplete generator into a **design co‑pilot**.