// Error handling utilities

export class ExtractionError extends Error {
  constructor(message: string, public readonly file?: string, public readonly line?: number) {
    super(message);
    this.name = 'ExtractionError';
  }
}

export class RulesetError extends Error {
  constructor(message: string, public readonly ruleset?: string) {
    super(message);
    this.name = 'RulesetError';
  }
}

export class CritiqueError extends Error {
  constructor(message: string, public readonly category?: string) {
    super(message);
    this.name = 'CritiqueError';
  }
}

export class PatchError extends Error {
  constructor(message: string, public readonly file?: string, public readonly operation?: string) {
    super(message);
    this.name = 'PatchError';
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof ExtractionError) {
    return { message: error.message, code: 'EXTRACTION_ERROR' };
  }
  if (error instanceof RulesetError) {
    return { message: error.message, code: 'RULESET_ERROR' };
  }
  if (error instanceof CritiqueError) {
    return { message: error.message, code: 'CRITIQUE_ERROR' };
  }
  if (error instanceof PatchError) {
    return { message: error.message, code: 'PATCH_ERROR' };
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }
  return { message: 'An unknown error occurred', code: 'UNKNOWN_ERROR' };
}

