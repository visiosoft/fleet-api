const express = require('express');
const router = express.Router();
const costController = require('../controllers/costController');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all cost routes
router.use(authenticate);

/**
 * @swagger
 * /api/costs/vehicles:
 *   get:
 *     summary: Get total costs for all vehicles
 *     tags: [Costs]
 *     responses:
 *       200:
 *         description: List of vehicle costs with totals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vehicleId:
 *                         type: string
 *                       vehicleName:
 *                         type: string
 *                       costs:
 *                         type: object
 *                         properties:
 *                           expenses:
 *                             type: number
 *                           fuel:
 *                             type: number
 *                           maintenance:
 *                             type: number
 *                           total:
 *                             type: number
 *                 totals:
 *                   type: object
 *                   properties:
 *                     totalExpenses:
 *                       type: number
 *                     totalFuel:
 *                       type: number
 *                     totalMaintenance:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get('/vehicles', costController.getVehicleCosts);

/**
 * @swagger
 * /api/costs/vehicles/{vehicleId}:
 *   get:
 *     summary: Get detailed cost breakdown for a specific vehicle
 *     tags: [Costs]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed cost breakdown for the vehicle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     licensePlate:
 *                       type: string
 *                 costs:
 *                   type: object
 *                   properties:
 *                     expenses:
 *                       type: number
 *                     fuel:
 *                       type: number
 *                     maintenance:
 *                       type: number
 *                     total:
 *                       type: number
 *                 details:
 *                   type: object
 *                   properties:
 *                     expenses:
 *                       type: array
 *                       items:
 *                         type: object
 *                     fuel:
 *                       type: array
 *                       items:
 *                         type: object
 *                     maintenance:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Server error
 */
router.get('/vehicles/:vehicleId', costController.getVehicleCostBreakdown);

/**
 * @swagger
 * /api/costs/current-month:
 *   get:
 *     summary: Get current month's expenses for all vehicles
 *     tags: [Costs]
 *     responses:
 *       200:
 *         description: Current month's expenses for all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vehicleId:
 *                         type: string
 *                       vehicleName:
 *                         type: string
 *                       expenses:
 *                         type: number
 *                       details:
 *                         type: array
 *                         items:
 *                           type: object
 *                 total:
 *                   type: number
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date-time
 *                     end:
 *                       type: string
 *                       format: date-time
 */
router.get('/current-month', costController.getCurrentMonthExpenses);

/**
 * @swagger
 * /api/costs/current-month/{vehicleId}:
 *   get:
 *     summary: Get current month's expenses for a specific vehicle
 *     tags: [Costs]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current month's expenses for the vehicle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vehicle:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     licensePlate:
 *                       type: string
 *                 expenses:
 *                   type: number
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date-time
 *                     end:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Vehicle not found
 */
router.get('/current-month/:vehicleId', costController.getCurrentMonthVehicleExpenses);

// Test endpoint to check collection counts
router.get('/test-counts', async (req, res) => {
    try {
        const expenses = await db.getCollection('expenses');
        const fuel = await db.getCollection('fuel');
        const maintenance = await db.getCollection('maintenance');
        
        const [expensesCount, fuelCount, maintenanceCount] = await Promise.all([
            expenses.countDocuments(),
            fuel.countDocuments(),
            maintenance.countDocuments()
        ]);

        res.json({
            expenses: expensesCount,
            fuel: fuelCount,
            maintenance: maintenanceCount
        });
    } catch (error) {
        console.error('Error checking collection counts:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 