import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInventory } from '../hooks/useInventory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useInventory', () => {
  const mockItems = [
    {
      id: '1',
      name: 'Tent',
      quantity: 1,
      isConsumable: false,
      tags: ['camping'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.endsWith('/items')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems),
        });
      }
      if (url.endsWith('/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['camping']),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should fetch items on mount', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.items).toEqual(mockItems);
  });

  it('should handle errors when fetching items', async () => {
    // Test network error
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.endsWith('/items')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
    
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Network error');
    });
    
    // Test API error
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.endsWith('/items')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
    
    const { result: result2 } = renderHook(() => useInventory(), { wrapper });
    
    await waitFor(() => {
      expect(result2.current.error).not.toBeNull();
      expect(result2.current.error?.message).toContain('Failed to fetch items');
    });
  });

  it('should provide methods for CRUD operations', () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    expect(typeof result.current.addItem).toBe('function');
    expect(typeof result.current.updateItem).toBe('function');
    expect(typeof result.current.deleteItem).toBe('function');
  });
});
