const suggestionRules: Record<string, string[]> = {
  pasta: ['salsa de tomate', 'queso parmesano', 'albahaca'],
  cereal: ['leche', 'yogurt'],
  pan: ['mantequilla', 'mermelada', 'jamón'],
  arroz: ['frijoles', 'pollo'],
  café: ['azúcar', 'leche'],
  té: ['miel', 'limón'],
  huevos: ['tocino', 'pan'],
  carne: ['especias', 'vegetales'],
  pollo: ['arroz', 'vegetales'],
  pescado: ['limón', 'ajo'],
  ensalada: ['aderezo', 'tomate', 'pepino'],
  pizza: ['refresco', 'cerveza'],
  helado: ['galletas', 'frutas'],
};

export function getSuggestions(items: string[]): string[] {
  const suggestions = new Set<string>();

  for (const item of items) {
    const itemLower = item.toLowerCase().trim();

    for (const [key, values] of Object.entries(suggestionRules)) {
      if (itemLower.includes(key)) {
        values.forEach((v) => suggestions.add(v));
      }
    }
  }

  const existingItems = new Set(items.map((i) => i.toLowerCase().trim()));
  return Array.from(suggestions).filter((s) => !existingItems.has(s));
}
