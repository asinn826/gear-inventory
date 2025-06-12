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
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://gear-inventory.alfredsin.com'] // Replace with your actual Netlify domain
    : ['http://localhost:5173'], // Default Vite dev server port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

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
      .map(tagName => ({
        name: tagName,
      }));
      
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
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
