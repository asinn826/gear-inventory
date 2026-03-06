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

export interface AuditLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, { before: unknown; after: unknown }> | null;
  ipAddress: string | null;
  userAgent: string | null;
  city: string | null;
  country: string | null;
  timestamp: string;
}
