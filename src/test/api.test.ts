import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchItems, fetchTags } from '../utils/api';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API Tests', () => {
  describe('GET /api/items', () => {
    it('should return a list of items', async () => {
      const mockItems = [
        { 
          id: '1', 
          name: 'Tent', 
          quantity: 1, 
          isConsumable: false, 
          tags: ['camping'], 
          createdAt: '2023-01-01', 
          updatedAt: '2023-01-01' 
        },
        { 
          id: '2', 
          name: 'Sleeping Bag', 
          quantity: 2, 
          isConsumable: false, 
          tags: ['sleep'], 
          createdAt: '2023-01-01', 
          updatedAt: '2023-01-01' 
        },
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      });

      const items = await fetchItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/items');
    });

    it('should throw an error when fetch fails', async () => {
      // Test network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(fetchItems()).rejects.toThrow('Network error');
      
      // Test non-OK response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });
      await expect(fetchItems()).rejects.toThrow('Failed to fetch items');
    });
  });

  describe('GET /api/tags', () => {
    it('should return a list of unique tags', async () => {
      const mockTags = ['camping', 'sleep'];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTags,
      });

      const tags = await fetchTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags).toEqual(mockTags);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tags');
    });

    it('should throw an error when fetch fails', async () => {
      // Test network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(fetchTags()).rejects.toThrow('Network error');
      
      // Test non-OK response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });
      await expect(fetchTags()).rejects.toThrow('Failed to fetch tags');
    });
  });
});
