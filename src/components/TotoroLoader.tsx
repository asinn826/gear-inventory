import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

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

const blink = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  95%            { transform: scaleY(0.1); }
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
      <svg
        width="150"
        height="175"
        viewBox="0 0 150 175"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Leaf hat */}
        <ellipse cx="52" cy="14" rx="9" ry="22" fill="#3d7a4f" transform="rotate(-22 52 14)" />
        <ellipse cx="66" cy="12" rx="9" ry="22" fill="#4e9a63" transform="rotate(16 66 12)" />
        <ellipse cx="57" cy="22" rx="6" ry="14" fill="#5aaf70" transform="rotate(-10 57 22)" />

        {/* Left ear — pointed triangular */}
        <path d="M 18 72 L 40 14 L 62 72 Z" fill="#6a6a80" />
        <path d="M 26 69 L 40 26 L 54 69 Z" fill="#9c8fb0" />

        {/* Right ear — pointed triangular */}
        <path d="M 88 72 L 110 14 L 132 72 Z" fill="#6a6a80" />
        <path d="M 96 69 L 110 26 L 124 69 Z" fill="#9c8fb0" />

        {/* Body */}
        <ellipse cx="75" cy="112" rx="60" ry="57" fill="#7b7b92" />

        {/* Belly */}
        <ellipse cx="75" cy="124" rx="36" ry="38" fill="#eae5d0" />

        {/* Belly chevrons */}
        <path d="M 52 107 Q 75 98  98 107" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 47 121 Q 75 111 103 121" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 49 135 Q 75 125 101 135" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes (with blink animation) */}
        <g style={{ transformOrigin: '57px 91px', animation: `${blink} 4s ease-in-out infinite` }}>
          <circle cx="57" cy="91" r="13" fill="white" />
        </g>
        <g style={{ transformOrigin: '93px 91px', animation: `${blink} 4s ease-in-out infinite` }}>
          <circle cx="93" cy="91" r="13" fill="white" />
        </g>
        <circle cx="59" cy="93" r="8.5" fill="#1a1a2e" />
        <circle cx="95" cy="93" r="8.5" fill="#1a1a2e" />
        {/* Eye shine */}
        <circle cx="63" cy="89" r="3" fill="white" />
        <circle cx="99" cy="89" r="3" fill="white" />

        {/* Nose */}
        <ellipse cx="75" cy="105" rx="4.5" ry="3.5" fill="#3a3a50" />

        {/* Whiskers — left */}
        <line x1="4"  y1="98"  x2="60" y2="102" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2"  y1="107" x2="60" y2="107" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4"  y1="116" x2="60" y2="112" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />

        {/* Whiskers — right */}
        <line x1="90" y1="102" x2="146" y2="98"  stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="107" x2="148" y2="107" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="112" x2="146" y2="116" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />

        {/* Paws */}
        <ellipse cx="16"  cy="122" rx="12" ry="8" fill="#6a6a80" transform="rotate(-35 16 122)"  />
        <ellipse cx="134" cy="122" rx="12" ry="8" fill="#6a6a80" transform="rotate(35 134 122)" />

        {/* Feet */}
        <ellipse cx="52"  cy="163" rx="19" ry="8" fill="#5e5e74" />
        <ellipse cx="98"  cy="163" rx="19" ry="8" fill="#5e5e74" />
        {/* Toes */}
        <circle cx="38"  cy="161" r="5" fill="#52526a" />
        <circle cx="52"  cy="167" r="5" fill="#52526a" />
        <circle cx="66"  cy="161" r="5" fill="#52526a" />
        <circle cx="84"  cy="161" r="5" fill="#52526a" />
        <circle cx="98"  cy="167" r="5" fill="#52526a" />
        <circle cx="112" cy="161" r="5" fill="#52526a" />
      </svg>
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
