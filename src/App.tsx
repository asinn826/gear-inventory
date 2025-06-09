import React, { useState, useMemo, useCallback } from 'react';
import { ChakraProvider, Box, Container, Heading, Button, useDisclosure } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { GearItem } from './types';
import { InventoryList } from './components/InventoryList';
import { ItemForm } from './components/ItemForm';
import { SearchAndFilter } from './components/SearchAndFilter';
import { useInventory } from './hooks/useInventory';

export const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const { 
    items, 
    addItem, 
    updateItem, 
    deleteItem,
    searchQuery, 
    setSearchQuery, 
    selectedTags, 
    setSelectedTags, 
    sortConfig, 
    setSortConfig, 
    getAllTags,
    getFilteredAndSortedItems 
  } = useInventory();
  
  const filteredItems = useMemo(() => getFilteredAndSortedItems(), [
    getFilteredAndSortedItems
  ]);
  
  const allTags = useMemo(() => {
    return getAllTags();
  }, [getAllTags]);
  
  const handleSortChange = useCallback((key: keyof GearItem, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  }, [setSortConfig]);
  
  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, [setSelectedTags]);
  
  const handleSortConfigChange = useCallback((key: keyof GearItem, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  }, [setSortConfig]);
  
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, [setSearchQuery, setSelectedTags]);

  const handleEditItem = (item: GearItem) => {
    setEditingItem(item);
    onOpen();
  };

  const handleSubmit = (itemData: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingItem) {
        // For updates, preserve the existing ID and timestamps
        updateItem(editingItem.id, itemData);
      } else {
        // For new items, let the addItem function handle ID and timestamps
        addItem(itemData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="container.xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
            <Heading as="h1" size="xl" color="teal.600">
              Camping Gear Inventory
            </Heading>
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="teal"
              onClick={() => {
                setEditingItem(null);
                onOpen();
              }}
            >
              Add Item
            </Button>
          </Box>
          
          <SearchAndFilter 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            sortConfig={sortConfig}
            onSortChange={handleSortConfigChange}
            onResetFilters={handleResetFilters}
            allTags={allTags}
            mb={6} 
          />
          
          <InventoryList 
            items={filteredItems}
            onEditItem={handleEditItem}
            onDeleteItem={deleteItem}
          />
          
          <ItemForm 
            isOpen={isOpen} 
            onClose={() => {
              onClose();
              setEditingItem(null);
            }} 
            item={editingItem}
            onSubmit={handleSubmit}
            allTags={allTags}
          />
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App;
