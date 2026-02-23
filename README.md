# parser_task

Google Search Results Parser using NodeJS + TypeScript

## Задание / Task

Используя NodeJS + TypeScript выполнить следующее задание:

1. Получить исходник выдачи гугла по запросу "get taxi" (исходник сохранен из браузера)
2. Используя регулярные выражения получить массив ссылок, анкоров и сниппетов, а также ссылку на следующую страницу результатов
3. Сохранить результат в CSV

## Установка / Installation

```bash
npm install
```

## Использование / Usage

Запуск парсера с файлом по умолчанию:

```bash
npm start
```

Или с указанием конкретных файлов:

```bash
npm run parse
# или
npx ts-node parser.ts <input_html_file> <output_csv_file>
```

## Файлы проекта / Project Files

- `parser.ts` - основной код парсера / main parser code
- `google_search.html` - исходник страницы Google / saved Google search page source
- `results.csv` - результат парсинга в CSV формате / parsing results in CSV format

## Как это работает / How It Works

1. Читает HTML файл с результатами поиска Google
2. Использует регулярные выражения для извлечения:
   - Ссылок (URLs)
   - Анкоров (заголовков ссылок)
   - Сниппетов (описаний)
   - Ссылки на следующую страницу
3. Сохраняет результаты в CSV файл

## Пример вывода / Example Output

```
Found 10 search results:
-------------------------------------------
1. Gett - The Official Website | Book a Taxi Online
   Link: https://gett.com/uk/
   Snippet: Gett is a global on-demand mobility company...
...
Next Page Link: https://www.google.com/search?q=get+taxi&start=10&sa=N
```
