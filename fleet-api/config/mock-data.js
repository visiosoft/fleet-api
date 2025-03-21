/**
 * Mock data for testing when MongoDB is not available
 */

const { ObjectId } = require('mongodb');

// Generate random IDs
const generateId = () => new ObjectId();

// Create vehicle IDs for reference
const vehicleIds = [
  generateId(),
  generateId(),
  generateId(),
  generateId(),
  generateId()
];

// Mock drivers data
const driversData = [
  {
    _id: generateId(),
    firstName: 'John',
    lastName: 'Doe',
    licenseNumber: 'DL12345678',
    licenseExpiry: new Date('2025-05-15'),
    contact: {
      phone: '555-123-4567',
      email: 'john.doe@example.com',
      address: '123 Main St, City, State, 12345'
    },
    status: 'Active',
    rating: 4.5,
    assignedVehicle: vehicleIds[0],
    hireDate: new Date('2020-03-10'),
    employeeId: 'EMP001',
    certifications: ['Hazmat', 'Commercial'],
    notes: 'Reliable driver with excellent safety record',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '555-987-6543'
    }
  },
  {
    _id: generateId(),
    firstName: 'Sarah',
    lastName: 'Smith',
    licenseNumber: 'DL98765432',
    licenseExpiry: new Date('2026-07-22'),
    contact: {
      phone: '555-222-3333',
      email: 'sarah.smith@example.com',
      address: '456 Oak Ave, City, State, 12345'
    },
    status: 'Active',
    rating: 4.8,
    assignedVehicle: vehicleIds[1],
    hireDate: new Date('2021-06-15'),
    employeeId: 'EMP025',
    certifications: ['Commercial', 'Passenger'],
    notes: 'Excellent customer service skills',
    emergencyContact: {
      name: 'Mike Smith',
      relationship: 'Brother',
      phone: '555-444-5555'
    }
  },
  {
    _id: generateId(),
    firstName: 'Michael',
    lastName: 'Johnson',
    licenseNumber: 'DL45678901',
    licenseExpiry: new Date('2024-11-30'),
    contact: {
      phone: '555-777-8888',
      email: 'michael.j@example.com',
      address: '789 Pine St, City, State, 12345'
    },
    status: 'On Leave',
    rating: 3.7,
    assignedVehicle: null,
    hireDate: new Date('2019-09-20'),
    employeeId: 'EMP013',
    certifications: ['Commercial'],
    notes: 'Currently on medical leave until 12/15/2023',
    emergencyContact: {
      name: 'Lisa Johnson',
      relationship: 'Spouse',
      phone: '555-999-0000'
    }
  },
  {
    _id: generateId(),
    firstName: 'Emily',
    lastName: 'Williams',
    licenseNumber: 'DL78901234',
    licenseExpiry: new Date('2025-12-10'),
    contact: {
      phone: '555-333-2222',
      email: 'emily.w@example.com',
      address: '101 Elm St, City, State, 12345'
    },
    status: 'Active',
    rating: 5.0,
    assignedVehicle: vehicleIds[2],
    hireDate: new Date('2022-01-05'),
    employeeId: 'EMP042',
    certifications: ['Commercial', 'Hazmat', 'Tanker'],
    notes: 'Top-rated driver, perfect safety record',
    emergencyContact: {
      name: 'Robert Williams',
      relationship: 'Father',
      phone: '555-111-2222'
    }
  },
  {
    _id: generateId(),
    firstName: 'David',
    lastName: 'Brown',
    licenseNumber: 'DL23456789',
    licenseExpiry: new Date('2024-08-25'),
    contact: {
      phone: '555-444-3333',
      email: 'david.b@example.com',
      address: '202 Maple Ave, City, State, 12345'
    },
    status: 'Inactive',
    rating: 3.2,
    assignedVehicle: null,
    hireDate: new Date('2018-11-15'),
    employeeId: 'EMP007',
    certifications: ['Commercial'],
    notes: 'Performance issues, needs improvement',
    emergencyContact: {
      name: 'Susan Brown',
      relationship: 'Spouse',
      phone: '555-666-7777'
    }
  }
];

// Mock vehicles data
const vehiclesData = [
  {
    _id: vehicleIds[0],
    make: 'Ford',
    model: 'F-150',
    year: 2022,
    licensePlate: 'XYZ-1234',
    vin: '1FTEW1EP5MFA12345',
    type: 'Pickup',
    status: 'Active',
    fuelType: 'Gasoline',
    mileage: 15250,
    lastService: new Date('2023-08-10'),
    nextServiceDue: new Date('2023-11-10'),
    assignedDriver: driversData[0]._id,
    purchaseDate: new Date('2022-03-15'),
    purchasePrice: 45000,
    registrationExpiry: new Date('2024-03-15')
  },
  {
    _id: vehicleIds[1],
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    licensePlate: 'ABC-5678',
    vin: '4T1BF1FK5MU123456',
    type: 'Sedan',
    status: 'Active',
    fuelType: 'Hybrid',
    mileage: 22150,
    lastService: new Date('2023-07-22'),
    nextServiceDue: new Date('2023-10-22'),
    assignedDriver: driversData[1]._id,
    purchaseDate: new Date('2021-05-20'),
    purchasePrice: 32000,
    registrationExpiry: new Date('2024-05-20')
  },
  {
    _id: vehicleIds[2],
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2023,
    licensePlate: 'DEF-9012',
    vin: '3GCUYDED5PG123456',
    type: 'Pickup',
    status: 'Active',
    fuelType: 'Diesel',
    mileage: 8500,
    lastService: new Date('2023-09-05'),
    nextServiceDue: new Date('2023-12-05'),
    assignedDriver: driversData[3]._id,
    purchaseDate: new Date('2023-01-10'),
    purchasePrice: 52000,
    registrationExpiry: new Date('2024-01-10')
  },
  {
    _id: vehicleIds[3],
    make: 'Honda',
    model: 'CR-V',
    year: 2022,
    licensePlate: 'GHI-3456',
    vin: '7FARW2H57NE123456',
    type: 'SUV',
    status: 'Maintenance',
    fuelType: 'Gasoline',
    mileage: 18750,
    lastService: new Date('2023-08-28'),
    nextServiceDue: new Date('2023-11-28'),
    assignedDriver: null,
    purchaseDate: new Date('2022-04-12'),
    purchasePrice: 38000,
    registrationExpiry: new Date('2024-04-12')
  },
  {
    _id: vehicleIds[4],
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    licensePlate: 'JKL-7890',
    vin: '5YJ3E1EA1PF123456',
    type: 'Sedan',
    status: 'Active',
    fuelType: 'Electric',
    mileage: 12300,
    lastService: new Date('2023-09-15'),
    nextServiceDue: new Date('2023-12-15'),
    assignedDriver: null,
    purchaseDate: new Date('2023-02-05'),
    purchasePrice: 60000,
    registrationExpiry: new Date('2024-02-05')
  }
];

// Mock maintenance records
const maintenanceData = [
  {
    _id: generateId(),
    vehicleId: vehicleIds[0],
    type: 'Routine',
    description: 'Oil change and filter replacement',
    date: new Date('2023-08-10'),
    mileage: 15000,
    cost: 85.99,
    facility: 'Quick Lube Center',
    technician: 'Mike Wilson',
    parts: [
      { name: 'Oil Filter', cost: 12.99 },
      { name: 'Motor Oil', cost: 45.00 }
    ],
    notes: 'Recommended tire rotation next service'
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[1],
    type: 'Routine',
    description: 'Brake pad replacement',
    date: new Date('2023-07-22'),
    mileage: 22000,
    cost: 350.50,
    facility: 'City Auto Repair',
    technician: 'Sarah Johnson',
    parts: [
      { name: 'Front Brake Pads', cost: 120.00 },
      { name: 'Rear Brake Pads', cost: 120.00 }
    ],
    notes: 'Rotors still in good condition'
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[2],
    type: 'Routine',
    description: 'First service check',
    date: new Date('2023-09-05'),
    mileage: 8000,
    cost: 150.00,
    facility: 'Chevrolet Dealership',
    technician: 'Robert Smith',
    parts: [],
    notes: 'All systems checked, no issues found'
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[3],
    type: 'Repair',
    description: 'Transmission repair',
    date: new Date('2023-08-28'),
    mileage: 18500,
    cost: 1250.75,
    facility: 'AAA Transmission Specialists',
    technician: 'Alex Davis',
    parts: [
      { name: 'Transmission Fluid', cost: 45.00 },
      { name: 'Gasket Set', cost: 85.00 },
      { name: 'Solenoid', cost: 220.00 }
    ],
    notes: 'Vehicle experiencing hard shifts, complete transmission service performed'
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[4],
    type: 'Routine',
    description: 'Tire rotation and alignment',
    date: new Date('2023-09-15'),
    mileage: 12000,
    cost: 120.00,
    facility: 'Tire Zone',
    technician: 'James Wilson',
    parts: [],
    notes: 'Tires showing even wear, no concerns'
  }
];

// Mock fuel records
const fuelData = [
  {
    _id: generateId(),
    vehicleId: vehicleIds[0],
    date: new Date('2023-09-25'),
    gallons: 18.5,
    pricePerGallon: 3.45,
    totalCost: 63.83,
    mileage: 15250,
    fuelType: 'Regular Unleaded',
    location: 'Shell Station - Main St',
    driver: driversData[0]._id,
    fullTank: true,
    notes: ''
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[1],
    date: new Date('2023-09-23'),
    gallons: 12.2,
    pricePerGallon: 3.39,
    totalCost: 41.36,
    mileage: 22150,
    fuelType: 'Regular Unleaded',
    location: 'Costco Gas - North Mall',
    driver: driversData[1]._id,
    fullTank: true,
    notes: ''
  },
  {
    _id: generateId(),
    vehicleId: vehicleIds[2],
    date: new Date('2023-09-20'),
    gallons: 22.5,
    pricePerGallon: 4.05,
    totalCost: 91.13,
    mileage: 8500,
    fuelType: 'Diesel',
    location: 'Truck Stop #42 - Highway 15',
    driver: driversData[3]._id,
    fullTank: true,
    notes: 'Higher price due to remote location'
  }
];

// Mock contracts
const contractsData = [
  {
    _id: generateId(),
    name: 'City Delivery Services',
    client: {
      name: 'City Distribution Inc',
      contact: 'Mark Thompson',
      email: 'mark.t@citydist.com',
      phone: '555-111-2222'
    },
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    value: 125000,
    status: 'Active',
    vehicles: [vehicleIds[0], vehicleIds[1]],
    drivers: [driversData[0]._id, driversData[1]._id],
    terms: 'Weekly delivery services for City Distribution Inc. Monday through Friday.',
    paymentTerms: 'Net 30',
    notes: 'Client may request weekend deliveries at additional cost'
  },
  {
    _id: generateId(),
    name: 'Medical Supply Transport',
    client: {
      name: 'MediHealth Services',
      contact: 'Andrea Wilson',
      email: 'andrea@medihealth.org',
      phone: '555-333-4444'
    },
    startDate: new Date('2023-03-15'),
    endDate: new Date('2024-03-14'),
    value: 95000,
    status: 'Active',
    vehicles: [vehicleIds[2]],
    drivers: [driversData[3]._id],
    terms: 'Transportation of medical supplies to various MediHealth facilities',
    paymentTerms: 'Net 15',
    notes: 'Special handling procedures required for certain materials'
  }
];

// Export all mock data
module.exports = {
  drivers: driversData,
  vehicles: vehiclesData,
  maintenance: maintenanceData,
  fuel: fuelData,
  contracts: contractsData
}; 