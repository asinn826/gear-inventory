import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { GearItem } from '../types';

describe('SearchAndFilter', () => {
  const onSearchChange = vi.fn();
  const onTagsChange = vi.fn();
  const onSortChange = vi.fn();
  const onResetFilters = vi.fn();
  
  const allTags = ['car camping', 'hiking', 'cooking'];
  const selectedTags = ['car camping'];
  const sortConfig = { key: 'name' as const, direction: 'asc' as const };

  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <ChakraProvider>
        <SearchAndFilter 
          searchQuery="" 
          onSearchChange={onSearchChange} 
          allTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
          sortConfig={sortConfig}
          onSortChange={onSortChange}
          onResetFilters={onResetFilters}
        />
      </ChakraProvider>
    );
  });

  it('should render search input', () => {
    expect(screen.getByPlaceholderText(/search items/i)).toBeInTheDocument();
  });

  it('should call onSearchChange when search input changes', () => {
    const searchInput = screen.getByPlaceholderText(/search items/i);
    fireEvent.change(searchInput, { target: { value: 'tent' } });
    expect(onSearchChange).toHaveBeenCalledWith('tent');
  });

  it('should show selected tags as checked', () => {
    const campingCheckbox = screen.getByLabelText('car camping') as HTMLInputElement;
    expect(campingCheckbox.checked).toBe(true);
    
    const hikingCheckbox = screen.getByLabelText('hiking') as HTMLInputElement;
    expect(hikingCheckbox.checked).toBe(false);
  });

  it('should call onTagToggle when a tag is toggled', () => {
    const hikingCheckbox = screen.getByLabelText('hiking');
    fireEvent.click(hikingCheckbox);
    expect(onTagsChange).toHaveBeenCalledWith([...selectedTags, 'hiking']);
  });
});
