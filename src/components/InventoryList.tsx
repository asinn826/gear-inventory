import React from 'react';
import { VStack, Text, Box, HStack, Tag, TagLabel, IconButton, useToast, Tooltip, Button } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';
import { getTagColor, getTagColorScheme } from '../utils/tagColors';

interface InventoryListProps {
  items: GearItem[];
  onEditItem: (item: GearItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
}

export const InventoryList = ({ 
  items, 
  onEditItem, 
  onDeleteItem 
}: InventoryListProps) => {
  const toast = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await onDeleteItem(id);
        toast({
          title: 'Item deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to delete item:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete item',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (items.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">No items found. Add your first item to get started!</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {items.map((item) => (
        <Box 
          key={item.id}
          position="relative"
          bg="white" 
          p={4} 
          borderRadius="md" 
          boxShadow="sm"
          borderLeft="4px"
          borderLeftColor={item.isConsumable && item.quantity < 3 ? 'red.400' : 'teal.400'}
          _hover={{
            boxShadow: 'md',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
          }}
        >
          <Box 
            as="button"
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            width="100%"
            height="100%"
            onClick={() => onEditItem(item)}
            _hover={{
              cursor: 'pointer',
            }}
            _focus={{
              outline: '2px solid',
              outlineColor: 'teal.400',
              outlineOffset: '2px',
            }}
            aria-label={`Edit ${item.name}`}
            sx={{
              '&:not(:hover)': {
                pointerEvents: 'none',
              },
              '&:hover + *': {
                'a, button': {
                  position: 'relative',
                  zIndex: 1,
                }
              }
            }}
          />
          <HStack justify="space-between" mb={2}>
            <Box flex="1">
              <HStack spacing={4} align="center">
                <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
                <Text fontSize="md" color="gray.600">
                  ×{item.quantity}
                </Text>
              </HStack>
              {item.description && (
                <Text color="gray.600" mt={1}>{item.description}</Text>
              )}
              <HStack spacing={4} mt={2} fontSize="xs" color="gray.500" divider={<Text mx={1}>•</Text>}>
                <Text>Added: {new Date(item.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</Text>
                {item.updatedAt !== item.createdAt && (
                  <Text>Updated: {new Date(item.updatedAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                )}
              </HStack>
            </Box>
            <HStack spacing={2} mt={2} justify="flex-end" position="relative" zIndex="1">
              <IconButton
                aria-label="Edit item"
                icon={<EditIcon />}
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                _hover={{
                  bg: 'teal.50',
                  transform: 'scale(1.1)',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <IconButton
                aria-label="Delete item"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id, item.name);
                }}
                _hover={{
                  bg: 'red.50',
                  transform: 'scale(1.1)',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </HStack>
          </HStack>
          
          {(item.tags.length > 0 || item.link) && (
            <HStack mt={2} spacing={4}>
              {item.tags.length > 0 && (
                <HStack spacing={1} wrap="wrap">
                  {item.tags.map((tag) => (
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
              {item.link && (
                <Tooltip label="Opens in a new tab" placement="top" hasArrow>
                  <Box 
                    as="a" 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="teal.500"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    position="relative"
                    zIndex="1"
                    _hover={{ 
                      textDecoration: 'underline',
                      color: 'teal.600',
                      '& svg': {
                        transform: 'translateX(2px)'
                      }
                    }}
                    _focus={{
                      outline: '2px solid',
                      outlineColor: 'teal.400',
                      outlineOffset: '2px',
                    }}
                    transition="all 0.2s"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      pointerEvents: 'auto !important',
                    }}
                  >
                    View Product
                    <Box as="span" ml={1} display="inline-flex" transition="transform 0.2s">
                      <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </Box>
                  </Box>
                </Tooltip>
              )}
            </HStack>
          )}
        </Box>
      ))}
    </VStack>
  );
};
