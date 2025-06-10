import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { InventoryList } from '../components/InventoryList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

describe('InventoryList', () => {
  // @ts-ignore - We'll fix the type import issue later
  const mockItems = [
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

  const mockOnEditItem = vi.fn();
  const mockOnDeleteItem = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Reset the mock implementations
    mockOnEditItem.mockClear();
    mockOnDeleteItem.mockClear();
  });

  it('should display empty state when no items', () => {
    render(
      <InventoryList 
        items={[]} 
        onEditItem={mockOnEditItem} 
        onDeleteItem={mockOnDeleteItem} 
      />, 
      { wrapper }
    );
    
    expect(screen.getByText(/no items found/i)).toBeTruthy();
  });

  it('should display items', () => {
    render(
      <InventoryList 
        items={mockItems} 
        onEditItem={mockOnEditItem} 
        onDeleteItem={mockOnDeleteItem} 
      />, 
      { wrapper }
    );
    
    expect(screen.getByText('Tent')).toBeInTheDocument();
    expect(screen.getByText('A nice tent')).toBeInTheDocument();
    expect(screen.getByText('camping')).toBeInTheDocument();
  });

  it('should call onEditItem when item is clicked', () => {
    render(
      <InventoryList 
        items={mockItems} 
        onEditItem={mockOnEditItem} 
        onDeleteItem={mockOnDeleteItem} 
      />, 
      { wrapper }
    );
    
    // Click the overlay div that has the click handler
    const itemBox = screen.getByRole('button', { name: 'Edit item' });
    if (itemBox) {
      (itemBox as HTMLElement).click();
    } else {
      throw new Error('Could not find clickable item box');
    }
    
    expect(mockOnEditItem).toHaveBeenCalledWith(mockItems[0]);
  });
});
