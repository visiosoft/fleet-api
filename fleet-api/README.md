# Fleet Management API

Backend API server for the Fleet Management application. This server connects to MongoDB and provides REST endpoints for the frontend application.

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=fleet-management
   ```

3. Start the server:
   ```
   npm start
   ```

   For development with automatic restart:
   ```
   npm run dev
   ```

## API Endpoints

### Dedicated Driver API

The API provides a dedicated, structured endpoint for driver management:

- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get a specific driver by ID
- `POST /api/drivers` - Create a new driver (with validation)
- `PUT /api/drivers/:id` - Update an existing driver
- `DELETE /api/drivers/:id` - Delete a driver
- `GET /api/drivers/search` - Search drivers using filters like:
  - `?name=John` - Search by first or last name
  - `?status=Active` - Filter by status
  - `?licenseNumber=ABC123` - Filter by license number
  - `?minRating=4` - Filter by minimum rating
  - `?assignedVehicle=123` - Filter by assigned vehicle ID

### Generic Collection Endpoints

The API server also provides generic endpoints for other collections:

- `GET /api/health` - Health check endpoint
- `GET /api/:collection` - Get all documents in a collection
- `GET /api/:collection/:id` - Get a specific document by ID
- `POST /api/:collection` - Create a new document
- `PUT /api/:collection/:id` - Update an existing document
- `DELETE /api/:collection/:id` - Delete a document
- `GET /api/:collection/search` - Search documents using query parameters

Collections available:
- vehicles
- maintenance
- fuel
- contracts

## Running with the Frontend

1. Start the API server (in the `fleet-api` directory):
   ```
   npm start
   ```

2. Start the React frontend (in the `fleet-management` directory):
   ```
   npm start
   ```

The API server runs on port 5000 by default, while the React app runs on port 3000. The React app is configured to proxy API requests to the backend server.

## Driver Data Schema

The driver schema includes the following fields:

```javascript
{
  firstName: String,       // Required
  lastName: String,        // Required
  licenseNumber: String,   // Required
  licenseExpiry: Date,
  contact: {
    phone: String,
    email: String,
    address: String
  },
  status: String,          // Active, Inactive, On Leave, Terminated
  rating: Number,          // 1-5 star rating
  assignedVehicle: ObjectId,  // Reference to vehicle
  hireDate: Date,
  employeeId: String,
  certifications: [String],
  notes: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  }
}
``` 