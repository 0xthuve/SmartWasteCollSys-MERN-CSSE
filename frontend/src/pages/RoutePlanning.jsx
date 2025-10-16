import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { api } from '../contexts/AuthContext'
import MapIcon from '@mui/icons-material/Map'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

export default function RoutePlanning() {
  const [bins, setBins] = useState([])
  const [trucks, setTrucks] = useState([])
  const [routePlans, setRoutePlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('real-time')
  const [routes, setRoutes] = useState([])
  const [mapLoading, setMapLoading] = useState(false)

  useEffect(() => {
    loadData()
    fetchKilinochchiRoutes()
  }, [])

  const loadData = async () => {
    try {
      const [binsRes, trucksRes, plansRes] = await Promise.all([
        api.getBins(),
        api.getTrucks(),
        api.getRoutePlans()
      ])
      setBins(binsRes.data)
      setTrucks(trucksRes.data)
      setRoutePlans(plansRes.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load data')
    }
  }

  const fetchKilinochchiRoutes = async () => {
    setMapLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/routeplans/kilinochchi')
      setRoutes(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch routes')
    } finally {
      setMapLoading(false)
    }
  }

  const generateRoutePlan = async () => {
    setLoading(true)
    setError('')
    setRoutes([]) // Clear existing routes
    try {
      const res = await api.generateRoutePlan({ mode })

      // Validate and sanitize route plan data
      const sanitizedRoutes = res.data.routes.map((route) => ({
        ...route,
        stops: route.stops.map((stop) => ({
          ...stop,
          estimatedTime: isNaN(stop.estimatedTime) ? 0 : stop.estimatedTime,
        })),
        totalDistance: isNaN(route.totalDistance) ? 0 : route.totalDistance,
        estimatedTimeMin: isNaN(route.estimatedTimeMin) ? 0 : route.estimatedTimeMin,
      }))

      const sanitizedEfficiency = {
        timeSaved: isNaN(res.data.efficiency.timeSaved) ? 0 : res.data.efficiency.timeSaved,
        distanceSaved: isNaN(res.data.efficiency.distanceSaved) ? 0 : res.data.efficiency.distanceSaved,
        fuelSaved: isNaN(res.data.efficiency.fuelSaved) ? 0 : res.data.efficiency.fuelSaved,
      }

      const sanitizedData = {
        ...res.data,
        routes: sanitizedRoutes,
        efficiency: sanitizedEfficiency,
      }

      setRoutePlans(prev => [sanitizedData, ...prev])
      setSelectedPlan(sanitizedData)
      fetchKilinochchiRoutes() // Refetch to update display
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate route plan')
    } finally {
      setLoading(false)
    }
  }

  const approvePlan = async (planId) => {
    try {
      await api.approveRoutePlan(planId)
      setRoutePlans(prev => prev.map(p => p._id === planId ? { ...p, approved: true } : p))
      if (selectedPlan?._id === planId) {
        setSelectedPlan(prev => ({ ...prev, approved: true }))
      }
    } catch (err) {
      setError('Failed to approve plan')
    }
  }

  const dispatchPlan = async (planId) => {
    try {
      await api.dispatchRoutePlan(planId)
      setRoutePlans(prev => prev.map(p => p._id === planId ? { ...p, dispatchedAt: new Date() } : p))
      if (selectedPlan?._id === planId) {
        setSelectedPlan(prev => ({ ...prev, dispatchedAt: new Date() }))
      }
    } catch (err) {
      setError('Failed to dispatch plan')
    }
  }

  const getStatusColor = (plan) => {
    if (plan.dispatchedAt) return 'success'
    if (plan.approved) return 'warning'
    return 'default'
  }

  const getStatusText = (plan) => {
    if (plan.dispatchedAt) return 'Dispatched'
    if (plan.approved) return 'Approved'
    return 'Pending'
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Kilinochchi Route Planning
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Create efficient waste collection routes using AI-powered optimization
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Controls Section */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            elevation={0}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Generate Route Plan
            </Typography>

            <FormControl
              fullWidth
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              <InputLabel sx={{ fontWeight: 500 }}>Optimization Mode</InputLabel>
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                label="Optimization Mode"
              >
                <MenuItem value="real-time">Real-Time (Bins  70% full)</MenuItem>
                <MenuItem value="predictive">Predictive (Historical patterns)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={generateRoutePlan}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 14px 0 rgba(5, 150, 105, 0.39)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(5, 150, 105, 0.5)',
                },
              }}
            >
              {loading ? 'Generating...' : 'Generate Route Plan'}
            </Button>

            <Alert
              severity="info"
              sx={{
                mt: 3,
                borderRadius: 2,
                backgroundColor: '#ecfdf5',
                border: '1px solid #d1fae5'
              }}
              icon={<MapIcon sx={{ color: '#059669' }} />}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Real-time: Prioritizes bins with fill levels &gt;70%<br />
                Predictive: Uses historical data &gt;50%
              </Typography>
            </Alert>
          </Paper>

          {/* Route Plans List */}
          <Paper
            sx={{
              p: 3,
              mt: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            elevation={0}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Recent Route Plans
            </Typography>
            <List
              sx={{
                maxHeight: 350,
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f5f9' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 }
              }}
            >
              {routePlans.map((plan) => (
                <React.Fragment key={plan._id}>
                  <ListItem
                    button
                    selected={selectedPlan?._id === plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: selectedPlan?._id === plan._id ? 'primary.light' : 'divider',
                      backgroundColor: selectedPlan?._id === plan._id ? '#ecfdf5' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: selectedPlan?._id === plan._id ? '#ecfdf5' : '#f8fafc',
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          Plan {plan.mode} - {plan.routes.length} routes
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {getStatusText(plan)} • {new Date(plan.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                    <Chip
                      label={getStatusText(plan)}
                      color={getStatusColor(plan)}
                      size="small"
                      sx={{ fontWeight: 600, ml: 1 }}
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Route Display Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '100%',
              overflow: 'hidden'
            }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MapIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Optimized Routes
              </Typography>
            </Box>
            {routes.length === 0 ? (
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No routes generated yet. Click "Generate Route Plan" to create optimized routes.
              </Typography>
            ) : (
              <Box>
                {routes.map((plan, planIndex) => (
                  <Box key={plan._id} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Plan {planIndex + 1} - {plan.mode} ({plan.routes.length} routes)
                    </Typography>
                    {plan.routes.map((route, routeIndex) => {
                      const truck = trucks.find(t => t._id === route.truckId)
                      const isActive = truck && truck.status === 'Active'
                      return (
                        <Box key={routeIndex} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {isActive && <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Truck {route.truckPlate}: {route.stops.length} stops
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                            {route.stops.map((stop, stopIndex) => (
                              <span key={stopIndex}>
                                {stop.locationName}
                                {stopIndex < route.stops.length - 1 ? ' ➜ ' : ''}
                              </span>
                            ))}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                            Distance: {route.totalDistance} km | Time: {route.estimatedTimeMin} min
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Selected Plan Details */}
        {selectedPlan && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              elevation={0}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Route Plan Details - {selectedPlan.mode.toUpperCase()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Generated: {new Date(selectedPlan.createdAt).toLocaleString()}
              </Typography>
              <Chip
                label={getStatusText(selectedPlan)}
                color={getStatusColor(selectedPlan)}
                sx={{ fontWeight: 600, mb: 2 }}
              />
              <Box>
                {selectedPlan.routes.map((route, index) => {
                  const truck = trucks.find(t => t._id === route.truckId)
                  const isActive = truck && truck.status === 'Active'
                  return (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {isActive && <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Route {index + 1}: Truck {route.truckPlate}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', mb: 1 }}>
                        {route.stops.map((stop, stopIndex) => (
                          <span key={stopIndex}>
                            {stop.locationName}
                            {stopIndex < route.stops.length - 1 ? ' ➜ ' : ''}
                          </span>
                        ))}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Distance: {route.totalDistance} km | Time: {route.estimatedTimeMin} min | Status: {route.status}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
              {selectedPlan.efficiency && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Efficiency Metrics
                  </Typography>
                  <Typography variant="body2">
                    Time Saved: {selectedPlan.efficiency.timeSaved} min | Distance Saved: {selectedPlan.efficiency.distanceSaved} km | Fuel Saved: {selectedPlan.efficiency.fuelSaved} L
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
