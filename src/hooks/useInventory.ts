import { useState, useEffect, useCallback, useMemo } from 'react';
import { GearItem, SortConfig } from '../types';
import * as api from '../utils/api';

interface UseInventoryReturn {
  items: GearItem[];
  allItems: GearItem[];
  tagGroups: Map<string, GearItem[]>;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  addItem: (item: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GearItem>;
  updateItem: (id: string, updates: Partial<GearItem>) => Promise<GearItem | undefined>;
  deleteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
  getAllTags: () => string[];
  getFilteredAndSortedItems: () => GearItem[];
}

export const useInventory = (): UseInventoryReturn => {
  const [items, setItems] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });

  // Load items from the API
  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchItems();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError(err instanceof Error ? err : new Error('Failed to load items'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  
  const addItem = useCallback(async (itemData: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Ensure required fields are present and properly typed
      const newItem = await api.createItem({
        ...itemData,
        link: itemData.link || null, // Allow null for optional link
      });
      setItems(prevItems => [newItem, ...prevItems]);
      return newItem;
    } catch (err) {
      console.error('Failed to add item:', err);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<GearItem>) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      // Handle the link field - if it's undefined in updates, use the current value
      const updateData = {
        ...updates,
        link: updates.link !== undefined ? (updates.link || null) : currentItem.link
      };

      const updatedItem = await api.updateItem(id, {
        ...currentItem,
        ...updateData
      });

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? updatedItem : item
        )
      );

      return updatedItem;
    } catch (err) {
      console.error('Failed to update item:', err);
      throw err;
    }
  }, [items]);

  const deleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      // Optimistically remove the item
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Delete from the database
      await api.deleteItem(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
      // Revert if the API call fails
      setItems(prevItems => [...prevItems, itemToDelete]);
      throw err;
    }
  }, [items]);

  // Get all unique tags from items
  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [items]);

  // Filter and sort items
  const getFilteredAndSortedItems = useCallback((): GearItem[] => {
    return [...items]
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
      .filter(item => 
        selectedTags.length === 0 || 
        selectedTags.every(tag => item.tags.includes(tag))
      )
      .sort((a, b) => {
        if (sortConfig.key === 'name' || sortConfig.key === 'description' || sortConfig.key === 'link') {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          return sortConfig.direction === 'asc' 
            ? String(aValue || '').localeCompare(String(bValue || ''))
            : String(bValue || '').localeCompare(String(aValue || ''));
        } else if (sortConfig.key === 'quantity') {
          return sortConfig.direction === 'asc' 
            ? a.quantity - b.quantity 
            : b.quantity - a.quantity;
        } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          return sortConfig.direction === 'asc'
            ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
            : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
        } else {
          return 0;
        }
      });
  }, [items, searchQuery, selectedTags, sortConfig]);

  // Group items by first tag for the "All" view (search-filtered, no tag filter)
  const tagGroups = useMemo((): Map<string, GearItem[]> => {
    const filtered = [...items]
      .filter(item =>
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortConfig.key === 'name' || sortConfig.key === 'description' || sortConfig.key === 'link') {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        } else if (sortConfig.key === 'quantity') {
          return sortConfig.direction === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
        } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          return sortConfig.direction === 'asc'
            ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
            : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
        }
        return 0;
      });

    const groupMap = new Map<string, GearItem[]>();
    for (const item of filtered) {
      const key = item.tags.length > 0 ? item.tags[0] : 'Untagged';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }

    const sortedEntries = [...groupMap.entries()].sort(([a], [b]) => {
      if (a === 'Untagged') return 1;
      if (b === 'Untagged') return -1;
      return a.localeCompare(b);
    });

    return new Map(sortedEntries);
  }, [items, searchQuery, sortConfig]);

  const sortedItems = useMemo(() => getFilteredAndSortedItems(), [getFilteredAndSortedItems]);

  return {
    items: sortedItems,
    allItems: items,
    tagGroups,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    sortConfig,
    setSortConfig,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems,
    getAllTags,
    getFilteredAndSortedItems,
  };
};
