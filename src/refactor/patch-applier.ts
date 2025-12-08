// LLM patch application

import { readFileSync, writeFileSync } from 'fs';
import { PatchOperation } from '../types/index.js';
import { PatchError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function applyPatches(filePath: string, patches: PatchOperation[]): string {
  logger.debug('Applying patches', { file: filePath, count: patches.length });

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const newLines = [...lines];

    // Sort patches by line number (descending) to avoid offset issues
    const sortedPatches = [...patches].sort((a, b) => b.startLine - a.startLine);

    for (const patch of sortedPatches) {
      const startIdx = patch.startLine - 1; // Convert to 0-based index

      switch (patch.type) {
        case 'insert':
          // Split multi-line content and insert each line
          const contentLines = patch.content.split('\n');
          contentLines.reverse(); // Insert in reverse order to maintain line numbers
          for (const line of contentLines) {
            newLines.splice(startIdx, 0, line);
          }
          break;

        case 'delete':
          const endIdx = (patch.endLine || patch.startLine) - 1;
          newLines.splice(startIdx, endIdx - startIdx + 1);
          break;

        case 'replace':
          const replaceEndIdx = (patch.endLine || patch.startLine) - 1;
          newLines.splice(startIdx, replaceEndIdx - startIdx + 1, patch.content);
          break;

        default:
          throw new PatchError(`Unknown patch type: ${(patch as PatchOperation).type}`, filePath);
      }
    }

    const newContent = newLines.join('\n');
    
    logger.info('Patches applied', { file: filePath, patches: patches.length });
    
    return newContent;
  } catch (error) {
    throw new PatchError(
      `Failed to apply patches: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filePath
    );
  }
}

export function writePatchedFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf-8');
    logger.info('File written', { file: filePath });
  } catch (error) {
    throw new PatchError(
      `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filePath
    );
  }
}

