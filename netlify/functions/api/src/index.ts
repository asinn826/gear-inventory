// Import the Express app from our server
import { app } from '../../../../server/index';
import { Handler } from '@netlify/functions';

// Create a simple handler that forwards requests to Express
export const handler: Handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  // Create a mock request object for Express
  const request = {
    method: event.httpMethod,
    path: event.path.replace(/^\/.netlify\/functions\/api/, ''),
    headers: event.headers || {},
    body: event.body ? JSON.parse(event.body) : {},
    query: event.queryStringParameters || {},
    params: {},
  };

  // Create a mock response object
  const response: any = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: function(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    end: function(data?: string) {
      if (data) this.body = data;
      return this;
    },
    json: function(data: any) {
      this.setHeader('content-type', 'application/json');
      this.body = JSON.stringify(data);
      return this;
    },
    status: function(statusCode: number) {
      this.statusCode = statusCode;
      return this;
    },
    send: function(data: string) {
      this.body = data;
      return this;
    },
  };

  try {
    // Handle the request with Express
    await new Promise<void>((resolve, reject) => {
      // @ts-ignore - We're using a simplified request/response
      app(request, response, (err?: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Return the response in the format Netlify expects
    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (error: unknown) {
    console.error('Error in API function:', error);
    
    // Prepare error response
    const errorResponse: Record<string, any> = {
      status: 'error',
      message: 'Internal Server Error'
    };
    
    // Add more details in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
      errorResponse.event = event;
    }
    
    // Log the full error for debugging
    console.error('Full error:', JSON.stringify(errorResponse, null, 2));
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};
