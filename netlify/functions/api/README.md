# Netlify Functions API

This directory contains the Netlify Functions for the Gear Inventory application. These functions handle server-side logic and API endpoints.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Netlify CLI (for local development)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   Copy `.env.example` to `.env` and update the values as needed.

   ```bash
   cp .env.example .env
   ```

### Development

- Start the development server:

  ```bash
  npm run dev
  ```

- The API will be available at `http://localhost:8888/.netlify/functions/api`

### Building for Production

```bash
npm run build
```

This will compile TypeScript files to JavaScript in the `dist` directory.

## Project Structure

- `src/` - Source files
  - `index.ts` - Main entry point for the Netlify function
  - `server-proxy.ts` - Express app proxy for handling HTTP requests
- `dist/` - Compiled JavaScript files (generated)
- `types/` - TypeScript type definitions

## Available Scripts

- `npm run build` - Compile TypeScript files
- `npm run dev` - Start the development server
- `npm start` - Run the compiled JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm run lint` - Lint the codebase
- `npm run format` - Format the code using Prettier
- `npm run type-check` - Type-check the codebase

## Environment Variables

Create a `.env` file in the root of this directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gear_inventory"

# Netlify
NETLIFY_DEV=true
```

## Deployment

This project is configured to be deployed to Netlify. The deployment process is handled automatically when changes are pushed to the main branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
