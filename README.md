# Google Search Results Parser

<p align="center">
  <strong>A professional TypeScript tool for parsing Google search results using regular expressions</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest">
  <img src="https://img.shields.io/badge/version-2.1.0-blue?style=for-the-badge" alt="Version">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Output Formats](#output-formats)
- [CLI Options](#cli-options)
- [Testing](#testing)
- [Architecture](#architecture)
- [API Reference](#api-reference)

---

## Overview

This project is a solution for the following technical task:

> Using NodeJS + TypeScript:
>
> 1. Parse Google search results HTML for the query "get taxi"
> 2. Extract links, anchors, snippets, and next page link using **regular expressions**
> 3. Save results to CSV format

### What Makes This Solution Stand Out

This implementation goes **beyond the basic requirements** with:

- **Multiple output formats** (CSV & JSON)
- **Analytics & Statistics** (domain frequency, averages)
- **Professional CLI** with help menu and flags
- **Comprehensive unit tests** (26 tests) with Jest
- **Clean, modular architecture** with separation of concerns
- **Object-oriented design** with exported classes and interfaces

---

## Features

| Feature            | Description                          |
| ------------------ | ------------------------------------ |
| Link Extraction    | Extracts all result URLs using regex |
| Anchor Extraction  | Parses clickable title text          |
| Snippet Extraction | Captures description text            |
| Next Page Link     | Finds pagination link                |
| Domain Analysis    | Extracts and counts domains          |
| Statistics         | Calculates averages and frequencies  |
| CSV Export         | Standard comma-separated format      |
| JSON Export        | Structured data with metadata        |
| CLI Interface      | Professional command-line tool       |
| Unit Tests         | 26 tests with Jest                   |

---

## Project Structure

```
parser_task/
├── src/
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts        # SearchResult, ParsedData, Statistics, etc.
│   ├── utils/              # Utility functions
│   │   └── index.ts        # extractDomain, calculateStatistics, escapeCSV
│   ├── formatters/         # Output formatters
│   │   └── index.ts        # toCSV, toJSON
│   ├── parser/             # Parser class
│   │   ├── GoogleSearchParser.ts
│   │   └── index.ts
│   ├── cli/                # CLI handling
│   │   └── index.ts        # parseArgs, showHelp, printResults
│   ├── constants.ts        # Application constants
│   ├── index.ts            # Main entry point
│   └── __tests__/          # Unit tests
│       └── parser.test.ts
├── google_search.html      # Sample input file
├── results.csv             # CSV output
├── results.json            # JSON output
├── jest.config.js          # Test configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

### Why This Structure?

| Folder        | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `types/`      | Centralized TypeScript interfaces for reusability      |
| `utils/`      | Pure helper functions that can be tested independently |
| `formatters/` | Output format converters, easily extendable            |
| `parser/`     | Core parsing logic, single responsibility              |
| `cli/`        | Command-line interface, separate from business logic   |
| `__tests__/`  | Co-located tests following Jest conventions            |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yelbekmaldabayev/parser_task.git
cd parser_task

# Install dependencies
npm install
```

---

## Usage

### Quick Start

```bash
# Run with default settings (reads google_search.html, outputs results.csv)
npm start

# Or run directly
npx ts-node src/index.ts
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
npx ts-node src/index.ts my_search.html my_results

# With format option
npx ts-node src/index.ts -f json my_search.html output
npx ts-node src/index.ts --format both --verbose input.html results
```

---

## Output Formats

### CSV Output (`results.csv`)

```csv
Link,Anchor,Snippet,Domain
https://gett.com/uk/,Gett - The Official Website,Description...,gett.com
https://www.uber.com/,Uber - Request a Ride,Description...,uber.com

# METADATA
Parsed At,2026-02-23T18:00:00.000Z
Parser Version,2.1.0
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
    "parserVersion": "2.1.0"
  }
}
```

---

## CLI Options

```
======================================================================
         Google Search Results Parser v2.1.0
======================================================================

USAGE:
  npx ts-node src/index.ts [options] [input] [output]

ARGUMENTS:
  input           Input HTML file (default: google_search.html)
  output          Output file name without extension (default: results)

OPTIONS:
  -h, --help      Show help message
  -f, --format    Output format: csv, json, or both (default: csv)
  -v, --verbose   Show detailed output with all results

EXAMPLES:
  npx ts-node src/index.ts
  npx ts-node src/index.ts google.html output
  npx ts-node src/index.ts -f json search.html results
  npx ts-node src/index.ts --format both --verbose
```

---

## Testing

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

- Domain extraction from URLs
- Statistics calculation
- CSV escaping special characters
- HTML parsing with multiple patterns
- Next page link extraction
- Empty/edge case handling
- Output formatters (CSV & JSON)

---

## Architecture

### Interfaces (`src/types/index.ts`)

```typescript
interface SearchResult {
  link: string;
  anchor: string;
  snippet: string;
  domain: string;
}

interface ParsedData {
  results: SearchResult[];
  nextPageLink: string | null;
  statistics: Statistics;
  metadata: Metadata;
}

interface Statistics {
  totalResults: number;
  domainFrequency: Record<string, number>;
  averageSnippetLength: number;
  topDomains: DomainCount[];
}
```

### Main Class (`src/parser/GoogleSearchParser.ts`)

```typescript
class GoogleSearchParser {
  constructor(html: string);
  parse(sourceFile: string): ParsedData;
}
```

### Helper Functions (`src/utils/index.ts`)

```typescript
extractDomain(url: string): string
calculateStatistics(results: SearchResult[]): Statistics
escapeCSV(str: string): string
```

---

## API Reference

### GoogleSearchParser

```typescript
import { GoogleSearchParser } from "./src/parser";

const parser = new GoogleSearchParser(htmlString);
const data = parser.parse("source.html");

console.log(data.results); // SearchResult[]
console.log(data.nextPageLink); // string | null
console.log(data.statistics); // Statistics
console.log(data.metadata); // Metadata
```

### Importing Types

```typescript
import { SearchResult, ParsedData, Statistics, Metadata } from "./src/types";
```

### Using Utility Functions

```typescript
import { extractDomain, calculateStatistics, escapeCSV } from "./src/utils";

// Extract domain from URL
extractDomain("https://www.example.com/page"); // 'example.com'

// Calculate statistics from results
const stats = calculateStatistics(searchResults);
```

---

## Regular Expressions Used

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

## Technical Decisions

| Decision                    | Rationale                                                |
| --------------------------- | -------------------------------------------------------- |
| **Regex over DOM parsing**  | Task requirement; demonstrates regex proficiency         |
| **Multiple regex patterns** | Google HTML varies; fallback patterns ensure reliability |
| **Modular architecture**    | Clean separation of concerns, testable code              |
| **TypeScript strict mode**  | Type safety, better IDE support                          |
| **Statistics included**     | Added value; shows analytical thinking                   |
| **Jest for testing**        | Industry standard; good coverage reporting               |

---

## License

ISC

---

## Author

**Yelbek Maldabayev**

- GitHub: [@yelbekmaldabayev](https://github.com/yelbekmaldabayev)

---

<p align="center">
  Made with TypeScript
</p>
