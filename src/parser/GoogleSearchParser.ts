import { ParsedData, SearchResult, ResultType } from "../types";
import { stripHtml } from "../utils";

/**
 * Парсер результатов поиска Google.
 * Извлекает ссылки, анкоры, сниппеты и ссылку на следующую страницу
 * с помощью регулярных выражений.
 */
export class GoogleSearchParser {
  private html: string;

  constructor(html: string) {
    this.html = html;
  }

  /**
   * Парсинг HTML и извлечение всех результатов
   */
  public parse(): ParsedData {
    const results = [...this.extractAds(), ...this.extractOrganic()];
    const nextPageLink = this.extractNextPageLink();

    return { results, nextPageLink };
  }

  /**
   * Извлечение рекламных результатов.
   * Рекламные блоки в Google обёрнуты в div с id="tads" (top ads) или id="bottomads".
   */
  private extractAds(): SearchResult[] {
    const results: SearchResult[] = [];

    // Ищем весь блок рекламы (#tads / #bottomads)
    const adContainerRegex =
      /<div[^>]*id="(tads|bottomads)"[^>]*>([\s\S]*?)(?=<\/div>\s*<!--|<div id="search"|<div id="res"|$)/gi;
    let containerMatch: RegExpExecArray | null;

    while ((containerMatch = adContainerRegex.exec(this.html)) !== null) {
      const container = containerMatch[2] ?? "";

      // Внутри контейнера ищем каждый результат по <a href> + <h3>
      const adItemRegex =
        /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
      let itemMatch: RegExpExecArray | null;

      while ((itemMatch = adItemRegex.exec(container)) !== null) {
        const link = itemMatch[1]?.trim() ?? "";
        const anchor = stripHtml(itemMatch[2] ?? "");

        if (link && anchor && !results.some((r) => r.link === link)) {
          // Сниппет — ищем VwiC3b после текущей позиции
          const snippetSearch = container.substring(itemMatch.index);
          const snippetMatch = snippetSearch.match(
            /<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
          );
          const snippet = stripHtml(snippetMatch?.[1] ?? "");

          results.push({ type: "ad", link, anchor, snippet });
        }
      }
    }

    return results;
  }

  /**
   * Извлечение органических результатов.
   * Органические результаты — блоки <div class="g"> с ссылками внутри.
   */
  private extractOrganic(): SearchResult[] {
    const results: SearchResult[] = [];

    // Ищем каждый блок <div class="g" ...> ... </div></div></div>
    // Используем greedy match до закрывающих </div>, чтобы захватить и VwiC3b
    const blockRegex =
      /<div class="g"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;

    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(this.html)) !== null) {
      const block = match[0] ?? "";
      this.extractResultsFromBlock(block, "organic", results);
    }

    // Альтернативный паттерн: yuRUbf + VwiC3b (отдельно)
    if (results.length === 0) {
      this.extractResultsSeparatePatterns(results);
    }

    return results;
  }

  /**
   * Извлечение результата из одного блока HTML
   */
  private extractResultsFromBlock(
    block: string,
    type: ResultType,
    results: SearchResult[],
  ): void {
    // Ссылка
    const linkMatch = block.match(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/i);
    // Анкор (заголовок) — ищем в <h3>
    const anchorMatch = block.match(/<h3[^>]*>(.*?)<\/h3>/is);
    // Сниппет — ищем в <div class="VwiC3b"> или в <span class="...">
    const snippetMatch =
      block.match(/<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>(.*?)<\/div>/is) ??
      block.match(/<span[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>(.*?)<\/span>/is);

    const link = linkMatch?.[1]?.trim() ?? "";
    const anchor = stripHtml(anchorMatch?.[1] ?? "");
    const snippet = stripHtml(snippetMatch?.[1] ?? "");

    if (link && anchor) {
      // Не добавляем дубли
      if (!results.some((r) => r.link === link)) {
        results.push({ type, link, anchor, snippet });
      }
    }
  }

  /**
   * Альтернативный способ: отдельно ссылки, анкоры и сниппеты
   */
  private extractResultsSeparatePatterns(results: SearchResult[]): void {
    const linkRegex =
      /<div[^>]*class="[^"]*yuRUbf[^"]*"[^>]*>\s*<a[^>]*href="(https?:\/\/[^"]+)"/gi;
    const anchorRegex = /<h3[^>]*class="[^"]*LC20lb[^"]*"[^>]*>(.*?)<\/h3>/gis;
    const snippetRegex =
      /<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>(.*?)<\/div>/gis;

    const links: string[] = [];
    const anchors: string[] = [];
    const snippets: string[] = [];

    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(this.html)) !== null) {
      if (m[1]) links.push(m[1].trim());
    }
    while ((m = anchorRegex.exec(this.html)) !== null) {
      if (m[1]) anchors.push(stripHtml(m[1]));
    }
    while ((m = snippetRegex.exec(this.html)) !== null) {
      if (m[1]) snippets.push(stripHtml(m[1]));
    }

    const len = Math.min(links.length, anchors.length);
    for (let i = 0; i < len; i++) {
      const link = links[i]!;
      const anchor = anchors[i]!;
      const snippet = snippets[i] ?? "";
      if (link && anchor) {
        results.push({ type: "organic", link, anchor, snippet });
      }
    }
  }

  /**
   * Извлечение ссылки на следующую страницу результатов
   */
  private extractNextPageLink(): string | null {
    // Паттерн 1: id="pnnext" href="..."
    const pattern1 = /<a[^>]*id="pnnext"[^>]*href="([^"]+)"/i;
    const m1 = pattern1.exec(this.html);
    if (m1?.[1]) return this.normalizeUrl(m1[1]);

    // Паттерн 2: href="..." id="pnnext"
    const pattern2 = /<a[^>]*href="([^"]+)"[^>]*id="pnnext"/i;
    const m2 = pattern2.exec(this.html);
    if (m2?.[1]) return this.normalizeUrl(m2[1]);

    // Паттерн 3: aria-label="Next" или текст "Next"
    const pattern3 = /<a[^>]*href="([^"]+)"[^>]*aria-label="Next"/i;
    const m3 = pattern3.exec(this.html);
    if (m3?.[1]) return this.normalizeUrl(m3[1]);

    return null;
  }

  private normalizeUrl(url: string): string {
    const decoded = url.replace(/&amp;/g, "&");
    if (decoded.startsWith("/")) {
      return "https://www.google.com" + decoded;
    }
    return decoded;
  }
}
