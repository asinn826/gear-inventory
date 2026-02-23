import React, { useState, useCallback } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Button,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { GearItem } from './types';
import { InventoryList } from './components/InventoryList';
import { ItemForm } from './components/ItemForm';
import { SearchAndFilter } from './components/SearchAndFilter';
import { TagSidebar } from './components/TagSidebar';
import { useInventory } from './hooks/useInventory';

export const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const {
    items,
    allItems,
    tagGroups,
    addItem,
    updateItem,
    deleteItem,
    searchQuery,
    setSearchQuery,
    setSelectedTags,
    sortConfig,
    setSortConfig,
    getAllTags,
  } = useInventory();

  const handleTagSelect = useCallback((tag: string | null) => {
    setActiveTag(tag);
    setSelectedTags(tag ? [tag] : []);
  }, [setSelectedTags]);

  const handleEditItem = (item: GearItem) => {
    setEditingItem(item);
    onOpen();
  };

  const handleSubmit = (itemData: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingItem) {
        updateItem(editingItem.id, itemData);
      } else {
        addItem(itemData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        {/* Top bar */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={3} px={{ base: 4, md: 6 }}>
          <Container maxW="container.xl" px={0}>
            {/* Row 1: title + add button (always) + search+sort on desktop */}
            <Flex align="center" gap={3}>
              <Heading as="h1" size="md" color="teal.600" flexShrink={0} whiteSpace="nowrap">
                Camping Gear
              </Heading>
              <Box flex="1" display={{ base: 'none', md: 'block' }}>
                <SearchAndFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortConfig={sortConfig}
                  onSortChange={(key, direction) => setSortConfig({ key, direction })}
                />
              </Box>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                flexShrink={0}
                size="sm"
                onClick={() => { setEditingItem(null); onOpen(); }}
              >
                Add Item
              </Button>
            </Flex>
            {/* Row 2: search + sort on mobile only */}
            <Box display={{ base: 'block', md: 'none' }} mt={2}>
              <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortConfig={sortConfig}
                onSortChange={(key, direction) => setSortConfig({ key, direction })}
              />
            </Box>
          </Container>
        </Box>

        {/* Body */}
        <Container maxW="container.xl" py={{ base: 4, md: 6 }} px={{ base: 3, md: 6 }}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="flex-start">
            {/* Sidebar (desktop: sticky left column; mobile: horizontal chips above grid) */}
            <Box
              w={{ base: 'full', md: '180px' }}
              flexShrink={0}
              position={{ md: 'sticky' }}
              top={{ md: '1rem' }}
            >
              <TagSidebar
                allItems={allItems}
                activeTag={activeTag}
                onTagSelect={handleTagSelect}
              />
            </Box>

            {/* Main content grid */}
            <Box flex="1" minW={0}>
              <InventoryList
                items={items}
                tagGroups={tagGroups}
                activeTag={activeTag}
                onEditItem={handleEditItem}
                onDeleteItem={deleteItem}
              />
            </Box>
          </Flex>
        </Container>

        <ItemForm
          isOpen={isOpen}
          onClose={() => { onClose(); setEditingItem(null); }}
          item={editingItem}
          onSubmit={handleSubmit}
          allTags={getAllTags()}
        />
      </Box>
    </ChakraProvider>
  );
};

export default App;
