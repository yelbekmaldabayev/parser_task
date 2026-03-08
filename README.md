# Google Search Results Parser

Парсер результатов поиска Google — NodeJS + TypeScript.

## Задание

> Используя NodeJS + TypeScript:
>
> 1. Получить исходник выдачи Google по запросу «get taxi» (сохранить из браузера)
> 2. Используя регулярные выражения извлечь массив ссылок, анкоров и сниппетов, а также ссылку на следующую страницу
> 3. Сохранить результат в CSV
> 4. Добавить колонку, отличающую рекламные результаты от органических

## Структура проекта

```
parser_task/
├── src/
│   ├── types/index.ts              # Типы: ResultType, SearchResult, ParsedData
│   ├── parser/GoogleSearchParser.ts # Парсер (regex)
│   ├── parser/index.ts             # Реэкспорт
│   ├── formatters/index.ts         # toCSV, toJSON
│   ├── utils/index.ts              # escapeCSV, stripHtml
│   ├── constants.ts                # DEFAULT_INPUT, DEFAULT_OUTPUT
│   ├── index.ts                    # Точка входа
│   └── __tests__/parser.test.ts    # Тесты (19 шт.)
├── google_search.html              # Исходник HTML (сохранить из браузера)
├── results.csv                     # Результат (CSV)
├── results.json                    # Результат (JSON)
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Установка

```bash
git clone https://github.com/yelbekmaldabayev/parser_task.git
cd parser_task
npm install
```

## Использование

1. Сохранить страницу результатов Google по запросу «get taxi» из браузера в файл `google_search.html`
2. Запустить парсер:

```bash
npm start
# или с указанием файлов:
npx ts-node src/index.ts my_search.html my_results
```

Парсер создаст `results.csv` и `results.json`.

## Формат CSV

```csv
Type,Link,Anchor,Snippet
ad,https://example.com/ad,Ad Title,Ad description text
organic,https://example.com,Page Title,Page description text
```

Колонка `Type` — `ad` (рекламный) или `organic` (органический). CSV без лишних метаданных — GitHub отображает как таблицу.

## Тестирование

```bash
npm test
npm run test:coverage
```

19 тестов: утилиты (`escapeCSV`, `stripHtml`), парсер (реклама, органика, следующая страница, пустой HTML, дубликаты), форматтеры (CSV, JSON).

## Регулярные выражения

Парсер использует несколько regex-паттернов для обработки разных структур HTML Google:

- **Рекламные блоки**: `id="tads"` / `id="bottomads"` → внутри каждый `<a href>` + `<h3>`
- **Органические результаты**: `<div class="g">` → `<a href>`, `<h3>`, `<div class="VwiC3b">`
- **Альтернативный паттерн**: `yuRUbf` + `LC20lb` + `VwiC3b` (отдельно)
- **Следующая страница**: `id="pnnext"` (оба порядка атрибутов) + `aria-label="Next"`

## Автор

**Yelbek Maldabayev** — [@yelbekmaldabayev](https://github.com/yelbekmaldabayev)
