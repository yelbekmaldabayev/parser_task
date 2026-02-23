/**
 * Google Search Parser Class
 * @module parser
 */

import { ParsedData, SearchResult } from "../types";
import { extractDomain, calculateStatistics } from "../utils";
import { VERSION } from "../constants";

/**
 * GoogleSearchParser - Main parser class for extracting search results
 */
export class GoogleSearchParser {
  private html: string;
  private normalizedHtml: string;

  constructor(html: string) {
    this.html = html;
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
    const nextPageRegex =
      /<a[^>]*href="([^"]*(?:start=\d+|\/search\?[^"]*)[^"]*)"[^>]*id="pnnext"/gi;

    let match = nextPageRegex.exec(this.normalizedHtml);
    if (match?.[1]) {
      return this.normalizeUrl(match[1]);
    }

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
