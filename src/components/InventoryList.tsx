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
  Button,
  useToast,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';
import { getTagColorScheme } from '../utils/tagColors';

interface InventoryListProps {
  items: GearItem[];
  tagGroups: Map<string, GearItem[]>;
  activeTags: string[];
  onClearTags: () => void;
  onEditItem: (item: GearItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onViewItem: (item: GearItem) => void;
}

interface ItemCardProps {
  item: GearItem;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  const sameYear = date.getFullYear() === now.getFullYear();
  const dateStr2 = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  return `${dateStr2}, ${time}`;
};

const ItemCard = ({ item, onEdit, onDelete, onView }: ItemCardProps) => (
  <Box
    role="group"
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    p={{ base: 3, md: 4 }}
    display="flex"
    flexDirection="column"
    _hover={{ boxShadow: 'md', borderColor: 'gray.300' }}
    transition="all 0.2s"
    cursor="pointer"
    onClick={onView}
  >
    {/* Name row */}
    <HStack justify="space-between" align="flex-start" mb={1}>
      <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }} flex="1" lineHeight="short" noOfLines={2}>
        {item.name}
      </Text>
      <HStack spacing={1} flexShrink={0} ml={1}>
        {item.isConsumable && (
          <Text fontSize="xs" title="Consumable">🔥</Text>
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

    {/* Updated date */}
    <Text fontSize="xs" color="gray.400" mb={{ base: 1, md: 2 }}>
      {formatRelativeDate(item.updatedAt)}
    </Text>

    {/* Description — hidden on mobile (cards too narrow) */}
    {item.description && (
      <Text
        display={{ base: 'none', md: 'block' }}
        color="gray.600"
        fontSize="sm"
        noOfLines={2}
        mb={3}
        flex="1"
        whiteSpace="pre-line"
      >
        {item.description}
      </Text>
    )}

    {/* Footer: tags + link (left) / edit+delete (right) */}
    <HStack justify="space-between" align="flex-end" mt="auto" pt={{ base: 1, md: 2 }}>
      <HStack spacing={1} flexWrap="wrap" flex="1" minW={0} overflow="hidden">
        {item.tags.slice(0, 2).map(tag => (
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
        {item.tags.length > 2 && (
          <Tooltip label={item.tags.slice(2).join(', ')} placement="top" hasArrow>
            <Text fontSize="xs" color="gray.400" cursor="default">+{item.tags.length - 2}</Text>
          </Tooltip>
        )}
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
      <HStack spacing={0} ml={1} flexShrink={0}>
        <IconButton
          aria-label="Edit item"
          icon={<EditIcon />}
          size="xs"
          colorScheme="teal"
          variant="ghost"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}
        />
        <IconButton
          aria-label="Delete item"
          icon={<DeleteIcon />}
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}
        />
      </HStack>
    </HStack>
  </Box>
);

export const InventoryList = ({
  items,
  tagGroups,
  activeTags,
  onClearTags,
  onEditItem,
  onDeleteItem,
  onViewItem,
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

  const isFiltered = activeTags.length > 0;

  // Empty states
  if (!isFiltered && tagGroups.size === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text fontSize="lg" color="gray.500">
          No items found. Add your first item to get started!
        </Text>
      </Box>
    );
  }

  if (isFiltered && items.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <Text fontSize="lg" color="gray.500">No items match your search.</Text>
      </Box>
    );
  }

  // Filtered view (one or more tags selected)
  if (isFiltered) {
    return (
      <Box>
        <HStack mb={4} spacing={2} align="center" flexWrap="wrap">
          {activeTags.map(tag => (
            <Tag key={tag} size="md" colorScheme={getTagColorScheme(tag)} variant="subtle" borderRadius="full">
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
          <Text color="gray.400" fontSize="sm">({items.length})</Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="gray"
            leftIcon={<SmallCloseIcon />}
            onClick={onClearTags}
          >
            Clear
          </Button>
        </HStack>
        <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={{ base: 2, md: 4 }}>
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onView={() => onViewItem(item)}
              onEdit={() => onEditItem(item)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // All view — grouped by first tag, each section collapsible
  return (
    <Accordion
      allowMultiple
      defaultIndex={Array.from({ length: tagGroups.size }, (_, i) => i)}
    >
      {[...tagGroups.entries()].map(([tag, tagItems]) => (
        <AccordionItem key={tag} border="none" mb={{ base: 3, md: 6 }}>
          <AccordionButton
            px={0}
            py={2}
            _hover={{ bg: 'transparent' }}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <HStack flex="1" spacing={2} align="center">
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {tag}
              </Text>
              <Text color="gray.300" fontSize="xs">·</Text>
              <Text color="gray.400" fontSize="xs">{tagItems.length}</Text>
            </HStack>
            <AccordionIcon color="gray.400" boxSize={4} />
          </AccordionButton>
          <AccordionPanel px={0} pt={3} pb={0}>
            <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={{ base: 2, md: 4 }}>
              {tagItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onView={() => onViewItem(item)}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              ))}
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
