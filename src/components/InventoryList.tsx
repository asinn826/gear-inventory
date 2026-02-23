import React from 'react';
import {
  SimpleGrid,
  Text,
  Box,
  HStack,
  Tag,
  TagLabel,
  IconButton,
  Badge,
  Heading,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';
import { getTagColorScheme } from '../utils/tagColors';

interface InventoryListProps {
  items: GearItem[];
  tagGroups: Map<string, GearItem[]>;
  activeTag: string | null;
  onEditItem: (item: GearItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
}

interface ItemCardProps {
  item: GearItem;
  onEdit: () => void;
  onDelete: () => void;
}

const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => (
  <Box
    role="group"
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    p={4}
    display="flex"
    flexDirection="column"
    _hover={{ boxShadow: 'md', borderColor: 'gray.300' }}
    transition="all 0.2s"
  >
    {/* Name row */}
    <HStack justify="space-between" align="flex-start" mb={2}>
      <Text fontWeight="bold" fontSize="md" flex="1" lineHeight="short">
        {item.name}
      </Text>
      <HStack spacing={1} flexShrink={0} ml={2}>
        {item.isConsumable && (
          <Text fontSize="sm" title="Consumable">🔥</Text>
        )}
        <Badge
          colorScheme={item.isConsumable && item.quantity < 3 ? 'red' : 'teal'}
          variant="subtle"
          fontSize="xs"
        >
          ×{item.quantity}
        </Badge>
      </HStack>
    </HStack>

    {/* Description */}
    {item.description && (
      <Text color="gray.600" fontSize="sm" noOfLines={2} mb={3} flex="1">
        {item.description}
      </Text>
    )}

    {/* Footer: tags + link (left) / edit+delete (right) */}
    <HStack justify="space-between" align="flex-end" mt="auto" pt={2}>
      <HStack spacing={1} flexWrap="wrap" flex="1" minW={0}>
        {item.tags.map(tag => (
          <Tag
            key={tag}
            size="sm"
            colorScheme={getTagColorScheme(tag)}
            variant="subtle"
            borderRadius="full"
          >
            <TagLabel>{tag}</TagLabel>
          </Tag>
        ))}
        {item.link && (
          <Tooltip label="Open link" placement="top" hasArrow>
            <Box
              as="a"
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              color="teal.500"
              ml={1}
              _hover={{ color: 'teal.600' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Box>
          </Tooltip>
        )}
      </HStack>
      <HStack spacing={1} ml={2} flexShrink={0}>
        <IconButton
          aria-label="Edit item"
          icon={<EditIcon />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={onEdit}
        />
        <IconButton
          aria-label="Delete item"
          icon={<DeleteIcon />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={onDelete}
        />
      </HStack>
    </HStack>
  </Box>
);

export const InventoryList = ({
  items,
  tagGroups,
  activeTag,
  onEditItem,
  onDeleteItem,
}: InventoryListProps) => {
  const toast = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await onDeleteItem(id);
        toast({ title: 'Item deleted', status: 'success', duration: 3000, isClosable: true });
      } catch {
        toast({ title: 'Error', description: 'Failed to delete item', status: 'error', duration: 3000, isClosable: true });
      }
    }
  };

  // Empty states
  if (activeTag === null && tagGroups.size === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text fontSize="lg" color="gray.500">
          No items found. Add your first item to get started!
        </Text>
      </Box>
    );
  }

  if (activeTag !== null && items.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text fontSize="lg" color="gray.500">No items match your search.</Text>
      </Box>
    );
  }

  // Single-tag view
  if (activeTag !== null) {
    return (
      <Box>
        <HStack mb={4} spacing={2} align="baseline">
          <Heading size="md" color="gray.700">{activeTag}</Heading>
          <Text color="gray.400" fontSize="sm">({items.length})</Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => onEditItem(item)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // All view — grouped by first tag
  return (
    <Box>
      {[...tagGroups.entries()].map(([tag, tagItems]) => (
        <Box key={tag} mb={10}>
          <HStack mb={3} spacing={2} align="baseline">
            <Heading
              size="xs"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {tag}
            </Heading>
            <Text color="gray.400" fontSize="xs">({tagItems.length})</Text>
          </HStack>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
            {tagItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => onEditItem(item)}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  );
};
