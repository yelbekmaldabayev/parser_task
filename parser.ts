import * as fs from "fs";
import * as path from "path";

/**
 * Interface for a search result item
 */
interface SearchResult {
  link: string;
  anchor: string;
  snippet: string;
}

/**
 * Interface for the parsed data
 */
interface ParsedData {
  results: SearchResult[];
  nextPageLink: string | null;
}

/**
 * Parse Google search results HTML using regular expressions
 * @param html - The HTML content of Google search results page
 * @returns Parsed data containing search results and next page link
 */
function parseGoogleSearch(html: string): ParsedData {
  const results: SearchResult[] = [];

  // Remove newlines and extra spaces for easier regex matching
  const normalizedHtml = html.replace(/\n/g, " ").replace(/\s+/g, " ");

  // Regex to match search result blocks
  // Pattern matches: <div class="g">...<a href="URL">...<h3>ANCHOR</h3>...</a>...<div class="VwiC3b">SNIPPET</div>...</div>
  const resultBlockRegex =
    /<div class="g">\s*<div class="yuRUbf">\s*<a href="([^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>\s*<\/a>\s*<\/div>\s*<div class="VwiC3b">([^<]+)<\/div>\s*<\/div>/gi;

  let match: RegExpExecArray | null;

  while ((match = resultBlockRegex.exec(normalizedHtml)) !== null) {
    const link = match[1]?.trim() ?? "";
    const anchor = match[2]?.trim() ?? "";
    const snippet = match[3]?.trim() ?? "";

    if (link && anchor) {
      results.push({
        link,
        anchor,
        snippet,
      });
    }
  }

  // If the above regex didn't work (due to HTML variations), try alternative approach
  if (results.length === 0) {
    // Alternative regex patterns for different Google HTML structures

    // Pattern for links within yuRUbf divs
    const linkRegex = /<div class="yuRUbf">\s*<a href="([^"]+)"/gi;
    const anchorRegex = /<h3[^>]*class="[^"]*LC20lb[^"]*"[^>]*>([^<]+)<\/h3>/gi;
    const snippetRegex = /<div class="VwiC3b[^"]*"[^>]*>([^<]+)</gi;

    const links: string[] = [];
    const anchors: string[] = [];
    const snippets: string[] = [];

    // Extract all links
    while ((match = linkRegex.exec(normalizedHtml)) !== null) {
      const linkValue = match[1]?.trim();
      if (linkValue) links.push(linkValue);
    }

    // Extract all anchors (titles)
    while ((match = anchorRegex.exec(normalizedHtml)) !== null) {
      const anchorValue = match[1]?.trim();
      if (anchorValue) anchors.push(anchorValue);
    }

    // Extract all snippets
    while ((match = snippetRegex.exec(normalizedHtml)) !== null) {
      const snippetValue = match[1]?.trim();
      if (snippetValue) snippets.push(snippetValue);
    }

    // Combine results
    const minLength = Math.min(links.length, anchors.length, snippets.length);
    for (let i = 0; i < minLength; i++) {
      const link = links[i];
      const anchor = anchors[i];
      const snippet = snippets[i];
      if (link && anchor && snippet) {
        results.push({ link, anchor, snippet });
      }
    }
  }

  // Extract next page link
  // Pattern matches: <a href="URL" id="pnnext"...> or href containing start= parameter
  const nextPageRegex =
    /<a[^>]*href="([^"]*(?:start=\d+|\/search\?[^"]*)[^"]*)"[^>]*id="pnnext"/gi;
  let nextPageLink: string | null = null;

  const nextPageMatch = nextPageRegex.exec(normalizedHtml);
  if (nextPageMatch) {
    const matchedLink = nextPageMatch[1];
    if (matchedLink) {
      nextPageLink = matchedLink;
      // Convert relative URL to absolute if needed
      if (nextPageLink.startsWith("/")) {
        nextPageLink = "https://www.google.com" + nextPageLink;
      }
    }
  }

  // Alternative pattern for next page link
  if (!nextPageLink) {
    const altNextPageRegex = /id="pnnext"[^>]*href="([^"]*)"/gi;
    const altMatch = altNextPageRegex.exec(normalizedHtml);
    if (altMatch) {
      const altMatchedLink = altMatch[1];
      if (altMatchedLink) {
        nextPageLink = altMatchedLink;
        if (nextPageLink.startsWith("/")) {
          nextPageLink = "https://www.google.com" + nextPageLink;
        }
      }
    }
  }

  return {
    results,
    nextPageLink,
  };
}

/**
 * Escape a string for CSV format
 * @param str - String to escape
 * @returns Escaped string safe for CSV
 */
function escapeCSV(str: string): string {
  // If the string contains comma, quote, or newline, wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    // Escape double quotes by doubling them
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convert parsed data to CSV format
 * @param data - Parsed search results data
 * @returns CSV formatted string
 */
function toCSV(data: ParsedData): string {
  const lines: string[] = [];

  // Header row
  lines.push("Link,Anchor,Snippet");

  // Data rows
  for (const result of data.results) {
    const link = escapeCSV(result.link);
    const anchor = escapeCSV(result.anchor);
    const snippet = escapeCSV(result.snippet);
    lines.push(`${link},${anchor},${snippet}`);
  }

  // Add next page link as a separate section
  lines.push("");
  lines.push("Next Page Link");
  lines.push(data.nextPageLink ?? "Not found");

  return lines.join("\n");
}

/**
 * Main function to run the parser
 */
function main(): void {
  const inputFile = process.argv[2] ?? "google_search.html";
  const outputFile = process.argv[3] ?? "results.csv";

  // Resolve file paths relative to current working directory
  const inputPath = path.resolve(process.cwd(), inputFile);
  const outputPath = path.resolve(process.cwd(), outputFile);

  console.log(`Reading HTML from: ${inputPath}`);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Read HTML file
  const html = fs.readFileSync(inputPath, "utf-8");
  console.log(`Read ${html.length} bytes from HTML file`);

  // Parse the HTML
  const parsedData = parseGoogleSearch(html);

  console.log(`\nFound ${parsedData.results.length} search results:`);
  console.log("-------------------------------------------");

  // Display results in console
  parsedData.results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.anchor}`);
    console.log(`   Link: ${result.link}`);
    console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
  });

  console.log("\n-------------------------------------------");
  console.log(`Next Page Link: ${parsedData.nextPageLink ?? "Not found"}`);

  // Convert to CSV and save
  const csvContent = toCSV(parsedData);
  fs.writeFileSync(outputPath, csvContent, "utf-8");

  console.log(`\nResults saved to: ${outputPath}`);
}

// Run the main function
main();
