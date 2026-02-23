import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-16px); }
`;

const shadowFade = keyframes`
  0%, 100% { opacity: 0.2; transform: scaleX(1); }
  50%       { opacity: 0.08; transform: scaleX(0.7); }
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
      animation={`${float} 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite`}
      display="inline-block"
    >
      <svg
        width="140"
        height="160"
        viewBox="0 0 140 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Leaf hat */}
        <ellipse cx="58" cy="14" rx="9" ry="22" fill="#3d7a4f" transform="rotate(-20 58 14)" />
        <ellipse cx="72" cy="12" rx="9" ry="22" fill="#4e9a63" transform="rotate(15 72 12)" />
        <ellipse cx="62" cy="22" rx="6" ry="14" fill="#5aaf70" transform="rotate(-10 62 22)" />

        {/* Left ear */}
        <ellipse cx="28" cy="46" rx="15" ry="24" fill="#6a6a80" transform="rotate(-22 28 46)" />
        <ellipse cx="28" cy="50" rx="8"  ry="13" fill="#9c8fb0" transform="rotate(-22 28 50)" />

        {/* Right ear */}
        <ellipse cx="112" cy="46" rx="15" ry="24" fill="#6a6a80" transform="rotate(22 112 46)" />
        <ellipse cx="112" cy="50" rx="8"  ry="13" fill="#9c8fb0" transform="rotate(22 112 50)" />

        {/* Body */}
        <ellipse cx="70" cy="103" rx="56" ry="58" fill="#7b7b92" />

        {/* Belly */}
        <ellipse cx="70" cy="116" rx="33" ry="36" fill="#eae5d0" />

        {/* Belly chevrons */}
        <path d="M53 103 Q70 95  87 103" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M49 116 Q70 107  91 116" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M51 129 Q70 120  89 129" fill="none" stroke="#b8b09a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes (with blink animation) */}
        <g style={{ transformOrigin: '50px 86px', animation: `${blink} 4s ease-in-out infinite` }}>
          <circle cx="50" cy="86" r="12" fill="white" />
        </g>
        <g style={{ transformOrigin: '90px 86px', animation: `${blink} 4s ease-in-out infinite` }}>
          <circle cx="90" cy="86" r="12" fill="white" />
        </g>
        <circle cx="52" cy="88" r="7.5" fill="#1a1a2e" />
        <circle cx="92" cy="88" r="7.5" fill="#1a1a2e" />
        {/* Eye shine */}
        <circle cx="55" cy="85" r="2.8" fill="white" />
        <circle cx="95" cy="85" r="2.8" fill="white" />

        {/* Nose */}
        <ellipse cx="70" cy="98" rx="4.5" ry="3.5" fill="#3a3a50" />

        {/* Whiskers — left */}
        <line x1="14" y1="92"  x2="58" y2="97"  stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="100" x2="58" y2="101" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="108" x2="58" y2="105" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />

        {/* Whiskers — right */}
        <line x1="82" y1="97"  x2="126" y2="92"  stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="82" y1="101" x2="128" y2="100" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="82" y1="105" x2="126" y2="108" stroke="#4a4a60" strokeWidth="1.5" strokeLinecap="round" />

        {/* Paws */}
        <ellipse cx="18"  cy="118" rx="11" ry="8" fill="#6a6a80" transform="rotate(-35 18 118)"  />
        <ellipse cx="122" cy="118" rx="11" ry="8" fill="#6a6a80" transform="rotate(35 122 118)" />

        {/* Feet */}
        <ellipse cx="48" cy="157" rx="18" ry="9" fill="#5e5e74" />
        <ellipse cx="92" cy="157" rx="18" ry="9" fill="#5e5e74" />
      </svg>
    </Box>

    {/* Shadow */}
    <Box
      w="72px"
      h="12px"
      bg="gray.300"
      borderRadius="full"
      mt="-3"
      animation={`${shadowFade} 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite`}
    />

    <Text mt={5} color="gray.600" fontSize="sm">
      Loading your gear…
    </Text>
  </Box>
);
