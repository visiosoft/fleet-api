import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  TablePagination,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon,
  Assignment as DocumentIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  CalendarMonth as CalendarIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';

const VehicleTable = () => {
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);

  // Status options for filtering
  const statusOptions = ['Active', 'Maintenance', 'Out of Service'];

  // Fetch vehicles from API
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Enhanced status chip color and style
  const getStatusStyle = (status) => {
    const baseStyle = {
      width: '100px',
      borderRadius: '4px',
      padding: '6px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
    };

    switch (status.toLowerCase()) {
      case 'active':
        return {
          ...baseStyle,
          backgroundColor: '#E8F5E9',
          color: '#2E7D32',
          border: '1px solid #A5D6A7',
        };
      case 'maintenance':
        return {
          ...baseStyle,
          backgroundColor: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FFCC80',
        };
      case 'out of service':
        return {
          ...baseStyle,
          backgroundColor: '#FFEBEE',
          color: '#C62828',
          border: '1px solid #EF9A9A',
        };
      default:
        return baseStyle;
    }
  };

  // Get vehicle type icon
  const getVehicleTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'truck':
        return <TruckIcon />;
      default:
        return <CarIcon />;
    }
  };

  // Filter vehicles based on search query and status
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      vehicle.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedVehicle) {
      try {
        await fetch(`/api/vehicles/${selectedVehicle._id}`, {
          method: 'DELETE',
        });
        fetchVehicles();
        setDeleteDialogOpen(false);
        setSelectedVehicle(null);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  // Format date to local string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#F5F5F5', p: 3 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#1976D2',
              fontWeight: 600
            }}>
              <CarIcon /> Vehicle Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {/* Handle add new vehicle */}}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Add New Vehicle
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Filter Status
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            setSelectedStatus('all');
            setFilterAnchorEl(null);
          }}
        >
          All Statuses
        </MenuItem>
        {statusOptions.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setFilterAnchorEl(null);
            }}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>

      {/* Vehicle Table */}
      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="vehicle table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                <TableCell sx={{ fontWeight: 600 }}>Vehicle Details</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Service Information</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                  <TableRow 
                    key={vehicle._id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: '#E3F2FD',
                            color: '#1976D2',
                            width: 48,
                            height: 48
                          }}
                        >
                          {getVehicleTypeIcon(vehicle.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {vehicle.make} {vehicle.model}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {vehicle.year} • {vehicle.type}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {vehicle.licensePlate}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          VIN: {vehicle.vin}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={getStatusStyle(vehicle.status)}>
                        {vehicle.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            Last: {formatDate(vehicle.lastService)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarIcon sx={{ fontSize: 16, color: vehicle.nextServiceDue <= new Date() ? 'error.main' : 'text.secondary' }} />
                          <Typography 
                            variant="body2"
                            color={vehicle.nextServiceDue <= new Date() ? 'error.main' : 'inherit'}
                          >
                            Next: {formatDate(vehicle.nextServiceDue)}
                            {vehicle.nextServiceDue <= new Date() && (
                              <Chip
                                label="Overdue"
                                color="error"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {vehicle.mileage.toLocaleString()} km
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {/* Handle edit */}}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.lighter' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedVehicle(vehicle);
                              setActionMenuAnchor(e.currentTarget);
                            }}
                            sx={{ 
                              color: 'action.active',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <TablePagination
            component="div"
            count={filteredVehicles.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              '.MuiTablePagination-select': {
                borderRadius: '8px',
              }
            }}
          />
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '8px',
            minWidth: '180px'
          }
        }}
      >
        <MenuItem onClick={() => {/* Handle fuel log */}}>
          <FuelIcon sx={{ mr: 2, color: 'primary.main' }} /> Fuel Log
        </MenuItem>
        <MenuItem onClick={() => {/* Handle maintenance */}}>
          <MaintenanceIcon sx={{ mr: 2, color: 'warning.main' }} /> Maintenance
        </MenuItem>
        <MenuItem onClick={() => {/* Handle documents */}}>
          <DocumentIcon sx={{ mr: 2, color: 'info.main' }} /> Documents
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            setActionMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '12px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vehicle?</Typography>
          {selectedVehicle && (
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleTable; 