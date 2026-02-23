/**
 * Unit Tests for Google Search Results Parser
 *
 * Tests the core functionality of the parser including:
 * - HTML parsing with regex
 * - Domain extraction
 * - Statistics calculation
 * - CSV/JSON output formatting
 */

import { GoogleSearchParser } from "../parser/GoogleSearchParser";
import { extractDomain, calculateStatistics, escapeCSV } from "../utils";
import { toCSV, toJSON } from "../formatters";
import { SearchResult } from "../types";

// ============================================================================
// TEST DATA
// ============================================================================

const sampleHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="search">
    <div class="g">
      <div class="yuRUbf">
        <a href="https://example.com/page1" data-ved="test">
          <h3 class="LC20lb">Example Title One</h3>
        </a>
      </div>
      <div class="VwiC3b">This is the first snippet description.</div>
    </div>
    <div class="g">
      <div class="yuRUbf">
        <a href="https://test.org/page2" data-ved="test2">
          <h3 class="LC20lb">Test Title Two</h3>
        </a>
      </div>
      <div class="VwiC3b">This is the second snippet description.</div>
    </div>
  </div>
  <a href="/search?q=test&start=10" id="pnnext">Next</a>
</body>
</html>
`;

const sampleResults: SearchResult[] = [
  {
    link: "https://example.com/page1",
    anchor: "Example Title",
    snippet: "First description",
    domain: "example.com",
  },
  {
    link: "https://example.com/page2",
    anchor: "Another Title",
    snippet: "Second description",
    domain: "example.com",
  },
  {
    link: "https://test.org/page3",
    anchor: "Test Title",
    snippet: "Third description",
    domain: "test.org",
  },
];

// ============================================================================
// TESTS: extractDomain
// ============================================================================

describe("extractDomain", () => {
  test("extracts domain from https URL", () => {
    expect(extractDomain("https://example.com/path/page")).toBe("example.com");
  });

  test("extracts domain from http URL", () => {
    expect(extractDomain("http://test.org/page")).toBe("test.org");
  });

  test("removes www prefix", () => {
    expect(extractDomain("https://www.google.com/search")).toBe("google.com");
  });

  test("handles URLs with ports", () => {
    expect(extractDomain("https://localhost:3000/api")).toBe("localhost:3000");
  });

  test("handles subdomains", () => {
    expect(extractDomain("https://blog.example.com/post")).toBe(
      "blog.example.com",
    );
  });

  test("returns unknown for invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBe("unknown");
  });

  test("returns unknown for empty string", () => {
    expect(extractDomain("")).toBe("unknown");
  });
});

// ============================================================================
// TESTS: calculateStatistics
// ============================================================================

describe("calculateStatistics", () => {
  test("calculates total results correctly", () => {
    const stats = calculateStatistics(sampleResults);
    expect(stats.totalResults).toBe(3);
  });

  test("calculates domain frequency correctly", () => {
    const stats = calculateStatistics(sampleResults);
    expect(stats.domainFrequency["example.com"]).toBe(2);
    expect(stats.domainFrequency["test.org"]).toBe(1);
  });

  test("calculates average snippet length", () => {
    const stats = calculateStatistics(sampleResults);
    expect(stats.averageSnippetLength).toBeGreaterThan(0);
  });

  test("returns top domains sorted by frequency", () => {
    const stats = calculateStatistics(sampleResults);
    expect(stats.topDomains[0]?.domain).toBe("example.com");
    expect(stats.topDomains[0]?.count).toBe(2);
  });

  test("handles empty results array", () => {
    const stats = calculateStatistics([]);
    expect(stats.totalResults).toBe(0);
    expect(stats.averageSnippetLength).toBe(0);
    expect(stats.topDomains).toHaveLength(0);
  });
});

// ============================================================================
// TESTS: escapeCSV
// ============================================================================

describe("escapeCSV", () => {
  test("returns string as-is when no special characters", () => {
    expect(escapeCSV("simple text")).toBe("simple text");
  });

  test("wraps string with commas in quotes", () => {
    expect(escapeCSV("text, with, commas")).toBe('"text, with, commas"');
  });

  test("escapes double quotes by doubling them", () => {
    expect(escapeCSV('text with "quotes"')).toBe('"text with ""quotes"""');
  });

  test("wraps string with newlines in quotes", () => {
    expect(escapeCSV("line1\nline2")).toBe('"line1\nline2"');
  });

  test("handles combination of special characters", () => {
    expect(escapeCSV('text, with "all" special\nchars')).toBe(
      '"text, with ""all"" special\nchars"',
    );
  });
});

// ============================================================================
// TESTS: GoogleSearchParser
// ============================================================================

describe("GoogleSearchParser", () => {
  test("parses search results from HTML", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");

    expect(data.results.length).toBeGreaterThan(0);
  });

  test("extracts next page link", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");

    expect(data.nextPageLink).toContain("google.com");
    expect(data.nextPageLink).toContain("start=10");
  });

  test("includes metadata", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");

    expect(data.metadata.sourceFile).toBe("test.html");
    expect(data.metadata.parserVersion).toBeDefined();
    expect(data.metadata.parsedAt).toBeDefined();
  });

  test("includes statistics", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");

    expect(data.statistics).toBeDefined();
    expect(data.statistics.totalResults).toBeGreaterThanOrEqual(0);
  });

  test("handles empty HTML gracefully", () => {
    const parser = new GoogleSearchParser("");
    const data = parser.parse("empty.html");

    expect(data.results).toHaveLength(0);
    expect(data.nextPageLink).toBeNull();
  });
});

// ============================================================================
// TESTS: Output Formatters
// ============================================================================

describe("toCSV", () => {
  test("includes header row", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");
    const csv = toCSV(data);

    expect(csv).toContain("Link,Anchor,Snippet,Domain");
  });

  test("includes metadata section", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");
    const csv = toCSV(data);

    expect(csv).toContain("# METADATA");
    expect(csv).toContain("Parser Version");
  });
});

describe("toJSON", () => {
  test("returns valid JSON", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");
    const json = toJSON(data);

    expect(() => JSON.parse(json)).not.toThrow();
  });

  test("includes all required fields", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse("test.html");
    const json = toJSON(data);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty("results");
    expect(parsed).toHaveProperty("nextPageLink");
    expect(parsed).toHaveProperty("statistics");
    expect(parsed).toHaveProperty("metadata");
  });
});
