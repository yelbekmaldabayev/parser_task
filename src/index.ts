import * as fs from "fs";
import * as path from "path";

import { GoogleSearchParser } from "./parser/GoogleSearchParser";
import { toCSV } from "./formatters";
import { DEFAULT_INPUT, DEFAULT_OUTPUT } from "./constants";

function main(): void {
  const inputFile = process.argv[2] ?? DEFAULT_INPUT;
  const outputFile = process.argv[3] ?? DEFAULT_OUTPUT;

  const inputPath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`Файл не найден: ${inputPath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf-8");
  console.log(`Прочитано ${html.length.toLocaleString()} байт из ${inputFile}`);

  const parser = new GoogleSearchParser(html);
  const data = parser.parse();

  console.log(`Найдено результатов: ${data.results.length}`);
  console.log(
    `  - рекламных: ${data.results.filter((r) => r.type === "ad").length}`,
  );
  console.log(
    `  - органических: ${data.results.filter((r) => r.type === "organic").length}`,
  );
  console.log(`Следующая страница: ${data.nextPageLink ?? "не найдена"}`);

  // Сохраняем CSV
  const csvPath = path.resolve(process.cwd(), outputFile + ".csv");
  fs.writeFileSync(csvPath, toCSV(data), "utf-8");
  console.log(`\nCSV сохранён: ${csvPath}`);

  // Сохраняем JSON
  const jsonPath = path.resolve(process.cwd(), outputFile + ".json");
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`JSON сохранён: ${jsonPath}`);
}

main();
