/**
 * Output formatters for Google Search Results Parser
 * @module formatters
 */

import { ParsedData } from "../types";
import { escapeCSV } from "../utils";

/**
 * Convert parsed data to CSV format
 * @param data - Parsed search results data
 * @returns CSV formatted string
 */
export function toCSV(data: ParsedData): string {
  const lines: string[] = [];

  // Header row
  lines.push("Link,Anchor,Snippet,Domain");

  // Data rows
  for (const result of data.results) {
    lines.push(
      [
        escapeCSV(result.link),
        escapeCSV(result.anchor),
        escapeCSV(result.snippet),
        escapeCSV(result.domain),
      ].join(","),
    );
  }

  // Metadata section
  lines.push("");
  lines.push("# METADATA");
  lines.push(`Parsed At,${data.metadata.parsedAt}`);
  lines.push(`Parser Version,${data.metadata.parserVersion}`);
  lines.push(`Total Results,${data.statistics.totalResults}`);
  lines.push(`Average Snippet Length,${data.statistics.averageSnippetLength}`);

  // Next page section
  lines.push("");
  lines.push("# NEXT PAGE");
  lines.push(data.nextPageLink ?? "Not found");

  // Top domains section
  lines.push("");
  lines.push("# TOP DOMAINS");
  for (const { domain, count } of data.statistics.topDomains) {
    lines.push(`${domain},${count}`);
  }

  return lines.join("\n");
}

/**
 * Convert parsed data to formatted JSON
 * @param data - Parsed search results data
 * @returns JSON formatted string
 */
export function toJSON(data: ParsedData): string {
  return JSON.stringify(data, null, 2);
}
