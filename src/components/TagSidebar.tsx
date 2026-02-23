import React from 'react';
import { Box, VStack, HStack, Text, Tag, TagLabel } from '@chakra-ui/react';
import { GearItem } from '../types';
import { getTagColorScheme } from '../utils/tagColors';

interface TagSidebarProps {
  allItems: GearItem[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export const TagSidebar = ({ allItems, activeTag, onTagSelect }: TagSidebarProps) => {
  const tagCounts = new Map<string, number>();
  allItems.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const sortedTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return (
    <>
      {/* Mobile: horizontal scrollable chip row */}
      <Box display={{ base: 'block', md: 'none' }} overflowX="auto" pb={2}>
        <HStack spacing={2} minW="max-content" px={1}>
          <Tag
            cursor="pointer"
            onClick={() => onTagSelect(null)}
            colorScheme={activeTag === null ? 'teal' : 'gray'}
            variant={activeTag === null ? 'solid' : 'outline'}
            size="md"
          >
            <TagLabel>All ({allItems.length})</TagLabel>
          </Tag>
          {sortedTags.map(tag => (
            <Tag
              key={tag}
              cursor="pointer"
              onClick={() => onTagSelect(tag)}
              colorScheme={activeTag === tag ? getTagColorScheme(tag) : 'gray'}
              variant={activeTag === tag ? 'solid' : 'outline'}
              size="md"
            >
              <TagLabel>{tag} ({tagCounts.get(tag)})</TagLabel>
            </Tag>
          ))}
        </HStack>
      </Box>

      {/* Desktop: vertical list */}
      <Box display={{ base: 'none', md: 'block' }}>
        <VStack align="stretch" spacing={0.5}>
          <Box
            px={3}
            py={2}
            borderRadius="md"
            cursor="pointer"
            bg={activeTag === null ? 'teal.50' : 'transparent'}
            color={activeTag === null ? 'teal.700' : 'gray.700'}
            fontWeight={activeTag === null ? 'semibold' : 'normal'}
            _hover={{ bg: activeTag === null ? 'teal.50' : 'gray.50' }}
            onClick={() => onTagSelect(null)}
            transition="background 0.15s"
          >
            <HStack justify="space-between">
              <Text fontSize="sm">All</Text>
              <Text color="gray.400" fontSize="xs">{allItems.length}</Text>
            </HStack>
          </Box>

          {sortedTags.map(tag => {
            const scheme = getTagColorScheme(tag);
            const isActive = activeTag === tag;
            return (
              <Box
                key={tag}
                px={3}
                py={2}
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? `${scheme}.50` : 'transparent'}
                color={isActive ? `${scheme}.700` : 'gray.700'}
                fontWeight={isActive ? 'semibold' : 'normal'}
                _hover={{ bg: isActive ? `${scheme}.50` : 'gray.50' }}
                onClick={() => onTagSelect(tag)}
                transition="background 0.15s"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm">{tag}</Text>
                  <Text color="gray.400" fontSize="xs">{tagCounts.get(tag)}</Text>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </>
  );
};
