import React from 'react';
import { Box, VStack, HStack, Text, Wrap, WrapItem, Tag, TagLabel } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';
import { getTagColorScheme } from '../utils/tagColors';

interface TagSidebarProps {
  allItems: GearItem[];
  activeTags: string[];
  onTagToggle: (tag: string | null) => void;
}

export const TagSidebar = ({ allItems, activeTags, onTagToggle }: TagSidebarProps) => {
  const tagCounts = new Map<string, number>();
  allItems.forEach(item => {
    item.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const sortedTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const isAll = activeTags.length === 0;

  return (
    <>
      {/* Mobile: wrapping chips — tap to toggle, no scroll needed */}
      <Box display={{ base: 'block', md: 'none' }}>
        <Wrap spacing={2}>
          <WrapItem>
            <Tag
              cursor="pointer"
              onClick={() => onTagToggle(null)}
              colorScheme={isAll ? 'teal' : 'gray'}
              variant={isAll ? 'solid' : 'outline'}
              size="md"
            >
              <TagLabel>All</TagLabel>
            </Tag>
          </WrapItem>
          {sortedTags.map(tag => {
            const isActive = activeTags.includes(tag);
            return (
              <WrapItem key={tag}>
                <Tag
                  cursor="pointer"
                  onClick={() => onTagToggle(tag)}
                  colorScheme={isActive ? getTagColorScheme(tag) : 'gray'}
                  variant={isActive ? 'solid' : 'outline'}
                  size="md"
                >
                  <TagLabel>{tag} ({tagCounts.get(tag)})</TagLabel>
                </Tag>
              </WrapItem>
            );
          })}
        </Wrap>
      </Box>

      {/* Desktop: vertical list, multiple rows can be active */}
      <Box display={{ base: 'none', md: 'block' }}>
        <VStack align="stretch" spacing={0.5}>
          <Box
            px={3}
            py={2}
            borderRadius="md"
            cursor="pointer"
            bg={isAll ? 'teal.50' : 'transparent'}
            color={isAll ? 'teal.700' : 'gray.700'}
            fontWeight={isAll ? 'semibold' : 'normal'}
            _hover={{ bg: isAll ? 'teal.50' : 'gray.50' }}
            onClick={() => onTagToggle(null)}
            transition="background 0.15s"
          >
            <HStack justify="space-between">
              <Text fontSize="sm">All</Text>
              <Text color="gray.400" fontSize="xs">{allItems.length}</Text>
            </HStack>
          </Box>

          {sortedTags.map(tag => {
            const scheme = getTagColorScheme(tag);
            const isActive = activeTags.includes(tag);
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
                onClick={() => onTagToggle(tag)}
                transition="background 0.15s"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm">{tag}</Text>
                  <HStack spacing={1}>
                    {isActive && <CheckIcon boxSize={2.5} color={`${scheme}.500`} />}
                    <Text color="gray.400" fontSize="xs">{tagCounts.get(tag)}</Text>
                  </HStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </>
  );
};
