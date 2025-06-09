export interface GearItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  isConsumable: boolean;
  link?: string | null;  // Optional product link
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  items: GearItem[];
  searchQuery: string;
  selectedTags: string[];
  sortConfig: {
    key: keyof GearItem;
    direction: 'asc' | 'desc';
  };
}

export type SortConfig = AppState['sortConfig'];

export type GearItemInput = Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>;
