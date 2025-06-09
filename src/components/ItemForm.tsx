import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  VStack,
  FormErrorMessage,
  Link,
  useToast,
  FormHelperText,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Box,
  Text,
} from '@chakra-ui/react';
import { Formik, Form as FormikForm, Field, FieldProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { GearItem, GearItemInput } from '../types';
import { useInventory } from '../hooks/useInventory';
import { getTagColorScheme } from '../utils/tagColors';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  quantity: Yup.number().min(1, 'Minimum quantity is 1').required('Required'),
  isConsumable: Yup.boolean(),
  link: Yup.string()
    .nullable()
    .url('Must be a valid URL')
    .transform((value) => (value === '' ? null : value)) // Convert empty string to null
    .default(null), // Default to null when empty
  tags: Yup.array().of(Yup.string()),
});

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item: GearItem | null;
  onSubmit: (item: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  allTags: string[];
}

export const ItemForm = ({ isOpen, onClose, item, onSubmit, allTags: availableTags }: ItemFormProps) => {
  const { addItem, updateItem } = useInventory();
  const toast = useToast();
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const initialRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const initialValues: GearItemInput = {
    name: item?.name || '',
    description: item?.description || '',
    quantity: item?.quantity || 1,
    isConsumable: item?.isConsumable || false,
    link: item?.link || '', // Ensure link is always a string, default to empty
    tags: item?.tags || [],
  };
  
  // Initialize form when modal is opened or item changes
  useEffect(() => {
    if (isOpen) {
      if (item) {
        // Set selected tags when editing an existing item
        setSelectedTags([...item.tags]);
      } else {
        // Clear selected tags when adding a new item
        setSelectedTags([]);
      }
    }
  }, [isOpen, item?.id]); // Only re-run if item ID changes or modal opens/closes
  
  // Handle modal close
  const handleModalClose = useCallback(() => {
    setTagInput('');
    setSuggestedTags([]);
    onClose();
  }, [onClose]);

  const handleSubmit = async (values: GearItemInput, { setSubmitting, resetForm }: FormikHelpers<GearItemInput>) => {
    try {
      setIsSubmitting(true);
      const itemData = {
        ...values,
        tags: selectedTags,
      };

      await onSubmit(itemData);
      
      // Reset form state after successful submission
      if (resetForm) {
        resetForm();
      }
      setTagInput('');
      setSelectedTags([]);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save item. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    handleModalClose();
  };

  const handleAddTag = useCallback((values: GearItemInput, setFieldValue: any, tagToAdd?: string) => {
    const newTag = (tagToAdd || tagInput).trim();
    if (newTag && !selectedTags.includes(newTag)) {
      const updatedTags = [...selectedTags, newTag];
      setSelectedTags(updatedTags);
      setFieldValue('tags', updatedTags);
      setTagInput('');
      setShowSuggestions(false);
      tagInputRef.current?.focus();
    }
  }, [selectedTags, tagInput]);

  const handleRemoveTag = useCallback((tagToRemove: string, values: GearItemInput, setFieldValue: any) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setFieldValue('tags', newTags);
  }, [selectedTags]);

  const handleKeyDown = (e: React.KeyboardEvent, values: GearItemInput, setFieldValue: any) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(values, setFieldValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      // Remove last tag on backspace when input is empty
      const lastTag = selectedTags[selectedTags.length - 1];
      handleRemoveTag(lastTag, values, setFieldValue);
    }
  };

  // Update suggestions when input or selected tags change
  useEffect(() => {
    const filtered = availableTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase().trim()) && 
        !selectedTags.includes(tag)
      )
      .sort()
      .slice(0, 10); // Show more suggestions
    
    setSuggestedTags(filtered);
  }, [tagInput, selectedTags, availableTags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          tagInputRef.current !== event.target) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (item) {
      setSelectedTags(item.tags || []);
    } else {
      setSelectedTags([]);
    }
  }, [item]);

  // Create a key based on whether we're editing or creating to force remount of Formik
  const formKey = item ? `edit-${item.id}` : 'create';

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} initialFocusRef={initialRef} size="lg">
      <ModalOverlay />
      <ModalContent>
        <Formik
          key={formKey}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
            <FormikForm>
              <ModalHeader>{item ? 'Edit Item' : 'Add New Item'}</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4}>
                  <Field name="name">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.name && form.touched.name)} isRequired>
                        <FormLabel>Item Name</FormLabel>
                        <Input
                          {...field}
                          placeholder="Enter item name"
                          ref={initialRef}
                        />
                        <FormErrorMessage>{form.errors.name as string}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="description">
                    {({ field }: FieldProps) => (
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          {...field}
                          placeholder="Enter a description (optional)"
                        />
                      </FormControl>
                    )}
                  </Field>

                  <Field name="quantity">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.quantity && form.touched.quantity)} isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput 
                          min={1} 
                          value={field.value}
                          onChange={(value) => setFieldValue('quantity', parseInt(value) || 1)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>{form.errors.quantity as string}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="isConsumable">
                    {({ field }: FieldProps) => (
                      <FormControl display="flex" alignItems="center">
                        <Checkbox
                          {...field}
                          isChecked={field.value}
                          colorScheme="teal"
                        >
                          Consumable Item
                        </Checkbox>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="link">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.link && form.touched.link)}>
                        <FormLabel>Product Link</FormLabel>
                        <Input
                          {...field}
                          placeholder="https://example.com/product"
                          type="url"
                        />
                        <FormHelperText>Link to the product page (optional)</FormHelperText>
                        <FormErrorMessage>{form.errors.link as string}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <Box
                      borderWidth="1px"
                      borderRadius="md"
                      p={2}
                      minH="42px"
                      bg="white"
                    >
                      <Wrap spacing={2} mb={2}>
                        {selectedTags.map((tag) => (
                          <WrapItem key={tag}>
                            <Tag 
                              size="md" 
                              colorScheme={getTagColorScheme(tag)}
                              variant="subtle"
                              borderRadius="full"
                              px={2}
                            >
                              <TagLabel>{tag}</TagLabel>
                              <TagCloseButton onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag, values, setFieldValue);
                              }} />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                      
                      <HStack width="100%">
                        <Box position="relative" width="100%">
                          <Input
                            ref={tagInputRef}
                            value={tagInput}
                            onChange={(e) => {
                              setTagInput(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(e) => handleKeyDown(e, values, setFieldValue)}
                            onBlur={() => {
                              // Small timeout to allow click events on suggestions to fire
                              setTimeout(() => {
                                if (tagInput.trim()) {
                                  handleAddTag(values, setFieldValue);
                                }
                              }, 200);
                            }}
                            placeholder="Add tags..."
                            size="sm"
                            width="100%"
                            autoComplete="off"
                          />
                          
                          {(showSuggestions && (suggestedTags.length > 0 || availableTags.length > 0)) && (
                            <Box
                              ref={suggestionsRef}
                              position="absolute"
                              top="100%"
                              left={0}
                              right={0}
                              mt={1}
                              bg="white"
                              borderWidth="1px"
                              borderRadius="md"
                              boxShadow="md"
                              zIndex={10}
                              maxH="200px"
                              overflowY="auto"
                            >
                              {suggestedTags.length > 0 ? (
                                suggestedTags.map((tag) => (
                                  <Box
                                    key={tag}
                                    px={3}
                                    py={2}
                                    _hover={{ bg: 'gray.100' }}
                                    cursor="pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddTag(values, setFieldValue, tag);
                                    }}
                                  >
                                    {tag}
                                  </Box>
                                ))
                              ) : tagInput.trim() ? (
                                <Box px={3} py={2} color="gray.500">
                                  No matching tags found
                                </Box>
                              ) : (
                                <Box px={3} py={2} color="gray.500">
                                  Type to filter tags
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      </HStack>
                      <FormHelperText>Press Enter to add a tag</FormHelperText>
                    </Box>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button onClick={handleCancel} mr={3}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="teal" 
                  type="submit" 
                  isLoading={isSubmitting}
                >
                  {item ? 'Update Item' : 'Add Item'}
                </Button>
              </ModalFooter>
            </FormikForm>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};
