# Fleet Management API Documentation

This document provides a comprehensive guide to all API endpoints in the Fleet Management system. All authenticated endpoints require a valid JWT token in the Authorization header.

## Authentication

### Register Company with Admin User

Creates a new company account with an admin user.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "companyData": {
      "name": "Company Name",
      "address": "Street Address",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "phone": "555-123-4567",
      "email": "contact@company.com",
      "status": "active"
    },
    "adminData": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@company.com",
      "password": "Password123",
      "phone": "555-987-6543"
    }
  }
  ```
- **Response (201):**
  ```json
  {
    "status": "success",
    "data": {
      "token": "JWT_TOKEN",
      "user": {
        "id": "USER_ID",
        "email": "admin@company.com",
        "role": "admin"
      },
      "company": {
        "_id": "COMPANY_ID",
        "id": "COMPANY_ID",
        "name": "Company Name",
        "address": "Street Address",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "phone": "555-123-4567",
        "email": "contact@company.com",
        "status": "active",
        "createdAt": "TIMESTAMP",
        "updatedAt": "TIMESTAMP"
      }
    },
    "message": "Company and admin user created successfully"
  }
  ```

### Login

Authenticates a user and returns a token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "admin@company.com",
    "password": "Password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "token": "JWT_TOKEN",
      "user": {
        "id": "USER_ID",
        "email": "admin@company.com",
        "role": "admin"
      },
      "company": {
        "_id": "COMPANY_ID",
        "id": "COMPANY_ID",
        "name": "Company Name",
        "address": "Street Address",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "phone": "555-123-4567",
        "email": "contact@company.com",
        "status": "active"
      }
    }
  }
  ```

### Get Current User Profile

Gets the profile of the currently authenticated user.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "USER_ID",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@company.com",
        "role": "admin",
        "companyId": "COMPANY_ID",
        "status": "active",
        "createdAt": "TIMESTAMP",
        "updatedAt": "TIMESTAMP",
        "lastLogin": "TIMESTAMP"
      },
      "company": {
        "_id": "COMPANY_ID",
        "name": "Company Name",
        "address": "Street Address",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "phone": "555-123-4567",
        "email": "contact@company.com",
        "status": "active",
        "createdAt": "TIMESTAMP",
        "updatedAt": "TIMESTAMP"
      }
    }
  }
  ```

## Dashboard

### Get Active Counts

Retrieves counts and details of active vehicles and drivers.

- **URL:** `/api/dashboard/active-counts`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalActiveVehicles": 5,
      "totalActiveDrivers": 10,
      "activeVehicles": [
        {
          "_id": "VEHICLE_ID",
          "vehicleNumber": "V001",
          "make": "Volvo",
          "model": "VNL 860",
          "status": "active",
          "companyId": "COMPANY_ID"
        }
      ],
      "activeDrivers": [
        {
          "_id": "DRIVER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "status": "active",
          "companyId": "COMPANY_ID"
        }
      ]
    }
  }
  ```

### Get Active Vehicles

Retrieves a list of all active vehicles.

- **URL:** `/api/dashboard/active-vehicles`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalActiveVehicles": 5,
      "vehicles": [
        {
          "_id": "VEHICLE_ID",
          "vehicleNumber": "V001",
          "make": "Volvo",
          "model": "VNL 860",
          "status": "active",
          "companyId": "COMPANY_ID"
        }
      ]
    }
  }
  ```

### Get Active Drivers

Retrieves a list of all active drivers.

- **URL:** `/api/dashboard/active-drivers`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalActiveDrivers": 10,
      "drivers": [
        {
          "_id": "DRIVER_ID",
          "firstName": "John",
          "lastName": "Doe",
          "status": "active",
          "companyId": "COMPANY_ID"
        }
      ]
    }
  }
  ```

### Get Current Month Fuel Cost

Retrieves the fuel expenses for the current month.

- **URL:** `/api/dashboard/fuel/current-month`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalCost": 3500.75,
      "totalTransactions": 15,
      "fuelExpenses": [
        {
          "_id": "EXPENSE_ID",
          "expenseType": "fuel",
          "amount": 245.50,
          "date": "2023-07-15T00:00:00.000Z",
          "vehicleId": "VEHICLE_ID",
          "companyId": "COMPANY_ID"
        }
      ],
      "month": 7,
      "year": 2023
    }
  }
  ```

### Get Current Month Fuel By Vehicle

Retrieves the fuel expenses for the current month, grouped by vehicle.

- **URL:** `/api/dashboard/fuel/current-month/by-vehicle`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "vehicles": [
        {
          "_id": "VEHICLE_ID",
          "totalCost": 850.25,
          "totalTransactions": 5,
          "fuelExpenses": [
            {
              "_id": "EXPENSE_ID",
              "expenseType": "fuel",
              "amount": 175.50
            }
          ],
          "vehicleInfo": {
            "vehicleNumber": "V001",
            "make": "Volvo",
            "model": "VNL 860"
          },
          "month": 7,
          "year": 2023
        }
      ],
      "totalVehicles": 5,
      "month": 7,
      "year": 2023,
      "grandTotal": 3500.75
    }
  }
  ```

### Get Current Month Maintenance Cost

Retrieves the maintenance expenses for the current month.

- **URL:** `/api/dashboard/maintenance/current-month`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalCost": 2250.00,
      "totalTransactions": 8,
      "maintenanceExpenses": [
        {
          "_id": "EXPENSE_ID",
          "expenseType": "maintenance",
          "amount": 350.00,
          "date": "2023-07-10T00:00:00.000Z",
          "vehicleId": "VEHICLE_ID",
          "companyId": "COMPANY_ID"
        }
      ],
      "month": 7,
      "year": 2023
    }
  }
  ```

### Get Current Month Maintenance By Vehicle

Retrieves the maintenance expenses for the current month, grouped by vehicle.

- **URL:** `/api/dashboard/maintenance/current-month/by-vehicle`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "vehicles": [
        {
          "_id": "VEHICLE_ID",
          "totalCost": 750.00,
          "totalTransactions": 3,
          "maintenanceExpenses": [
            {
              "_id": "EXPENSE_ID",
              "expenseType": "maintenance",
              "amount": 250.00
            }
          ],
          "vehicleInfo": {
            "vehicleNumber": "V001",
            "make": "Volvo",
            "model": "VNL 860"
          },
          "month": 7,
          "year": 2023
        }
      ],
      "totalVehicles": 4,
      "month": 7,
      "year": 2023,
      "grandTotal": 2250.00
    }
  }
  ```

### Get Contract Statistics

Retrieves statistics about contracts, including total, active, and expiring soon.

- **URL:** `/api/dashboard/contracts/stats`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalContracts": 15,
      "activeContracts": 12,
      "expiringSoon": 3,
      "totalValue": 125000.00,
      "recentContracts": [
        {
          "_id": "CONTRACT_ID",
          "contractNumber": "C-2023-001",
          "value": 25000.00,
          "startDate": "2023-06-01T00:00:00.000Z",
          "endDate": "2023-12-31T00:00:00.000Z",
          "status": "active",
          "clientName": "Client Company"
        }
      ],
      "lastUpdated": "2023-07-15T14:25:36.123Z"
    }
  }
  ```

## Driver Management

### Get All Drivers

Retrieves a list of all drivers for the company.

- **URL:** `/api/drivers`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  [
    {
      "_id": "DRIVER_ID",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "licenseNumber": "DL123456789",
      "licenseExpiryDate": "2025-12-31T00:00:00.000Z",
      "status": "active",
      "companyId": "COMPANY_ID",
      "createdAt": "2023-03-15T10:30:00.000Z",
      "updatedAt": "2023-07-10T14:20:00.000Z"
    }
  ]
  ```

### Search Drivers

Searches drivers using specified criteria.

- **URL:** `/api/drivers/search`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
  - `name`: Search by first or last name
  - `status`: Filter by status
  - `licenseNumber`: Filter by license number
  - `minRating`: Filter by minimum rating
  - `assignedVehicle`: Filter by assigned vehicle ID
- **Response (200):**
  ```json
  [
    {
      "_id": "DRIVER_ID",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "companyId": "COMPANY_ID"
    }
  ]
  ```

### Get Driver By ID

Retrieves a specific driver by ID.

- **URL:** `/api/drivers/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "_id": "DRIVER_ID",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "licenseNumber": "DL123456789",
    "licenseExpiryDate": "2025-12-31T00:00:00.000Z",
    "address": "456 Driver Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "dateOfBirth": "1985-05-15T00:00:00.000Z",
    "dateOfHire": "2023-01-15T00:00:00.000Z",
    "status": "active",
    "companyId": "COMPANY_ID",
    "createdAt": "2023-03-15T10:30:00.000Z",
    "updatedAt": "2023-07-10T14:20:00.000Z"
  }
  ```

### Create Driver

Creates a new driver.

- **URL:** `/api/drivers`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "licenseNumber": "DL123456789",
    "licenseExpiryDate": "2025-12-31",
    "address": "456 Driver Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "dateOfBirth": "1985-05-15",
    "dateOfHire": "2023-01-15",
    "status": "active"
  }
  ```
- **Response (201):**
  ```json
  {
    "status": "success",
    "message": "Driver created successfully",
    "_id": "DRIVER_ID",
    "driver": {
      "_id": "DRIVER_ID",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "licenseNumber": "DL123456789",
      "licenseExpiryDate": "2025-12-31T00:00:00.000Z",
      "address": "456 Driver Ave",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601",
      "dateOfBirth": "1985-05-15T00:00:00.000Z",
      "dateOfHire": "2023-01-15T00:00:00.000Z",
      "status": "active",
      "companyId": "COMPANY_ID",
      "createdAt": "2023-07-15T15:30:00.000Z",
      "updatedAt": "2023-07-15T15:30:00.000Z"
    }
  }
  ```

### Update Driver

Updates an existing driver.

- **URL:** `/api/drivers/:id`
- **Method:** `PUT`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-999-8888",
    "licenseExpiryDate": "2026-12-31",
    "status": "active"
  }
  ```
- **Response (200):**
  ```json
  {
    "status": "success",
    "message": "Driver updated successfully",
    "driver": {
      "_id": "DRIVER_ID",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-999-8888",
      "licenseExpiryDate": "2026-12-31T00:00:00.000Z",
      "status": "active",
      "companyId": "COMPANY_ID",
      "updatedAt": "2023-07-15T16:30:00.000Z"
    }
  }
  ```

### Delete Driver

Deletes a driver.

- **URL:** `/api/drivers/:id`
- **Method:** `DELETE`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "message": "Driver deleted successfully"
  }
  ```

## Expense Management

### Get All Expenses

Retrieves all expenses.

- **URL:** `/api/expenses`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  [
    {
      "_id": "EXPENSE_ID",
      "expenseType": "fuel",
      "amount": 245.50,
      "date": "2023-07-15T00:00:00.000Z",
      "description": "Fuel refill",
      "vehicleId": "VEHICLE_ID",
      "driverId": "DRIVER_ID",
      "vendor": "Gas Station",
      "receiptNumber": "R-12345",
      "paymentMethod": "credit card",
      "companyId": "COMPANY_ID",
      "createdAt": "2023-07-15T15:30:00.000Z",
      "updatedAt": "2023-07-15T15:30:00.000Z"
    }
  ]
  ```

### Get Expense Summary

Retrieves a summary of expenses.

- **URL:** `/api/expenses/summary`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "totalExpenses": 8500.25,
      "fuelExpenses": 3500.75,
      "maintenanceExpenses": 2250.00,
      "otherExpenses": 2749.50,
      "expensesByMonth": [
        {
          "month": "July 2023",
          "total": 8500.25
        }
      ]
    }
  }
  ```

### Get Monthly Expenses

Retrieves expenses grouped by month.

- **URL:** `/api/expenses/monthly`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
  - `year`: Filter by year (default: current year)
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "expenses": [
        {
          "month": 7,
          "year": 2023,
          "totalAmount": 8500.25,
          "expenses": [
            {
              "_id": "EXPENSE_ID",
              "expenseType": "fuel",
              "amount": 245.50
            }
          ]
        }
      ],
      "totalAmount": 8500.25
    }
  }
  ```

### Get Yearly Expenses

Retrieves expenses grouped by year.

- **URL:** `/api/expenses/yearly`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "expenses": [
        {
          "year": 2023,
          "totalAmount": 45250.75,
          "expenses": [
            {
              "month": 7,
              "totalAmount": 8500.25
            }
          ]
        }
      ],
      "totalAmount": 45250.75
    }
  }
  ```

### Get Expenses By Category

Retrieves expenses grouped by category (for pie charts).

- **URL:** `/api/expenses/by-category`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
  - `startDate`: Start date filter (YYYY-MM-DD)
  - `endDate`: End date filter (YYYY-MM-DD)
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "categories": [
        {
          "category": "fuel",
          "totalAmount": 3500.75,
          "percentage": 41.2
        },
        {
          "category": "maintenance",
          "totalAmount": 2250.00,
          "percentage": 26.5
        },
        {
          "category": "others",
          "totalAmount": 2749.50,
          "percentage": 32.3
        }
      ],
      "totalAmount": 8500.25
    }
  }
  ```

### Get Expenses By Vehicle

Retrieves expenses for a specific vehicle.

- **URL:** `/api/expenses/vehicle/:vehicleId`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "vehicle": {
        "_id": "VEHICLE_ID",
        "vehicleNumber": "V001",
        "make": "Volvo",
        "model": "VNL 860"
      },
      "expenses": [
        {
          "_id": "EXPENSE_ID",
          "expenseType": "fuel",
          "amount": 245.50,
          "date": "2023-07-15T00:00:00.000Z"
        }
      ],
      "totalAmount": 1850.25
    }
  }
  ```

### Create Expense

Creates a new expense.

- **URL:** `/api/expenses`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "expenseType": "maintenance",
    "amount": 350.75,
    "date": "2023-07-15",
    "description": "Oil change and basic maintenance",
    "vehicleId": "VEHICLE_ID",
    "driverId": "DRIVER_ID",
    "vendor": "Truck Service Center",
    "receiptNumber": "R-12345",
    "paymentMethod": "credit card"
  }
  ```
- **Response (201):**
  ```json
  {
    "status": "success",
    "_id": "EXPENSE_ID",
    "expenseType": "maintenance",
    "amount": 350.75,
    "date": "2023-07-15T00:00:00.000Z",
    "description": "Oil change and basic maintenance",
    "vehicleId": "VEHICLE_ID",
    "driverId": "DRIVER_ID",
    "vendor": "Truck Service Center",
    "receiptNumber": "R-12345",
    "paymentMethod": "credit card",
    "companyId": "COMPANY_ID",
    "createdAt": "2023-07-15T16:30:00.000Z",
    "updatedAt": "2023-07-15T16:30:00.000Z"
  }
  ```

## Vehicle Management

### Get All Vehicles

Retrieves a list of all vehicles for the company.

- **URL:** `/api/vehicles`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  [
    {
      "_id": "VEHICLE_ID",
      "vehicleNumber": "V001",
      "make": "Volvo",
      "model": "VNL 860",
      "year": 2022,
      "vin": "1HGCM82633A123456",
      "licensePlate": "TRK-1234",
      "registrationExpiry": "2024-12-31T00:00:00.000Z",
      "status": "active",
      "fuelType": "diesel",
      "tankCapacity": 150,
      "currentOdometer": 15250,
      "companyId": "COMPANY_ID",
      "createdAt": "2023-03-15T10:30:00.000Z",
      "updatedAt": "2023-07-10T14:20:00.000Z"
    }
  ]
  ```

### Create Vehicle

Creates a new vehicle.

- **URL:** `/api/vehicles`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "vehicleNumber": "V001",
    "make": "Volvo",
    "model": "VNL 860",
    "year": 2022,
    "vin": "1HGCM82633A123456",
    "licensePlate": "TRK-1234",
    "registrationExpiry": "2024-12-31",
    "status": "active",
    "fuelType": "diesel",
    "tankCapacity": 150,
    "currentOdometer": 0,
    "purchaseDate": "2023-01-01",
    "purchasePrice": 150000
  }
  ```
- **Response (201):**
  ```json
  {
    "status": "success",
    "_id": "VEHICLE_ID",
    "vehicleNumber": "V001",
    "make": "Volvo",
    "model": "VNL 860",
    "year": 2022,
    "vin": "1HGCM82633A123456",
    "licensePlate": "TRK-1234",
    "registrationExpiry": "2024-12-31T00:00:00.000Z",
    "status": "active",
    "fuelType": "diesel",
    "tankCapacity": 150,
    "currentOdometer": 0,
    "purchaseDate": "2023-01-01T00:00:00.000Z",
    "purchasePrice": 150000,
    "companyId": "COMPANY_ID",
    "createdAt": "2023-07-15T16:30:00.000Z",
    "updatedAt": "2023-07-15T16:30:00.000Z"
  }
  ```

## User Management

### Get All Users

Retrieves all users for the company.

- **URL:** `/api/users`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "status": "success",
    "data": {
      "users": [
        {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@company.com",
          "phone": "555-987-6543",
          "role": "admin",
          "status": "active",
          "companyId": "COMPANY_ID",
          "createdAt": "2023-03-15T10:30:00.000Z",
          "updatedAt": "2023-07-10T14:20:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```

### Create User

Creates a new user for the company.

- **URL:** `/api/users`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "firstName": "Manager",
    "lastName": "User",
    "email": "manager@company.com",
    "phone": "555-123-9876",
    "role": "manager",
    "status": "active",
    "password": "Password123"
  }
  ```
- **Response (201):**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "USER_ID",
        "firstName": "Manager",
        "lastName": "User",
        "email": "manager@company.com",
        "phone": "555-123-9876",
        "role": "manager",
        "status": "active",
        "companyId": "COMPANY_ID",
        "createdAt": "2023-07-15T16:30:00.000Z",
        "updatedAt": "2023-07-15T16:30:00.000Z"
      }
    }
  }
  ```

## Notes Management

### Get All Notes

Retrieves all notes for the company.

- **URL:** `/api/notes`
- **Method:** `GET`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "notes": [
      {
        "_id": "NOTE_ID",
        "title": "Note Title",
        "content": "Note content text",
        "category": "General",
        "priority": "medium",
        "status": "active",
        "reminder": {
          "date": "2023-08-15T10:00:00.000Z",
          "whatsappNumber": "+1234567890"
        },
        "companyId": "COMPANY_ID",
        "createdAt": "2023-07-15T16:30:00.000Z",
        "updatedAt": "2023-07-15T16:30:00.000Z"
      }
    ]
  }
  ```

### Create Note

Creates a new note.

- **URL:** `/api/notes`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "title": "Note Title",
    "content": "Note content text",
    "category": "General",
    "priority": "medium",
    "status": "active",
    "reminder": {
      "date": "2023-08-15T10:00:00",
      "whatsappNumber": "+1234567890"
    }
  }
  ```
- **Response (201):**
  ```json
  {
    "_id": "NOTE_ID",
    "title": "Note Title",
    "content": "Note content text",
    "category": "General",
    "priority": "medium",
    "status": "active",
    "reminder": {
      "date": "2023-08-15T10:00:00.000Z",
      "whatsappNumber": "+1234567890"
    },
    "companyId": "COMPANY_ID",
    "createdAt": "2023-07-15T16:30:00.000Z",
    "updatedAt": "2023-07-15T16:30:00.000Z"
  }
  ```

### Update Note

Updates an existing note.

- **URL:** `/api/notes/:id`
- **Method:** `PUT`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content text",
    "category": "General",
    "priority": "high",
    "status": "active"
  }
  ```
- **Response (200):**
  ```json
  {
    "_id": "NOTE_ID",
    "title": "Updated Title",
    "content": "Updated content text",
    "category": "General",
    "priority": "high",
    "status": "active",
    "reminder": null,
    "companyId": "COMPANY_ID",
    "createdAt": "2023-07-15T16:30:00.000Z",
    "updatedAt": "2023-07-15T17:45:00.000Z"
  }
  ```

### Delete Note

Deletes a note.

- **URL:** `/api/notes/:id`
- **Method:** `DELETE`
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "message": "Note deleted successfully"
  }
  ```

## Health Check

### API Health Check

Checks if the API server is running and connected to MongoDB.

- **URL:** `/api/health`
- **Method:** `GET`
- **Authentication:** None
- **Response (200):**
  ```json
  {
    "status": "ok",
    "message": "API server is running and connected to MongoDB"
  }
  ```

## Authorization and Error Handling

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Error Responses

- **401 Unauthorized**
  ```json
  {
    "status": "error",
    "message": "No authentication token provided"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "status": "error",
    "message": "Access denied"
  }
  ```

- **404 Not Found**
  ```json
  {
    "status": "error",
    "message": "Resource not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "status": "error",
    "message": "Internal server error",
    "error": "Error details"
  }
  ``` 