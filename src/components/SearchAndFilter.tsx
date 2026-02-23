import React, { useCallback } from 'react';
import { HStack, Input, Select, Box, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: { key: keyof GearItem; direction: 'asc' | 'desc' };
  onSortChange: (key: keyof GearItem, direction: 'asc' | 'desc') => void;
  [key: string]: any;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
  ...props
}: SearchAndFilterProps) => {
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('_') as [keyof GearItem, 'asc' | 'desc'];
    onSortChange(key, direction);
  }, [onSortChange]);

  const sortOptions = [
    { value: 'updatedAt_desc', label: 'Recently Updated' },
    { value: 'createdAt_desc', label: 'Recently Added' },
    { value: 'name_asc', label: 'Name (A–Z)' },
    { value: 'name_desc', label: 'Name (Z–A)' },
    { value: 'quantity_asc', label: 'Qty: Low → High' },
    { value: 'quantity_desc', label: 'Qty: High → Low' },
  ];

  return (
    <HStack spacing={3} {...props}>
      <Box flex="1" position="relative">
        <Input
          placeholder="Search items…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          bg="white"
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
            zIndex={1}
            _hover={{ bg: 'transparent' }}
          />
        )}
      </Box>
      <Box flexShrink={0}>
        <Select
          value={`${sortConfig.key}_${sortConfig.direction}`}
          onChange={handleSortChange}
          bg="white"
          minW="170px"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Box>
    </HStack>
  );
};
