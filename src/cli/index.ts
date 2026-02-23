/**
 * Command Line Interface module
 * @module cli
 */

import { CLIArgs, OutputFormat, ParsedData } from "../types";
import { VERSION, DEFAULT_INPUT, DEFAULT_OUTPUT } from "../constants";

/**
 * Display help message
 */
export function showHelp(): void {
  console.log(`
======================================================================
         Google Search Results Parser v${VERSION}
======================================================================

DESCRIPTION:
  Parse Google search results HTML and extract links, anchors, 
  snippets, and the next page link using regular expressions.

USAGE:
  npx ts-node src/index.ts [options] [input] [output]

ARGUMENTS:
  input           Input HTML file (default: ${DEFAULT_INPUT})
  output          Output file name without extension (default: ${DEFAULT_OUTPUT})

OPTIONS:
  -h, --help      Show this help message
  -f, --format    Output format: csv, json, or both (default: csv)
  -v, --verbose   Show detailed output

EXAMPLES:
  npx ts-node src/index.ts
  npx ts-node src/index.ts google.html output
  npx ts-node src/index.ts -f json search.html results
  npx ts-node src/index.ts --format both --verbose

OUTPUT:
  The parser extracts:
  - Links (URLs)
  - Anchors (titles)
  - Snippets (descriptions)
  - Domain statistics
  - Next page link
`);
}

/**
 * Parse command line arguments
 */
export function parseArgs(): CLIArgs {
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
      const format = args[++i] as OutputFormat;
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
export function printResults(data: ParsedData, verbose: boolean): void {
  console.log("\n" + "=".repeat(60));
  console.log("PARSING RESULTS");
  console.log("=".repeat(60));

  console.log(`\nFound ${data.statistics.totalResults} search results\n`);

  if (verbose) {
    data.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.anchor}`);
      console.log(`   Link: ${result.link}`);
      console.log(`   Snippet: ${result.snippet.substring(0, 80)}...`);
      console.log(`   Domain: ${result.domain}\n`);
    });
  }

  console.log("-".repeat(60));
  console.log("STATISTICS");
  console.log("-".repeat(60));
  console.log(`   Total Results: ${data.statistics.totalResults}`);
  console.log(
    `   Avg Snippet Length: ${data.statistics.averageSnippetLength} chars`,
  );
  console.log(
    `   Unique Domains: ${Object.keys(data.statistics.domainFrequency).length}`,
  );

  console.log("\n   Top Domains:");
  data.statistics.topDomains.forEach(({ domain, count }) => {
    console.log(`     - ${domain}: ${count} result(s)`);
  });

  console.log("\n" + "-".repeat(60));
  console.log("NEXT PAGE");
  console.log("-".repeat(60));
  console.log(`   ${data.nextPageLink ?? "Not found"}`);
  console.log("=".repeat(60) + "\n");
}
