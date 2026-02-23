/**
 * Google Search Results Parser
 * 
 * A professional TypeScript tool for parsing Google search results
 * using regular expressions. Supports multiple output formats and
 * provides analytics on extracted data.
 * 
 * @author Yelbek Maldabayev
 * @version 2.0.0
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

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
  topDomains: Array<{ domain: string; count: number }>;
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
interface CLIArgs {
  inputFile: string;
  outputFile: string;
  format: OutputFormat;
  showHelp: boolean;
  verbose: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VERSION = "2.0.0";
const DEFAULT_INPUT = "google_search.html";
const DEFAULT_OUTPUT = "results";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract domain from a URL
 * @param url - The full URL
 * @returns The domain name
 */
export function extractDomain(url: string): string {
  try {
    const match = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/i);
    return match?.[1] ?? "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Calculate statistics from search results
 * @param results - Array of search results
 * @returns Statistics object
 */
export function calculateStatistics(results: SearchResult[]): Statistics {
  const domainFrequency: Record<string, number> = {};
  let totalSnippetLength = 0;

  for (const result of results) {
    // Count domain frequency
    domainFrequency[result.domain] = (domainFrequency[result.domain] ?? 0) + 1;
    // Sum snippet lengths
    totalSnippetLength += result.snippet.length;
  }

  // Sort domains by frequency
  const topDomains = Object.entries(domainFrequency)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalResults: results.length,
    domainFrequency,
    averageSnippetLength: results.length > 0 
      ? Math.round(totalSnippetLength / results.length) 
      : 0,
    topDomains,
  };
}

// ============================================================================
// PARSER CLASS
// ============================================================================

/**
 * GoogleSearchParser - Main parser class for extracting search results
 */
export class GoogleSearchParser {
  private html: string;
  private normalizedHtml: string;

  constructor(html: string) {
    this.html = html;
    // Normalize HTML for easier regex matching
    this.normalizedHtml = html.replace(/\n/g, " ").replace(/\s+/g, " ");
  }

  /**
   * Parse the HTML and extract all search results
   * @param sourceFile - Name of the source file for metadata
   * @returns ParsedData object with results, statistics, and metadata
   */
  public parse(sourceFile: string): ParsedData {
    const results = this.extractResults();
    const nextPageLink = this.extractNextPageLink();
    const statistics = calculateStatistics(results);

    return {
      results,
      nextPageLink,
      statistics,
      metadata: {
        parsedAt: new Date().toISOString(),
        sourceFile,
        parserVersion: VERSION,
      },
    };
  }

  /**
   * Extract search results using multiple regex patterns
   * @returns Array of SearchResult objects
   */
  private extractResults(): SearchResult[] {
    let results = this.extractResultsPrimaryPattern();
    
    if (results.length === 0) {
      results = this.extractResultsAlternativePattern();
    }

    return results;
  }

  /**
   * Primary extraction pattern for modern Google HTML structure
   */
  private extractResultsPrimaryPattern(): SearchResult[] {
    const results: SearchResult[] = [];
    
    const resultBlockRegex =
      /<div class="g">\s*<div class="yuRUbf">\s*<a href="([^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>\s*<\/a>\s*<\/div>\s*<div class="VwiC3b">([^<]+)<\/div>\s*<\/div>/gi;

    let match: RegExpExecArray | null;

    while ((match = resultBlockRegex.exec(this.normalizedHtml)) !== null) {
      const link = match[1]?.trim() ?? "";
      const anchor = match[2]?.trim() ?? "";
      const snippet = match[3]?.trim() ?? "";

      if (link && anchor) {
        results.push({
          link,
          anchor,
          snippet,
          domain: extractDomain(link),
        });
      }
    }

    return results;
  }

  /**
   * Alternative extraction pattern for different Google HTML structures
   */
  private extractResultsAlternativePattern(): SearchResult[] {
    const results: SearchResult[] = [];

    const linkRegex = /<div class="yuRUbf">\s*<a href="([^"]+)"/gi;
    const anchorRegex = /<h3[^>]*class="[^"]*LC20lb[^"]*"[^>]*>([^<]+)<\/h3>/gi;
    const snippetRegex = /<div class="VwiC3b[^"]*"[^>]*>([^<]+)</gi;

    const links: string[] = [];
    const anchors: string[] = [];
    const snippets: string[] = [];

    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(this.normalizedHtml)) !== null) {
      const value = match[1]?.trim();
      if (value) links.push(value);
    }

    while ((match = anchorRegex.exec(this.normalizedHtml)) !== null) {
      const value = match[1]?.trim();
      if (value) anchors.push(value);
    }

    while ((match = snippetRegex.exec(this.normalizedHtml)) !== null) {
      const value = match[1]?.trim();
      if (value) snippets.push(value);
    }

    const minLength = Math.min(links.length, anchors.length, snippets.length);
    for (let i = 0; i < minLength; i++) {
      const link = links[i];
      const anchor = anchors[i];
      const snippet = snippets[i];
      if (link && anchor && snippet) {
        results.push({
          link,
          anchor,
          snippet,
          domain: extractDomain(link),
        });
      }
    }

    return results;
  }

  /**
   * Extract the "Next" page link from search results
   */
  private extractNextPageLink(): string | null {
    // Primary pattern: href before id
    const nextPageRegex =
      /<a[^>]*href="([^"]*(?:start=\d+|\/search\?[^"]*)[^"]*)"[^>]*id="pnnext"/gi;
    
    let match = nextPageRegex.exec(this.normalizedHtml);
    if (match?.[1]) {
      return this.normalizeUrl(match[1]);
    }

    // Alternative pattern: id before href
    const altNextPageRegex = /id="pnnext"[^>]*href="([^"]*)"/gi;
    match = altNextPageRegex.exec(this.normalizedHtml);
    if (match?.[1]) {
      return this.normalizeUrl(match[1]);
    }

    return null;
  }

  /**
   * Convert relative URLs to absolute Google URLs
   */
  private normalizeUrl(url: string): string {
    if (url.startsWith("/")) {
      return "https://www.google.com" + url;
    }
    return url;
  }
}

// ============================================================================
// OUTPUT FORMATTERS
// ============================================================================

/**
 * Escape a string for CSV format
 */
export function escapeCSV(str: string): string {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convert parsed data to CSV format
 */
export function toCSV(data: ParsedData): string {
  const lines: string[] = [];

  // Header row
  lines.push("Link,Anchor,Snippet,Domain");

  // Data rows
  for (const result of data.results) {
    lines.push([
      escapeCSV(result.link),
      escapeCSV(result.anchor),
      escapeCSV(result.snippet),
      escapeCSV(result.domain),
    ].join(","));
  }

  // Separator
  lines.push("");
  lines.push("# METADATA");
  lines.push(`Parsed At,${data.metadata.parsedAt}`);
  lines.push(`Parser Version,${data.metadata.parserVersion}`);
  lines.push(`Total Results,${data.statistics.totalResults}`);
  lines.push(`Average Snippet Length,${data.statistics.averageSnippetLength}`);
  
  lines.push("");
  lines.push("# NEXT PAGE");
  lines.push(data.nextPageLink ?? "Not found");

  lines.push("");
  lines.push("# TOP DOMAINS");
  for (const { domain, count } of data.statistics.topDomains) {
    lines.push(`${domain},${count}`);
  }

  return lines.join("\n");
}

/**
 * Convert parsed data to formatted JSON
 */
export function toJSON(data: ParsedData): string {
  return JSON.stringify(data, null, 2);
}

// ============================================================================
// CLI FUNCTIONS
// ============================================================================

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Google Search Results Parser v${VERSION}                  ║
╚════════════════════════════════════════════════════════════════╝

DESCRIPTION:
  Parse Google search results HTML and extract links, anchors, 
  snippets, and the next page link using regular expressions.

USAGE:
  npx ts-node parser.ts [options] [input] [output]

ARGUMENTS:
  input           Input HTML file (default: google_search.html)
  output          Output file name without extension (default: results)

OPTIONS:
  -h, --help      Show this help message
  -f, --format    Output format: csv, json, or both (default: csv)
  -v, --verbose   Show detailed output

EXAMPLES:
  npx ts-node parser.ts
  npx ts-node parser.ts google.html output
  npx ts-node parser.ts -f json search.html results
  npx ts-node parser.ts --format both --verbose

OUTPUT:
  The parser extracts:
  • Links (URLs)
  • Anchors (titles)
  • Snippets (descriptions)
  • Domain statistics
  • Next page link
`);
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = {
    inputFile: DEFAULT_INPUT,
    outputFile: DEFAULT_OUTPUT,
    format: "csv",
    showHelp: false,
    verbose: false,
  };

  const positionalArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "-h" || arg === "--help") {
      result.showHelp = true;
    } else if (arg === "-v" || arg === "--verbose") {
      result.verbose = true;
    } else if (arg === "-f" || arg === "--format") {
      const format = args[++i];
      if (format === "csv" || format === "json" || format === "both") {
        result.format = format;
      }
    } else if (!arg?.startsWith("-")) {
      positionalArgs.push(arg ?? "");
    }
  }

  if (positionalArgs[0]) result.inputFile = positionalArgs[0];
  if (positionalArgs[1]) result.outputFile = positionalArgs[1];

  return result;
}

/**
 * Print results to console in a formatted way
 */
function printResults(data: ParsedData, verbose: boolean): void {
  console.log("\n" + "═".repeat(60));
  console.log("📊 PARSING RESULTS");
  console.log("═".repeat(60));

  console.log(`\n✓ Found ${data.statistics.totalResults} search results\n`);

  if (verbose) {
    data.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.anchor}`);
      console.log(`   🔗 ${result.link}`);
      console.log(`   📝 ${result.snippet.substring(0, 80)}...`);
      console.log(`   🌐 Domain: ${result.domain}\n`);
    });
  }

  console.log("─".repeat(60));
  console.log("📈 STATISTICS");
  console.log("─".repeat(60));
  console.log(`   Total Results: ${data.statistics.totalResults}`);
  console.log(`   Avg Snippet Length: ${data.statistics.averageSnippetLength} chars`);
  console.log(`   Unique Domains: ${Object.keys(data.statistics.domainFrequency).length}`);
  
  console.log("\n   Top Domains:");
  data.statistics.topDomains.forEach(({ domain, count }) => {
    console.log(`     • ${domain}: ${count} result(s)`);
  });

  console.log("\n─".repeat(60));
  console.log("🔗 NEXT PAGE");
  console.log("─".repeat(60));
  console.log(`   ${data.nextPageLink ?? "Not found"}`);
  console.log("═".repeat(60) + "\n");
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main entry point
 */
function main(): void {
  const args = parseArgs();

  if (args.showHelp) {
    showHelp();
    return;
  }

  // Resolve paths
  const inputPath = path.resolve(process.cwd(), args.inputFile);
  
  console.log(`\n🔍 Google Search Results Parser v${VERSION}`);
  console.log(`📂 Reading: ${inputPath}`);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`\n❌ Error: Input file not found: ${inputPath}`);
    console.error(`   Run with --help for usage information.\n`);
    process.exit(1);
  }

  // Read and parse HTML
  const html = fs.readFileSync(inputPath, "utf-8");
  console.log(`📄 Read ${html.length.toLocaleString()} bytes`);

  const parser = new GoogleSearchParser(html);
  const data = parser.parse(args.inputFile);

  // Print results to console
  printResults(data, args.verbose);

  // Save output files
  const outputBase = path.resolve(process.cwd(), args.outputFile);

  if (args.format === "csv" || args.format === "both") {
    const csvPath = outputBase + ".csv";
    fs.writeFileSync(csvPath, toCSV(data), "utf-8");
    console.log(`💾 Saved CSV: ${csvPath}`);
  }

  if (args.format === "json" || args.format === "both") {
    const jsonPath = outputBase + ".json";
    fs.writeFileSync(jsonPath, toJSON(data), "utf-8");
    console.log(`💾 Saved JSON: ${jsonPath}`);
  }

  console.log("\n✅ Parsing completed successfully!\n");
}

// Run if this is the main module
main();
