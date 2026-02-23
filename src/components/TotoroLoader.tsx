import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import totoroSvg from '../assets/totoro_embedded.svg';

const dance = keyframes`
  0%   { transform: translateY(0px)   rotate(-5deg); }
  25%  { transform: translateY(-12px) rotate(0deg); }
  50%  { transform: translateY(0px)   rotate(5deg); }
  75%  { transform: translateY(-12px) rotate(0deg); }
  100% { transform: translateY(0px)   rotate(-5deg); }
`;

const shadowJig = keyframes`
  0%   { transform: scaleX(1.1); opacity: 0.25; }
  25%  { transform: scaleX(0.7); opacity: 0.12; }
  50%  { transform: scaleX(1.1); opacity: 0.25; }
  75%  { transform: scaleX(0.7); opacity: 0.12; }
  100% { transform: scaleX(1.1); opacity: 0.25; }
`;


export const TotoroLoader = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={20}
    gap={0}
  >
    {/* Totoro */}
    <Box
      animation={`${dance} 1s ease-in-out infinite`}
      display="inline-block"
      style={{ transformOrigin: 'center bottom' }}
    >
      <img src={totoroSvg} width="160" height="160" alt="Totoro" />
    </Box>

    {/* Shadow */}
    <Box
      w="70px"
      h="12px"
      bg="gray.300"
      borderRadius="full"
      mt="-3"
      animation={`${shadowJig} 1s ease-in-out infinite`}
    />

    <Text mt={5} color="gray.600" fontSize="sm">
      Loading your gear…
    </Text>
  </Box>
);
