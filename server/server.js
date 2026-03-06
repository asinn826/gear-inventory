// CommonJS version for better compatibility with Render
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const app = express();
// Initialize with Prisma Accelerate for Prisma Data Platform
const prisma = new PrismaClient().$extends(withAccelerate());
const PORT = process.env.PORT || 3001;

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://gear-inventory.alfredsin.com'] // Replace with your Netlify domain
    : ['http://localhost:5173'], // Default Vite dev server port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// --- Helpers ---

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';
}

async function geolocate(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return {};
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`);
    if (!res.ok) return {};
    const data = await res.json();
    return { city: data.city, country: data.country };
  } catch {
    return {};
  }
}

async function writeAuditLog({ itemId, itemName, action, changes, ipAddress, userAgent }) {
  try {
    const geo = await geolocate(ipAddress);
    await prisma.auditLog.create({
      data: {
        itemId,
        itemName,
        action,
        changes: changes ?? undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        city: geo.city || null,
        country: geo.country || null,
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

    const tagConnections = tags.map((tagName) => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        quantity: parseInt(quantity, 10) || 1,
        isConsumable: Boolean(isConsumable),
        link: link || null,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

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

    const currentItem = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!currentItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentTagNames = currentItem.tags.map(tag => tag.name);
    const newTagNames = Array.isArray(tags) ? tags : [];

    const tagsToDisconnect = currentTagNames
      .filter(tag => !newTagNames.includes(tag))
      .map(tagName => ({ name: tagName }));

    const tagsToConnect = newTagNames
      .filter(tagName => !currentTagNames.includes(tagName))
      .map(tagName => ({
        where: { name: tagName },
        create: { name: tagName },
      }));

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        quantity: parseInt(quantity, 10) || 1,
        isConsumable: Boolean(isConsumable),
        link: link || null,
        tags: {
          disconnect: tagsToDisconnect,
          connectOrCreate: tagsToConnect,
        },
      },
      include: {
        tags: true,
      },
    });

    await prisma.tag.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });

    const formattedItem = {
      ...updatedItem,
      tags: updatedItem.tags.map(tag => tag.name),
    };

    res.json(formattedItem);

    // Compute diff for audit log
    const changes = {};
    for (const field of ['name', 'description', 'quantity', 'isConsumable', 'link']) {
      if (currentItem[field] !== updatedItem[field]) {
        changes[field] = { before: currentItem[field], after: updatedItem[field] };
      }
    }
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

    const itemToDelete = await prisma.item.findUnique({
      where: { id },
    });

    if (!itemToDelete) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prisma.item.delete({
      where: { id },
    });

    await prisma.tag.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });

    res.status(204).end();

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
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;
    const logs = await prisma.auditLog.findMany({
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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
