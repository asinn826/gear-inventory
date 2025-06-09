# Camping Gear Inventory

A camping gear inventory management application built with React, TypeScript, Chakra UI, and Prisma.

## Features

- View all your camping gear in one place
- Add, edit, and delete items
- Categorize items with tags
- Search and filter your gear
- Responsive design for all devices

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git
- A Neon database account (for production)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/camping-gear-inventory.git
   cd camping-gear-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your local development settings.

4. **Set up the database**
   ```bash
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   # Start both frontend and backend
   npm run dev:all
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Deployment

### Prerequisites

- A Netlify account
- A Neon database (for production)

### Steps

1. **Prepare your production environment**
   - Create a new project in the [Neon Console](https://console.neon.tech/)
   - Get your connection string from the "Connection Details" tab

2. **Deploy to Netlify**
   - Push your code to a GitHub repository
   - Connect the repository to Netlify
   - Add environment variables in Netlify:
     - `DATABASE_URL`: Your Neon database connection string
     - `NODE_ENV`: `production`

3. **Run database migrations**
   ```bash
   DATABASE_URL="your_neon_connection_string" npx prisma migrate deploy
   ```

4. **Your app should now be live!**

## Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run dev:server` - Start the backend development server
- `npm run dev:all` - Start both frontend and backend servers
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run prisma:studio` - Open Prisma Studio to manage your database

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Chakra UI
- **Backend**: Node.js, Express
- **Database**: SQLite (development), PostgreSQL with Neon (production)
- **ORM**: Prisma
- **Deployment**: Netlify, Netlify Functions

## License

MIT
