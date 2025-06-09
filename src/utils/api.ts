// Base URL for API requests
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api' // Local development
  : '/.netlify/functions/api';  // Production on Netlify

// Interface for gear items

export interface GearItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  isConsumable: boolean;
  link?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const fetchItems = async (): Promise<GearItem[]> => {
  const response = await fetch(`${API_BASE_URL}/items`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
};

export const fetchTags = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/tags`);
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
};

export const createItem = async (item: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GearItem> => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create item');
  }
  
  return response.json();
};

export const updateItem = async (id: string, item: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GearItem> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update item');
  }
  
  return response.json();
};

export const deleteItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete item');
  }
};
