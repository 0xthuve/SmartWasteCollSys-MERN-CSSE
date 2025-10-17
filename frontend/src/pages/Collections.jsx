import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Alert,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InboxIcon from "@mui/icons-material/Inbox";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RecyclingIcon from "@mui/icons-material/Recycling";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { api } from "../contexts/AuthContext";

export default function Collections() {
  const [bins, setBins] = useState([]);
  const [routePlans, setRoutePlans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const [newCollection, setNewCollection] = useState({
    truck: '',
    generalWaste: 0,
    recyclables: 0,
    organic: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [binsRes, plansRes, collectionsRes, trucksRes] = await Promise.all([
        api.getBins(),
        api.getRoutePlans(),
        api.getCollections(),
        api.getTrucks()
      ]);
      setBins(binsRes.data || []);
      setRoutePlans(plansRes.data || []);
      setCollections(collectionsRes.data || []);
      setTrucks(trucksRes.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load collection data',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCollection({
      truck: '',
      generalWaste: 0,
      recyclables: 0,
      organic: 0,
      notes: ''
    });
  };

  const handleCreateCollection = async () => {
    // Client-side validation
    if (!newCollection.truck) {
      setSnackbar({
        open: true,
        message: 'Please select a truck for the collection',
        severity: 'warning'
      });
      return;
    }

    // Check if truck is active
    const selectedTruck = trucks.find(t => t._id === newCollection.truck);
    if (selectedTruck && selectedTruck.status !== 'Active') {
      setSnackbar({
        open: true,
        message: 'Cannot create collection with an inactive truck. Please select an active truck.',
        severity: 'error'
      });
      return;
    }

    try {
      await api.createCollection(newCollection);
      handleCloseDialog();
      loadData(); // Refresh data
      setSnackbar({
        open: true,
        message: 'Collection created successfully!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to create collection',
        severity: 'error'
      });
    }
  };

  // Derived metrics from collections
  const totalCollections = collections.length || 0;
  const generalWaste = collections.reduce((s, c) => s + (c.generalWaste || 0), 0).toFixed(1);
  const recyclables = collections.reduce((s, c) => s + (c.recyclables || 0), 0).toFixed(1);
  const organicWaste = collections.reduce((s, c) => s + (c.organic || 0), 0).toFixed(1);

  // Filter collections based on search term
  const filteredCollections = collections.filter((collection) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      collection.truck?.plate?.toLowerCase().includes(searchLower) ||
      collection.notes?.toLowerCase().includes(searchLower) ||
      new Date(collection.date).toLocaleDateString().toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 3 }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "success.main" }}>EC</Avatar>
          <Typography variant="h5" fontWeight={700}>
            Collections
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search collections..."
            size="small"
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>E</Avatar>
        </Box>
      </Box>

      {/* Create Collection Dialog */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={0}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="subtitle1" color="text.secondary">Collections</Typography>
            <Typography variant="h6" fontWeight={700}>Track and manage waste collection operations</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EventAvailableIcon />}
              sx={{ textTransform: "none", borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              Schedule
            </Button>

            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleOpenDialog}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                backgroundColor: "success.main",
                "&:hover": { backgroundColor: "success.dark" },
              }}
            >
              New Collection
            </Button>
          </Box>
        </Box>

        {/* Statistic Cards with Icons */}
        <Grid container spacing={3}>
          {/* Today's Collections */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: "#e6f6ef", color: "success.main" }}>
                <InboxIcon />
              </Avatar>
              <CardContent sx={{ py: 0, px: 1 }}>
                <Typography variant="h5" fontWeight={700}>{totalCollections}</Typography>
                <Typography variant="body2" color="text.secondary">Today's Collections</Typography>
                <Typography variant="caption" color="success.main">↑ 8 more than yesterday</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* General Waste */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: "#fff3f3", color: "error.main" }}>
                <DeleteOutlineIcon />
              </Avatar>
              <CardContent sx={{ py: 0, px: 1 }}>
                <Typography variant="h5" fontWeight={700}>{generalWaste} tons</Typography>
                <Typography variant="body2" color="text.secondary">General Waste</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recyclables */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: "#f0fbff", color: "info.main" }}>
                <RecyclingIcon />
              </Avatar>
              <CardContent sx={{ py: 0, px: 1 }}>
                <Typography variant="h5" fontWeight={700}>{recyclables} tons</Typography>
                <Typography variant="body2" color="text.secondary">Recyclables</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Organic Waste */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: "#f3fff4", color: "success.main" }}>
                <VolunteerActivismIcon />
              </Avatar>
              <CardContent sx={{ py: 0, px: 1 }}>
                <Typography variant="h5" fontWeight={700}>{organicWaste} tons</Typography>
                <Typography variant="body2" color="text.secondary">Organic Waste</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Collections */}
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
        <Typography variant="h6" fontWeight={600} mb={2}>Recent Collections</Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>General Waste</TableCell>
                <TableCell>Recyclables</TableCell>
                <TableCell>Organic Waste</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCollections.slice(0, 10).map((collection) => (
                <TableRow key={collection._id}>
                  <TableCell>
                    {new Date(collection.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Try to get truck info from populated field first
                      if (collection.truck?.plate) {
                        return collection.truck.plate;
                      }
                      // If not populated, find truck by ID from loaded trucks
                      const truck = trucks.find(t => t._id === collection.truck);
                      return truck ? truck.plate : 'N/A';
                    })()}
                  </TableCell>
                  <TableCell>{collection.generalWaste} tons</TableCell>
                  <TableCell>{collection.recyclables} tons</TableCell>
                  <TableCell>{collection.organic} tons</TableCell>
                  <TableCell>{collection.notes || '-'}</TableCell>
                </TableRow>
              ))}
              {filteredCollections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'No collections match your search.' : 'No collections found. Create your first collection to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* quick refresh action */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={loadData} variant="outlined" size="small">Refresh</Button>
        </Box>
      </Paper>

      {/* Create Collection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Truck</InputLabel>
                <Select
                  value={newCollection.truck}
                  label="Truck"
                  onChange={(e) => setNewCollection({ ...newCollection, truck: e.target.value })}
                >
                  {trucks.map((truck) => (
                    <MenuItem key={truck._id} value={truck._id}>
                      {truck.plate} - {truck.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="General Waste (tons)"
                type="number"
                value={newCollection.generalWaste}
                onChange={(e) => setNewCollection({ ...newCollection, generalWaste: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Recyclables (tons)"
                type="number"
                value={newCollection.recyclables}
                onChange={(e) => setNewCollection({ ...newCollection, recyclables: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Organic Waste (tons)"
                type="number"
                value={newCollection.organic}
                onChange={(e) => setNewCollection({ ...newCollection, organic: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newCollection.notes}
                onChange={(e) => setNewCollection({ ...newCollection, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
