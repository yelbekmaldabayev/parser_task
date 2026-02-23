/**
 * Utility functions for Google Search Results Parser
 * @module utils
 */

import { SearchResult, Statistics } from "../types";

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
    domainFrequency[result.domain] = (domainFrequency[result.domain] ?? 0) + 1;
    totalSnippetLength += result.snippet.length;
  }

  const topDomains = Object.entries(domainFrequency)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalResults: results.length,
    domainFrequency,
    averageSnippetLength:
      results.length > 0 ? Math.round(totalSnippetLength / results.length) : 0,
    topDomains,
  };
}

/**
 * Escape a string for CSV format
 * @param str - String to escape
 * @returns Escaped string safe for CSV
 */
export function escapeCSV(str: string): string {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
