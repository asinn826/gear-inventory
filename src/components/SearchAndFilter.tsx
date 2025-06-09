import React, { useCallback } from 'react';
import { HStack, Input, Select, Box, Button, Menu, MenuButton, MenuList, MenuItem, Checkbox, VStack, Text, IconButton, Tooltip, Tag, TagLabel } from '@chakra-ui/react';
import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { getTagColorScheme } from '../utils/tagColors';
import { GearItem } from '../types';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  sortConfig: { key: keyof GearItem; direction: 'asc' | 'desc' };
  onSortChange: (key: keyof GearItem, direction: 'asc' | 'desc') => void;
  onResetFilters: () => void;
  allTags: string[];
  [key: string]: any;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  sortConfig,
  onSortChange,
  onResetFilters,
  allTags,
  ...props
}: SearchAndFilterProps) => {
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('_') as [keyof GearItem, 'asc' | 'desc'];
    onSortChange(key, direction);
  }, [onSortChange]);
  
  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'quantity_asc', label: 'Quantity (Low to High)' },
    { value: 'quantity_desc', label: 'Quantity (High to Low)' },
    { value: 'updatedAt_desc', label: 'Recently Updated' },
    { value: 'createdAt_desc', label: 'Recently Added' },
  ];

  const handleTagToggle = useCallback((tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newSelectedTags);
  }, [selectedTags, onTagsChange]);

  return (
    <VStack align="stretch" spacing={2} {...props}>
      <HStack spacing={4}>
        <Box flex="1" position="relative">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            pr="2.5rem"
          />
          {searchQuery && (
            <IconButton
              aria-label="Clear search"
              icon={<CloseIcon />}
              size="xs"
              position="absolute"
              right="0.5rem"
              top="50%"
              transform="translateY(-50%)"
              onClick={() => onSearchChange('')}
              variant="ghost"
              _hover={{ bg: 'transparent' }}
            />
          )}
        </Box>
        {(searchQuery || selectedTags.length > 0) && (
          <Button
            variant="outline"
            size="md"
            leftIcon={<CloseIcon />}
            onClick={onResetFilters}
          >
            Clear Filters
          </Button>
        )}
      </HStack>
      
      {selectedTags.length > 0 && (
        <HStack spacing={1} wrap="wrap">
          {selectedTags.map(tag => (
            <Tag 
              key={tag} 
              size="sm"
              colorScheme={getTagColorScheme(tag)}
              variant="subtle"
              borderRadius="full"
              px={2}
              py={1}
            >
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
        </HStack>
      )}
      
      <HStack spacing={4} mt={2}>
        <Box minW="200px">
          <Menu closeOnSelect={false}>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              size="md"
              width="100%"
            >
              {selectedTags.length > 0 ? `${selectedTags.length} selected` : 'Filter by tag'}
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto" p={2}>
              {allTags.length > 0 ? (
                allTags.map(tag => (
                  <MenuItem key={tag} closeOnSelect={false}>
                    <Checkbox
                      isChecked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      width="100%"
                      py={1}
                    >
                      {tag}
                    </Checkbox>
                  </MenuItem>
                ))
              ) : (
                <Text px={3} py={1} color="gray.500">No tags available</Text>
              )}
            </MenuList>
          </Menu>
        </Box>

        <Box minW="200px">
          <Select
            value={`${sortConfig.key}_${sortConfig.direction}`}
            onChange={handleSortChange}
            variant="outline"
            size="md"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>
      </HStack>
    </VStack>
  );
};
