import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  HStack,
  VStack,
  Badge,
  Tag,
  TagLabel,
  Box,
  Divider,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { GearItem } from '../types';
import { getTagColorScheme } from '../utils/tagColors';

interface ViewModalProps {
  item: GearItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const ViewModal = ({ item, isOpen, onClose, onEdit }: ViewModalProps) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pr={10}>
          <Text>{item.name}</Text>
          <HStack mt={2} spacing={2}>
            {item.isConsumable && (
              <Badge colorScheme="orange" variant="subtle">
                🔥 Consumable
              </Badge>
            )}
            <Badge
              colorScheme={item.isConsumable && item.quantity < 3 ? 'red' : 'teal'}
              variant="subtle"
            >
              Qty: {item.quantity}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {item.description && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Description
                </Text>
                <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                  {item.description}
                </Text>
              </Box>
            )}

            {item.tags.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={2}>
                  Tags
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {item.tags.map(tag => (
                    <Tag key={tag} size="sm" colorScheme={getTagColorScheme(tag)} variant="subtle" borderRadius="full">
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}

            {item.link && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Link
                </Text>
                <Button
                  as="a"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="link"
                  colorScheme="teal"
                  rightIcon={<ExternalLinkIcon />}
                  fontWeight="normal"
                >
                  {item.link}
                </Button>
              </Box>
            )}

            <Divider />

            <HStack justify="space-between" fontSize="xs" color="gray.400">
              <Text>Updated {formatDate(item.updatedAt)}</Text>
              <Text>Created {formatDate(item.createdAt)}</Text>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="teal" onClick={onEdit}>
            Edit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
