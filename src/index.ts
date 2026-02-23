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

import { GoogleSearchParser } from "./parser/GoogleSearchParser";
import { toCSV, toJSON } from "./formatters";
import { showHelp, parseArgs, printResults } from "./cli";
import { VERSION } from "./constants";

// Re-export for external use
export * from "./types";
export * from "./utils";
export * from "./formatters";
export { GoogleSearchParser } from "./parser/GoogleSearchParser";

/**
 * Main entry point
 */
function main(): void {
  const args = parseArgs();

  if (args.showHelp) {
    showHelp();
    return;
  }

  const inputPath = path.resolve(process.cwd(), args.inputFile);

  console.log(`\nGoogle Search Results Parser v${VERSION}`);
  console.log(`Reading: ${inputPath}`);

  if (!fs.existsSync(inputPath)) {
    console.error(`\nError: Input file not found: ${inputPath}`);
    console.error(`Run with --help for usage information.\n`);
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf-8");
  console.log(`Read ${html.length.toLocaleString()} bytes`);

  const parser = new GoogleSearchParser(html);
  const data = parser.parse(args.inputFile);

  printResults(data, args.verbose);

  const outputBase = path.resolve(process.cwd(), args.outputFile);

  if (args.format === "csv" || args.format === "both") {
    const csvPath = outputBase + ".csv";
    fs.writeFileSync(csvPath, toCSV(data), "utf-8");
    console.log(`Saved CSV: ${csvPath}`);
  }

  if (args.format === "json" || args.format === "both") {
    const jsonPath = outputBase + ".json";
    fs.writeFileSync(jsonPath, toJSON(data), "utf-8");
    console.log(`Saved JSON: ${jsonPath}`);
  }

  console.log("\nParsing completed successfully!\n");
}

main();
