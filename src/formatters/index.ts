import { ParsedData } from "../types";
import { escapeCSV } from "../utils";

/**
 * Конвертация результатов парсинга в CSV.
 * Формат: Type,Link,Anchor,Snippet
 * Чистый CSV без метаданных — для корректного отображения на GitHub.
 */
export function toCSV(data: ParsedData): string {
  const lines: string[] = [];

  lines.push("Type,Link,Anchor,Snippet");

  for (const result of data.results) {
    lines.push(
      [
        result.type,
        escapeCSV(result.link),
        escapeCSV(result.anchor),
        escapeCSV(result.snippet),
      ].join(","),
    );
  }

  return lines.join("\n") + "\n";
}

/**
 * Конвертация в JSON
 */
export function toJSON(data: ParsedData): string {
  return JSON.stringify(data, null, 2);
}
