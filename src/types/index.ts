/**
 * TypeScript interfaces for Google Search Results Parser
 * @module types
 */

/**
 * Represents a single search result item from Google
 */
export interface SearchResult {
  /** The URL of the search result */
  link: string;
  /** The clickable title/anchor text */
  anchor: string;
  /** The description snippet shown below the title */
  snippet: string;
  /** The domain extracted from the link */
  domain: string;
}

/**
 * Complete parsed data including results and metadata
 */
export interface ParsedData {
  /** Array of search results */
  results: SearchResult[];
  /** Link to the next page of results (if available) */
  nextPageLink: string | null;
  /** Statistics about the parsed data */
  statistics: Statistics;
  /** Metadata about the parsing operation */
  metadata: Metadata;
}

/**
 * Statistics calculated from the search results
 */
export interface Statistics {
  /** Total number of results found */
  totalResults: number;
  /** Count of results per domain */
  domainFrequency: Record<string, number>;
  /** Average snippet length in characters */
  averageSnippetLength: number;
  /** Top domains by frequency */
  topDomains: DomainCount[];
}

/**
 * Domain frequency count
 */
export interface DomainCount {
  domain: string;
  count: number;
}

/**
 * Metadata about the parsing operation
 */
export interface Metadata {
  /** When the parsing was performed */
  parsedAt: string;
  /** Source file that was parsed */
  sourceFile: string;
  /** Version of the parser */
  parserVersion: string;
}

/**
 * Supported output formats
 */
export type OutputFormat = "csv" | "json" | "both";

/**
 * Command line arguments interface
 */
export interface CLIArgs {
  inputFile: string;
  outputFile: string;
  format: OutputFormat;
  showHelp: boolean;
  verbose: boolean;
}
