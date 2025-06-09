import 'dotenv/config';
import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from '../src/lib/db';
import { GearItem } from '../src/types';

// Custom async handler for better type safety
type AsyncRequestHandler<T = any, U = any> = (
  req: Request<T, any, U>,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = <T = any, U = any>(
  handler: (req: Request<T, any, U>, res: Response, next: NextFunction) => Promise<void>
): RequestHandler<T, any, U> => 
  (req, res, next) => {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };

// Define interfaces for request bodies
interface CreateItemRequest extends Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'> {
  tags?: string[];
}

interface UpdateItemRequest extends Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'>> {
  tags?: string[];
}

// Extend the Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define a proper user type here if needed
    }
  }
}

// Initialize Express app
export const app = express();

// Get port from environment variables or use default
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || '*';

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get(`${API_PREFIX}/health`, (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const router = Router();

// Add request time to all requests
router.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).requestTime = new Date().toISOString();
  next();
});

// Get all items with their tags
router.get('/items', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Get all unique tags
router.get('/tags', asyncHandler(async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  res.json(tags.map(tag => tag.name));
}));

// Get a single item by ID
router.get('/items/:id', asyncHandler<{ id: string }>(async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });
    
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    // Transform to match frontend's expected format
    const formattedItem = {
      ...item,
      tags: item.tags.map(tag => tag.name),
    };
    
    res.json(formattedItem);
  } catch (error) {
    next(error);
  }
}));

// Create a new item
router.post('/items', asyncHandler<{}, CreateItemRequest>(async (req, res, next) => {
  try {
    const { name, description, quantity = 1, isConsumable = false, link, tags = [] } = req.body;
    
    // Create the item with its tags
    const newItem = await prisma.$transaction(async (tx: any) => {
      // Create the item
      const createdItem = await tx.item.create({
        data: {
          name,
          description,
          quantity: quantity.toString(),
          isConsumable,
          link,
        },
      });

      // Create tags if they don't exist and connect them to the item
      if (tags && tags.length > 0) {
        await Promise.all(
          tags.map((tagName: string) =>
            tx.tag.upsert({
              where: { name: tagName },
              create: { name: tagName, items: { connect: { id: createdItem.id } } },
              update: { items: { connect: { id: createdItem.id } } },
            })
          )
        );
      }

      // Return the created item with its tags
      return tx.item.findUnique({
        where: { id: createdItem.id },
        include: { tags: true },
      });
    });

    if (!newItem) {
      throw new Error('Failed to create item');
    }

    // Transform to match frontend's expected format
    const formattedItem = {
      ...newItem,
      tags: newItem.tags.map((tag: any) => tag.name),
    };

    res.status(201).json(formattedItem);
  } catch (error) {
    next(error);
  }
}));

// Update an item
router.put('/items/:id', asyncHandler<{ id: string }, UpdateItemRequest>(async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First, get the current item to compare tags
    const existingItem = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingItem) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const { name, description, quantity, isConsumable, link, tags } = req.body;

    const updatedItem = await prisma.$transaction(async (tx: any) => {
      // Update the item
      const updated = await tx.item.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(quantity !== undefined && { quantity: quantity.toString() }),
          ...(isConsumable !== undefined && { isConsumable }),
          ...(link !== undefined && { link }),
        },
      });

      // Handle tags if provided
      if (tags) {
        // Get current tag names
        const currentTagNames = existingItem.tags.map((tag: any) => tag.name);
        
        // Tags to add (new tags that aren't already associated)
        const tagsToAdd = tags.filter((tag: string) => !currentTagNames.includes(tag));
        
        // Tags to remove (existing tags that aren't in the new tags array)
        const tagsToRemove = existingItem.tags
          .filter((tag: any) => !tags.includes(tag.name))
          .map((tag: any) => tag.name);

        // Add new tags
        if (tagsToAdd.length > 0) {
          await Promise.all(
            tagsToAdd.map((tagName: string) =>
              tx.tag.upsert({
                where: { name: tagName },
                create: { name: tagName, items: { connect: { id } } },
                update: { items: { connect: { id } } },
              })
            )
          );
        }

        // Remove old tags
        if (tagsToRemove.length > 0) {
          await tx.item.update({
            where: { id },
            data: {
              tags: {
                disconnect: tagsToRemove.map((name: string) => ({ name })),
              },
            },
          });
        }
      }

      // Return the updated item with its tags
      return tx.item.findUnique({
        where: { id },
        include: { tags: true },
      });
    });

    // Transform to match frontend's expected format
    const formattedItem = {
      ...updatedItem,
      tags: (updatedItem as any).tags.map((tag: any) => tag.name),
    };

    res.json(formattedItem);
  } catch (error) {
    next(error);
  }
}));

// Delete an item
router.delete('/items/:id', asyncHandler<{ id: string }>(async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First, get the item to be deleted to clean up tags later
    const item = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // First, disconnect all tags from the item
    await prisma.item.update({
      where: { id },
      data: {
        tags: {
          disconnect: item.tags.map(tag => ({ id: tag.id })),
        },
      },
    });

    // Then delete the item
    await prisma.item.delete({
      where: { id },
    });

    // Clean up any tags that are no longer associated with any items
    await prisma.tag.deleteMany({
      where: {
        items: {
          none: {},
        },
      },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}));

// Mount the router
app.use(API_PREFIX, router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// All app configuration and route handlers go above this line

// Start the server if not in a Netlify Functions environment
if (process.env.NETLIFY_DEV !== 'true') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📚 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}

// Export the handler for Netlify Functions
export const handler = app;
