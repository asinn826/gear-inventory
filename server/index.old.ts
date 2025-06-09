import 'dotenv/config';
import express, { Request, Response, NextFunction, Router, RequestHandler, RequestHandler as ExpressRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from '../src/lib/db';
import { GearItem } from '../src/types';

// Define interfaces for request bodies
interface CreateItemRequest extends Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'> {
  tags?: string[];
}

interface UpdateItemRequest extends Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'>> {
  tags?: string[];
}

// Type for route handler with proper typing
type AsyncRequestHandler<P = {}, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Extend the Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define a proper user type here if needed
    }
  }
}

// Define custom error interface
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Initialize Express app
const app = express();

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
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const router: Router = express.Router();

// Add request time to all requests
router.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).requestTime = new Date().toISOString();
  next();
});

// Define interfaces for request bodies
interface CreateItemRequest extends Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'> {
  tags?: string[];
}

interface UpdateItemRequest extends Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt' | 'tags'>> {
  tags?: string[];
}

// Get all items with their tags
router.get('/items', (async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
}) as RequestHandler;
});

// Get all unique tags
router.get('/tags', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(tags.map(tag => tag.name));
  } catch (error) {
    console.error('Error fetching tags:', error);
    next(error);
  }
}) as RequestHandler;
});

// Get a single item by ID
router.get<{ id: string }>('/items/:id', (async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: { tags: true },
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Transform to match frontend's expected format
    const formattedItem = {
      ...item,
      tags: item.tags.map(tag => tag.name),
    };
    
    res.json(formattedItem);
  } catch (error) {
    console.error('Error fetching item:', error);
    next(error);
  }
}) as RequestHandler<{ id: string }>;
});

// Create a new item
router.post<{}, any, CreateItemRequest>('/items', (async (req, res, next) => {
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
  } catch (error) {
    console.error('Error creating item:', error);
    next(error);
  }
}) as RequestHandler<{}, any, CreateItemRequest>;
});

// Update an item
router.put<{ id: string }, any, UpdateItemRequest>('/items/:id', (async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, isConsumable, link, tags } = req.body as UpdateItemRequest;
    
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
  } catch (error) {
    console.error('Error updating item:', error);
    next(error);
  }
}) as RequestHandler<{ id: string }, any, UpdateItemRequest>;
});

// Delete an item
router.delete<{ id: string }>('/items/:id', (async (req, res, next) => {
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
  } catch (error) {
    console.error('Error deleting item:', error);
    next(error);
  }
}) as RequestHandler<{ id: string }>;
});

// Mount the router
app.use(API_PREFIX, router);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production error handling
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // 1) Log error
      console.error('ERROR 💥', err);
      
      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
});

// Start the server
// Only start the server if not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📚 API Documentation: http://localhost:${PORT}${API_PREFIX}/docs`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}

export default app;

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
