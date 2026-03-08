/**
 * Типы для парсера результатов поиска Google
 */

/** Тип результата: рекламный или органический */
export type ResultType = "ad" | "organic";

/** Один результат поиска */
export interface SearchResult {
  /** Тип: ad (рекламный) или organic (органический) */
  type: ResultType;
  /** URL ссылки */
  link: string;
  /** Текст заголовка (анкор) */
  anchor: string;
  /** Сниппет — описание */
  snippet: string;
}

/** Результат парсинга */
export interface ParsedData {
  /** Массив результатов */
  results: SearchResult[];
  /** Ссылка на следующую страницу */
  nextPageLink: string | null;
}
