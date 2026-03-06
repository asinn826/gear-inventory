import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaNeon } from '@prisma/adapter-neon';

const app = express();
// Initialize Prisma client based on environment
const prisma = process.env.NODE_ENV === 'production'
  ? new PrismaClient().$extends(withAccelerate()) // For Prisma Accelerate in production
  : new PrismaClient({
      adapter: PrismaNeon() // For local development with Neon
    });
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Helpers ---

function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '';
}

async function geolocate(ip: string): Promise<{ city?: string; country?: string }> {
  // Skip private/loopback IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return {};
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`);
    if (!res.ok) return {};
    const data = await res.json() as { city?: string; country?: string };
    return { city: data.city, country: data.country };
  } catch {
    return {};
  }
}

async function writeAuditLog(opts: {
  itemId: string;
  itemName: string;
  action: string;
  changes: Record<string, { before: unknown; after: unknown }> | null;
  ipAddress: string;
  userAgent: string;
}): Promise<void> {
  try {
    const geo = await geolocate(opts.ipAddress);
    await (prisma as any).auditLog.create({
      data: {
        itemId: opts.itemId,
        itemName: opts.itemName,
        action: opts.action,
        changes: opts.changes ?? undefined,
        ipAddress: opts.ipAddress || null,
        userAgent: opts.userAgent || null,
        city: geo.city ?? null,
        country: geo.country ?? null,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// --- Item endpoints ---

// Get all items with their tags
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend's expected format
    const formattedItems = items.map(item => ({
      ...item,
      tags: item.tags.map(tag => tag.name),
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get all unique tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(tags.map(tag => tag.name));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create a new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, description, quantity, isConsumable, link, tags = [] } = req.body;

    // Create or connect tags
    const tagConnections = tags.map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        quantity: parseInt(quantity, 10) || 1,
        isConsumable: Boolean(isConsumable),
        link,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    // Transform to match frontend's expected format
    const formattedItem = {
      ...newItem,
      tags: newItem.tags.map(tag => tag.name),
    };

    res.status(201).json(formattedItem);

    // Fire-and-forget audit log
    writeAuditLog({
      itemId: newItem.id,
      itemName: newItem.name,
      action: 'created',
      changes: null,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update an item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, isConsumable, link, tags = [] } = req.body;

    // First, get the current item to compare tags
    const currentItem = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!currentItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get current tag names
    const currentTagNames = currentItem.tags.map(tag => tag.name);
    const newTagNames = Array.isArray(tags) ? tags : [];

    // Determine tags to disconnect and connect
    const tagsToDisconnect = currentTagNames
      .filter((tag: string) => !newTagNames.includes(tag))
      .map((tagName: string) => ({
        name: tagName,
      }));

    const tagsToConnect = newTagNames
      .filter((tagName: string) => !currentTagNames.includes(tagName))
      .map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      }));

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        quantity: parseInt(quantity, 10) || 1,
        isConsumable: Boolean(isConsumable),
        link,
        tags: {
          disconnect: tagsToDisconnect,
          connectOrCreate: tagsToConnect,
        },
      },
      include: {
        tags: true,
      },
    });

    // Clean up any orphaned tags
    await prisma.tag.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });

    // Transform to match frontend's expected format
    const formattedItem = {
      ...updatedItem,
      tags: updatedItem.tags.map(tag => tag.name),
    };

    res.json(formattedItem);

    // Compute diff for audit log (skip updatedAt)
    const changes: Record<string, { before: unknown; after: unknown }> = {};
    const fieldsToTrack: Array<keyof typeof currentItem> = ['name', 'description', 'quantity', 'isConsumable', 'link'];
    for (const field of fieldsToTrack) {
      const before = currentItem[field];
      const after = updatedItem[field];
      if (before !== after) {
        changes[field] = { before, after };
      }
    }
    // Check tags diff
    const oldTagsSorted = [...currentTagNames].sort().join(',');
    const newTagsSorted = [...newTagNames].sort().join(',');
    if (oldTagsSorted !== newTagsSorted) {
      changes['tags'] = { before: currentTagNames, after: newTagNames };
    }

    writeAuditLog({
      itemId: updatedItem.id,
      itemName: updatedItem.name,
      action: 'updated',
      changes: Object.keys(changes).length > 0 ? changes : null,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the item to be deleted to clean up tags later
    const itemToDelete = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!itemToDelete) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete the item
    await prisma.item.delete({
      where: { id },
    });

    // Clean up any orphaned tags
    await prisma.tag.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });

    res.status(204).send();

    // Fire-and-forget audit log
    writeAuditLog({
      itemId: itemToDelete.id,
      itemName: itemToDelete.name,
      action: 'deleted',
      changes: null,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get audit log
app.get('/api/audit-log', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
