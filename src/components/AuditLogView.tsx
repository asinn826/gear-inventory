import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  Flex,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { AuditLogEntry, fetchAuditLog } from '../utils/api';

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} second${s !== 1 ? 's' : ''} ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function parseBrowser(ua: string | null): string {
  if (!ua) return 'Unknown browser';
  let browser = 'Unknown browser';
  let os = 'Unknown OS';

  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';

  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';

  return `${browser} on ${os}`;
}

const ACTION_COLORS: Record<string, string> = {
  created: 'green',
  updated: 'blue',
  deleted: 'red',
};

function ChangesSummary({ entry }: { entry: AuditLogEntry }) {
  if (entry.action !== 'updated' || !entry.changes) {
    return null;
  }
  const fields = Object.entries(entry.changes);
  if (fields.length === 0) return null;
  return (
    <VStack align="flex-start" spacing={0} mt={1}>
      {fields.map(([field, { before, after }]) => (
        <Text key={field} fontSize="xs" color="gray.600">
          <Text as="span" fontWeight="medium">{field}:</Text>{' '}
          <Text as="span" color="red.500">{String(before ?? '—')}</Text>
          {' → '}
          <Text as="span" color="green.600">{String(after ?? '—')}</Text>
        </Text>
      ))}
    </VStack>
  );
}

export function AuditLogView() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <VStack spacing={3} align="stretch">
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={4}>
            <Skeleton height="16px" width="120px" mb={2} />
            <SkeletonText noOfLines={2} spacing={2} />
          </Box>
        ))}
      </VStack>
    );
  }

  if (entries.length === 0) {
    return (
      <Box
        bg="white"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        p={10}
        textAlign="center"
      >
        <Text color="gray.400" fontSize="sm">No activity yet. Create, update, or delete items to see the audit log.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {entries.map(entry => (
        <Box
          key={entry.id}
          bg="white"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          p={4}
        >
          <Flex align="flex-start" gap={3} wrap="wrap">
            <Badge
              colorScheme={ACTION_COLORS[entry.action] ?? 'gray'}
              textTransform="capitalize"
              flexShrink={0}
              mt="1px"
            >
              {entry.action}
            </Badge>
            <Box flex="1" minW={0}>
              <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{entry.itemName}</Text>
              <ChangesSummary entry={entry} />
            </Box>
            <Box textAlign="right" flexShrink={0}>
              <Text
                fontSize="xs"
                color="gray.500"
                title={new Date(entry.timestamp).toLocaleString()}
                cursor="default"
              >
                {relativeTime(entry.timestamp)}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {entry.city && entry.country
                  ? `${entry.city}, ${entry.country}`
                  : entry.country || 'Unknown location'}
              </Text>
            </Box>
          </Flex>
          <Flex mt={2} gap={4} wrap="wrap">
            <Text fontSize="xs" color="gray.500">{parseBrowser(entry.userAgent)}</Text>
            {entry.ipAddress && (
              <Text fontSize="xs" color="gray.400">{entry.ipAddress}</Text>
            )}
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}
