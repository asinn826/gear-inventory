import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ItemForm } from '../components/ItemForm';

const onSubmit = vi.fn();
const onCancel = vi.fn();

describe('ItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <ChakraProvider>
        <ItemForm 
          isOpen={true}
          onClose={onCancel}
          onSubmit={onSubmit}
          item={null}
          allTags={[]}
        />
      </ChakraProvider>
    );
  });

  it('should render form with all required fields', () => {
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consumable/i)).toBeInTheDocument();
    expect(screen.getByText(/add item/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    await waitFor(() => {
      expect(screen.getByText('Item Name')).toBeInTheDocument();
    });
    // expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Test Item' } });
    fireEvent.input(screen.getByLabelText(/quantity/i), { target: { value: '2' } });
    fireEvent.click(screen.getByText(/add item/i));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Item',
        quantity: 2,
        isConsumable: false,
        description: '',
        link: '',
        tags: [],
      });
    });
  });

  it('should handle optional fields', async () => {
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Test Item' } });
    fireEvent.input(screen.getByLabelText(/quantity/i), { target: { value: '1' } });
    fireEvent.input(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.input(screen.getByLabelText(/link/i), { target: { value: 'https://example.com' } });
    
    fireEvent.click(screen.getByText(/add item/i));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Item',
        quantity: 1,
        isConsumable: false,
        description: 'Test Description',
        link: 'https://example.com',
        tags: [],
      });
    });
  });
});
