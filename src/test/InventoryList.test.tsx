import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { InventoryList } from '../components/InventoryList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GearItem } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <ChakraProvider>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </ChakraProvider>
);

const mockItems: GearItem[] = [
  {
    id: '1',
    name: 'Tent',
    description: 'A nice tent',
    quantity: 1,
    isConsumable: false,
    link: null,
    tags: ['camping'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const emptyTagGroups = new Map<string, GearItem[]>();

const buildTagGroups = (items: GearItem[]): Map<string, GearItem[]> => {
  const map = new Map<string, GearItem[]>();
  for (const item of items) {
    const key = item.tags.length > 0 ? item.tags[0] : 'Untagged';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
};

describe('InventoryList', () => {
  const mockOnEditItem = vi.fn();
  const mockOnDeleteItem = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when no items', () => {
    render(
      <InventoryList
        items={[]}
        tagGroups={emptyTagGroups}
        activeTag={null}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />,
      { wrapper }
    );

    expect(screen.getByText(/no items found/i)).toBeTruthy();
  });

  it('should display items in grouped view', () => {
    render(
      <InventoryList
        items={mockItems}
        tagGroups={buildTagGroups(mockItems)}
        activeTag={null}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />,
      { wrapper }
    );

    expect(screen.getByText('Tent')).toBeInTheDocument();
    expect(screen.getByText('A nice tent')).toBeInTheDocument();
    expect(screen.getByText('camping')).toBeInTheDocument();
  });

  it('should display items in single-tag view', () => {
    render(
      <InventoryList
        items={mockItems}
        tagGroups={buildTagGroups(mockItems)}
        activeTag="camping"
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />,
      { wrapper }
    );

    expect(screen.getByText('Tent')).toBeInTheDocument();
  });

  it('should call onEditItem when edit button is clicked', () => {
    render(
      <InventoryList
        items={mockItems}
        tagGroups={buildTagGroups(mockItems)}
        activeTag={null}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />,
      { wrapper }
    );

    const editButton = screen.getByRole('button', { name: 'Edit item' });
    (editButton as HTMLElement).click();

    expect(mockOnEditItem).toHaveBeenCalledWith(mockItems[0]);
  });
});
