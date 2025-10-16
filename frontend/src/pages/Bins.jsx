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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import Battery50Icon from "@mui/icons-material/Battery50";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import { api } from "../contexts/AuthContext";

export default function Bins() {
  const [bins, setBins] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const binsRes = await api.getBins();
      setBins(binsRes.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load bins data");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Empty': return 'success';
      case 'Half': return 'warning';
      case 'Full': return 'warning';  // Changed from 'error' to 'warning' for distinction
      case 'Priority': return 'error';  // Priority bins get the most urgent color (red)
      default: return 'default';
    }
  };

  // Get fill level icon
  const getFillLevelIcon = (fillLevel) => {
    if (fillLevel >= 70) return <BatteryAlertIcon color="error" />;
    if (fillLevel >= 50) return <BatteryFullIcon color="error" />;
    if (fillLevel >= 25) return <Battery50Icon color="warning" />;
    return <Battery20Icon color="success" />;
  };

  // Filter bins based on search term
  const filteredBins = bins.filter((bin) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      bin.sensorId?.toLowerCase().includes(searchLower) ||
      bin.locationName?.toLowerCase().includes(searchLower) ||
      bin.status?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalBins = bins.length;
  const emptyBins = bins.filter(bin => bin.status === 'Empty').length;
  const priorityBins = bins.filter(bin => bin.status === 'Priority').length;
  const averageFillLevel = bins.length > 0
    ? (bins.reduce((sum, bin) => sum + (bin.fillLevel || 0), 0) / bins.length).toFixed(1)
    : 0;

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
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <DeleteIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            Bins Management
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search bins..."
            size="small"
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                <DeleteIcon />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="primary">
                {totalBins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 1 }}>
                <Battery20Icon />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {emptyBins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empty Bins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "error.main", mx: "auto", mb: 1 }}>
                <BatteryAlertIcon />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {priorityBins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priority Bins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 1 }}>
                <Battery50Icon />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {averageFillLevel}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Fill Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bins Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 700 }}>Sensor ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fill Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No bins found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBins.map((bin) => (
                  <TableRow key={bin._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {bin.sensorId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {bin.locationName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {getFillLevelIcon(bin.fillLevel)}
                        <Typography variant="body2" fontWeight={600}>
                          {bin.fillLevel || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bin.status}
                        color={getStatusColor(bin.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {bin.lastSeenAt
                          ? new Date(bin.lastSeenAt).toLocaleString()
                          : "Never"
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}