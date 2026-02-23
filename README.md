# 🔍 Google Search Results Parser

<p align="center">
  <strong>A professional TypeScript tool for parsing Google search results using regular expressions</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest">
  <img src="https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge" alt="Version">
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Output Formats](#-output-formats)
- [CLI Options](#-cli-options)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)

---

## 🎯 Overview

This project is a solution for the following technical task:

> Using NodeJS + TypeScript:
> 1. Parse Google search results HTML for the query "get taxi"
> 2. Extract links, anchors, snippets, and next page link using **regular expressions**
> 3. Save results to CSV format

### What Makes This Solution Stand Out

This implementation goes **beyond the basic requirements** with:

- ✨ **Multiple output formats** (CSV & JSON)
- 📊 **Analytics & Statistics** (domain frequency, averages)
- 🖥️ **Professional CLI** with help menu and flags
- 🧪 **Comprehensive unit tests** with Jest
- 📝 **Clean, documented code** following best practices
- 🏗️ **Object-oriented design** with exported classes

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **Link Extraction** | Extracts all result URLs using regex |
| 📌 **Anchor Extraction** | Parses clickable title text |
| 📝 **Snippet Extraction** | Captures description text |
| ➡️ **Next Page Link** | Finds pagination link |
| 🌐 **Domain Analysis** | Extracts and counts domains |
| 📈 **Statistics** | Calculates averages and frequencies |
| 📄 **CSV Export** | Standard comma-separated format |
| 📋 **JSON Export** | Structured data with metadata |
| 🖥️ **CLI Interface** | Professional command-line tool |
| 🧪 **Unit Tests** | 20+ tests with Jest |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yelbekmaldabayev/parser_task.git
cd parser_task

# Install dependencies
npm install
```

---

## 💻 Usage

### Quick Start

```bash
# Run with default settings (reads google_search.html, outputs results.csv)
npm start

# Or run directly
npx ts-node parser.ts
```

### Common Commands

```bash
# Parse and output CSV (default)
npm run parse

# Parse and output JSON
npm run parse:json

# Parse and output both CSV and JSON
npm run parse:both

# Parse with verbose output (shows all results)
npm run parse:verbose

# Show help
npm run help
```

### Custom Files

```bash
# Specify input and output files
npx ts-node parser.ts my_search.html my_results

# With format option
npx ts-node parser.ts -f json my_search.html output
npx ts-node parser.ts --format both --verbose input.html results
```

---

## 📄 Output Formats

### CSV Output (`results.csv`)

```csv
Link,Anchor,Snippet,Domain
https://gett.com/uk/,Gett - The Official Website,Description...,gett.com
https://www.uber.com/,Uber - Request a Ride,Description...,uber.com

# METADATA
Parsed At,2026-02-23T18:00:00.000Z
Parser Version,2.0.0
Total Results,10

# NEXT PAGE
https://www.google.com/search?q=get+taxi&start=10

# TOP DOMAINS
gett.com,1
uber.com,1
```

### JSON Output (`results.json`)

```json
{
  "results": [
    {
      "link": "https://gett.com/uk/",
      "anchor": "Gett - The Official Website",
      "snippet": "Gett is a global...",
      "domain": "gett.com"
    }
  ],
  "nextPageLink": "https://www.google.com/search?q=get+taxi&start=10",
  "statistics": {
    "totalResults": 10,
    "domainFrequency": { "gett.com": 1, "uber.com": 1 },
    "averageSnippetLength": 95,
    "topDomains": [{ "domain": "gett.com", "count": 1 }]
  },
  "metadata": {
    "parsedAt": "2026-02-23T18:00:00.000Z",
    "sourceFile": "google_search.html",
    "parserVersion": "2.0.0"
  }
}
```

---

## 🖥️ CLI Options

```
╔════════════════════════════════════════════════════════════════╗
║         Google Search Results Parser v2.0.0                    ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  npx ts-node parser.ts [options] [input] [output]

ARGUMENTS:
  input           Input HTML file (default: google_search.html)
  output          Output file name without extension (default: results)

OPTIONS:
  -h, --help      Show help message
  -f, --format    Output format: csv, json, or both (default: csv)
  -v, --verbose   Show detailed output with all results

EXAMPLES:
  npx ts-node parser.ts
  npx ts-node parser.ts google.html output
  npx ts-node parser.ts -f json search.html results
  npx ts-node parser.ts --format both --verbose
```

---

## 🧪 Testing

The project includes comprehensive unit tests using Jest.

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

### Test Coverage

Tests cover:
- ✅ Domain extraction from URLs
- ✅ Statistics calculation
- ✅ CSV escaping special characters
- ✅ HTML parsing with multiple patterns
- ✅ Next page link extraction
- ✅ Empty/edge case handling
- ✅ Output formatters (CSV & JSON)

---

## 🏗️ Architecture

```
parser_task/
├── parser.ts           # Main parser with CLI
├── parser.test.ts      # Unit tests
├── google_search.html  # Sample input file
├── results.csv         # CSV output
├── results.json        # JSON output
├── jest.config.js      # Test configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

### Code Structure

```typescript
// Interfaces
interface SearchResult { link, anchor, snippet, domain }
interface ParsedData { results, nextPageLink, statistics, metadata }
interface Statistics { totalResults, domainFrequency, averageSnippetLength, topDomains }

// Main Class
class GoogleSearchParser {
  parse(): ParsedData
  extractResults(): SearchResult[]
  extractNextPageLink(): string | null
}

// Helper Functions
extractDomain(url): string
calculateStatistics(results): Statistics
escapeCSV(str): string
toCSV(data): string
toJSON(data): string
```

---

## 📚 API Reference

### GoogleSearchParser

```typescript
import { GoogleSearchParser } from './parser';

const parser = new GoogleSearchParser(htmlString);
const data = parser.parse('source.html');

console.log(data.results);        // SearchResult[]
console.log(data.nextPageLink);   // string | null
console.log(data.statistics);     // Statistics
console.log(data.metadata);       // Metadata
```

### Helper Functions

```typescript
import { extractDomain, calculateStatistics, toCSV, toJSON } from './parser';

// Extract domain from URL
extractDomain('https://www.example.com/page'); // 'example.com'

// Calculate statistics from results
const stats = calculateStatistics(searchResults);

// Convert to output format
const csv = toCSV(parsedData);
const json = toJSON(parsedData);
```

---

## 📜 Regular Expressions Used

The parser uses multiple regex patterns to handle different Google HTML structures:

```typescript
// Primary pattern for search results
/<div class="g">.*?<a href="([^"]+)".*?<h3[^>]*>([^<]+)<\/h3>.*?<div class="VwiC3b">([^<]+)/gi

// Alternative pattern for different HTML structure
/<div class="yuRUbf">.*?<a href="([^"]+)"/gi
/<h3[^>]*class="[^"]*LC20lb[^"]*"[^>]*>([^<]+)<\/h3>/gi

// Next page link patterns
/<a[^>]*href="([^"]*start=\d+[^"]*)"[^>]*id="pnnext"/gi
/id="pnnext"[^>]*href="([^"]*)"/gi

// Domain extraction
/^https?:\/\/(?:www\.)?([^\/]+)/i
```

---

## 🛠️ Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Regex over DOM parsing** | Task requirement; demonstrates regex proficiency |
| **Multiple regex patterns** | Google HTML varies; fallback patterns ensure reliability |
| **Class-based architecture** | Clean, testable, exportable code |
| **Statistics included** | Added value; shows analytical thinking |
| **CLI with flags** | Professional tool design |
| **Jest for testing** | Industry standard; good coverage reporting |

---

## 📝 License

ISC

---

## 👤 Author

**Yelbek Maldabayev**

- GitHub: [@yelbekmaldabayev](https://github.com/yelbekmaldabayev)

---

<p align="center">
  Made with ❤️ using TypeScript
</p>
