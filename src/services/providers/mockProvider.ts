import { Provider, StoreItem } from './Provider.js';

export class MockProvider implements Provider {
  name = 'mock';

  async search(query: string, zip?: string): Promise<StoreItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const basePrice = query.length * 0.5 + (zip ? parseInt(zip.slice(-2), 10) / 100 : 1);

    return [
      {
        name: query,
        price: parseFloat((basePrice * 1.2).toFixed(2)),
        unit: 'unit',
        store: 'Mock Store A',
        availability: 'in_stock',
      },
      {
        name: query,
        price: parseFloat((basePrice * 0.9).toFixed(2)),
        unit: 'unit',
        store: 'Mock Store B',
        availability: 'in_stock',
      },
      {
        name: query,
        price: parseFloat((basePrice * 1.5).toFixed(2)),
        unit: 'unit',
        store: 'Mock Store C',
        availability: 'limited',
      },
    ];
  }
}
