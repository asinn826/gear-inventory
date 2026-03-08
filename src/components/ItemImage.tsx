import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { getGearEmoji } from '../utils/gearEmoji';

interface ItemImageProps {
  imageUrl?: string | null;
  name: string;
  height: string;
  borderRadius?: string | object;
}

export const ItemImage = ({ imageUrl, name, height, borderRadius = 'md' }: ItemImageProps) => {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        w="full"
        h={height}
        objectFit="cover"
        borderRadius={borderRadius}
        fallback={<EmojiPlaceholder name={name} height={height} borderRadius={borderRadius} />}
      />
    );
  }

  return <EmojiPlaceholder name={name} height={height} borderRadius={borderRadius} />;
};

const EmojiPlaceholder = ({
  name,
  height,
  borderRadius,
}: {
  name: string;
  height: string;
  borderRadius?: string | object;
}) => (
  <Box
    w="full"
    h={height}
    borderRadius={borderRadius}
    bgGradient="linear(to-br, teal.50, blue.100)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    fontSize="4xl"
    userSelect="none"
  >
    {getGearEmoji(name)}
  </Box>
);
