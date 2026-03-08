import { GoogleSearchParser } from "../parser/GoogleSearchParser";
import { escapeCSV, stripHtml } from "../utils";
import { toCSV, toJSON } from "../formatters";

// ============================================================================
// ТЕСТОВЫЕ ДАННЫЕ — HTML имитирующий реальную выдачу Google
// ============================================================================

const sampleHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="tads">
    <div>
      <a href="https://ads.example.com/promo" data-ved="ad1">
        <h3>Ad Result Title</h3>
      </a>
      <div class="VwiC3b">This is an ad snippet.</div>
    </div>
  </div>
  <!-- end ads -->
  <div id="search">
    <div class="g" data-hveid="123">
      <div class="yuRUbf">
        <a href="https://example.com/page1" data-ved="test">
          <h3 class="LC20lb">Example Title One</h3>
        </a>
      </div>
      <div class="VwiC3b">This is the first snippet description.</div>
    </div></div></div>
    <div class="g" data-hveid="456">
      <div class="yuRUbf">
        <a href="https://test.org/page2" data-ved="test2">
          <h3 class="LC20lb">Test Title Two</h3>
        </a>
      </div>
      <div class="VwiC3b">Second snippet with <b>bold</b> text.</div>
    </div></div></div>
  <a href="/search?q=test&amp;start=10" id="pnnext">Next</a>
</body>
</html>
`;

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
});

// ============================================================================
// TESTS: stripHtml
// ============================================================================

describe("stripHtml", () => {
  test("removes HTML tags", () => {
    expect(stripHtml("<b>bold</b> text")).toBe("bold text");
  });

  test("decodes HTML entities", () => {
    expect(stripHtml("&amp; &lt; &gt; &quot; &#39;")).toBe("& < > \" '");
  });

  test("collapses whitespace", () => {
    expect(stripHtml("  lots   of   spaces  ")).toBe("lots of spaces");
  });

  test("handles nested tags", () => {
    expect(stripHtml("<div><span>nested</span></div>")).toBe("nested");
  });
});

// ============================================================================
// TESTS: GoogleSearchParser
// ============================================================================

describe("GoogleSearchParser", () => {
  test("parses organic results from HTML", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();

    const organic = data.results.filter((r) => r.type === "organic");
    expect(organic.length).toBeGreaterThan(0);
  });

  test("parses ad results from HTML", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();

    const ads = data.results.filter((r) => r.type === "ad");
    expect(ads.length).toBeGreaterThan(0);
    expect(ads[0]?.anchor).toBe("Ad Result Title");
  });

  test("extracts link, anchor, snippet for each result", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();

    for (const result of data.results) {
      expect(result.link).toMatch(/^https?:\/\//);
      expect(result.anchor.length).toBeGreaterThan(0);
      expect(result.type).toMatch(/^(ad|organic)$/);
    }
  });

  test("extracts next page link", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();

    expect(data.nextPageLink).toContain("google.com");
    expect(data.nextPageLink).toContain("start=10");
  });

  test("handles empty HTML gracefully", () => {
    const parser = new GoogleSearchParser("");
    const data = parser.parse();

    expect(data.results).toHaveLength(0);
    expect(data.nextPageLink).toBeNull();
  });

  test("no duplicate links in results", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const links = data.results.map((r) => r.link);
    const unique = new Set(links);
    expect(links.length).toBe(unique.size);
  });
});

// ============================================================================
// TESTS: toCSV
// ============================================================================

describe("toCSV", () => {
  test("includes header row with Type column", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const csv = toCSV(data);

    expect(csv.startsWith("Type,Link,Anchor,Snippet\n")).toBe(true);
  });

  test("does not include metadata section", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const csv = toCSV(data);

    expect(csv).not.toContain("# METADATA");
    expect(csv).not.toContain("# TOP DOMAINS");
  });

  test("includes type values ad and organic", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const csv = toCSV(data);

    expect(csv).toContain("ad,");
    expect(csv).toContain("organic,");
  });
});

// ============================================================================
// TESTS: toJSON
// ============================================================================

describe("toJSON", () => {
  test("returns valid JSON", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const json = toJSON(data);

    expect(() => JSON.parse(json)).not.toThrow();
  });

  test("includes all required fields", () => {
    const parser = new GoogleSearchParser(sampleHtml);
    const data = parser.parse();
    const json = toJSON(data);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty("results");
    expect(parsed).toHaveProperty("nextPageLink");
  });
});
