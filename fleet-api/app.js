const vehicleRoutes = require('./routes/vehicleRoutes');
const fuelRoutes = require('./routes/fuelRoutes');

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel', fuelRoutes); 