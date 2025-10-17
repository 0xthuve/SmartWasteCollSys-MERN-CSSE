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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { api } from '../contexts/AuthContext'
import MapIcon from '@mui/icons-material/Map'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RouteIcon from '@mui/icons-material/Route'
import TimelineIcon from '@mui/icons-material/Timeline'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StraightenIcon from '@mui/icons-material/Straighten'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'

export default function RoutePlanning() {
  const [bins, setBins] = useState([])
  const [trucks, setTrucks] = useState([])
  const [routePlans, setRoutePlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentRoute, setCurrentRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('real-time')
  const [routes, setRoutes] = useState([])
  const [routeDetailModal, setRouteDetailModal] = useState({
    open: false,
    route: null,
    plan: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [binsRes, trucksRes, plansRes] = await Promise.all([
        api.getBins(),
        api.getTrucks(),
        api.getRoutePlans()
      ])
      setBins(binsRes.data || [])
      setTrucks(trucksRes.data || [])
      setRoutePlans(plansRes.data || [])
      setRoutes(plansRes.data || [])

      if (plansRes.data && plansRes.data.length > 0) {
        const mostRecentPlan = plansRes.data[0]
        setCurrentRoute(mostRecentPlan)
        setSelectedPlan(mostRecentPlan)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const generateRoutePlan = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.generateRoutePlan({ mode })

      const sanitizedRoutes = (res.data.routes || []).map((route) => ({
        ...route,
        stops: (route.stops || []).map((stop) => ({
          ...stop,
          estimatedTime: isNaN(stop.estimatedTime) ? 0 : stop.estimatedTime,
        })),
        totalDistance: isNaN(route.totalDistance) ? 0 : route.totalDistance,
        estimatedTimeMin: isNaN(route.estimatedTimeMin) ? 0 : route.estimatedTimeMin,
      }))

      const sanitizedEfficiency = {
        timeSaved: isNaN(res.data.efficiency?.timeSaved) ? 0 : res.data.efficiency.timeSaved,
        distanceSaved: isNaN(res.data.efficiency?.distanceSaved) ? 0 : res.data.efficiency.distanceSaved,
        fuelSaved: isNaN(res.data.efficiency?.fuelSaved) ? 0 : res.data.efficiency.fuelSaved,
      }

      const sanitizedData = {
        ...res.data,
        routes: sanitizedRoutes,
        efficiency: sanitizedEfficiency,
        _id: res.data._id || Date.now().toString(), // Fallback ID
        createdAt: res.data.createdAt || new Date().toISOString(),
      }

      setRoutePlans(prev => [sanitizedData, ...prev])
      setSelectedPlan(sanitizedData)
      setCurrentRoute(sanitizedData)
      setRoutes(prev => [sanitizedData, ...prev])
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
    if (!plan) return 'default'
    if (plan.dispatchedAt) return 'success'
    if (plan.approved) return 'warning'
    return 'default'
  }

  const getStatusText = (plan) => {
    if (!plan) return 'Unknown'
    if (plan.dispatchedAt) return 'Dispatched'
    if (plan.approved) return 'Approved'
    return 'Pending'
  }

  const handleRouteClick = (route, plan) => {
    setRouteDetailModal({
      open: true,
      route,
      plan
    })
  }

  const handleCloseModal = () => {
    setRouteDetailModal({
      open: false,
      route: null,
      plan: null
    })
  }

  // Fallback data for demonstration
  const fallbackPlan = {
    _id: 'demo-plan',
    mode: 'real-time',
    createdAt: new Date().toISOString(),
    routes: [
      {
        truckId: 'demo-truck',
        truckPlate: 'KC-1234',
        stops: [
          { locationName: 'Central Market', fillLevel: 85, estimatedTime: 15 },
          { locationName: 'Bus Station', fillLevel: 70, estimatedTime: 25 },
          { locationName: 'Hospital Area', fillLevel: 90, estimatedTime: 35 }
        ],
        totalDistance: 12.5,
        estimatedTimeMin: 75,
        priorityRoute: true
      }
    ],
    efficiency: {
      timeSaved: 30,
      distanceSaved: 5.2,
      fuelSaved: 8.5
    }
  }

  const displayPlan = selectedPlan || fallbackPlan

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
          onClose={() => setError('')}
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
                <MenuItem value="real-time">Real-Time (Bins &gt;70% full)</MenuItem>
                <MenuItem value="predictive">Predictive (Historical patterns)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={generateRoutePlan}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
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

          {/* Current Route Status Card */}
          {currentRoute && (
            <Paper
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 3,
                border: '3px solid',
                borderColor: 'success.main',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                boxShadow: '0 8px 25px -8px rgba(34, 197, 94, 0.4)',
                position: 'relative',
                overflow: 'visible'
              }}
              elevation={0}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -12, 
                left: 20, 
                backgroundColor: 'success.main',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                ACTIVE ROUTE
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
                <RouteIcon sx={{ mr: 1.5, color: 'success.main', fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    Current Active Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.dark', opacity: 0.8 }}>
                    {currentRoute.mode?.toUpperCase()} MODE • {currentRoute.routes?.length || 0} routes
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
                    Generated: {new Date(currentRoute.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={getStatusText(currentRoute)}
                    color={getStatusColor(currentRoute)}
                    size="small"
                    sx={{ fontWeight: 700, mt: 1 }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedPlan(currentRoute)}
                  sx={{ 
                    borderColor: 'success.main', 
                    color: 'success.dark',
                    fontWeight: 600
                  }}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          )}

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
              Route Plans History
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
              {routePlans.length > 0 ? routePlans.map((plan, index) => (
                <React.Fragment key={plan._id || index}>
                  <ListItem
                    button
                    selected={selectedPlan?._id === plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '2px solid',
                      borderColor: plan._id === currentRoute?._id ? 'success.main' : 
                                  selectedPlan?._id === plan._id ? 'primary.light' : 'divider',
                      backgroundColor: plan._id === currentRoute?._id ? '#f0fdf4' : 
                                     selectedPlan?._id === plan._id ? '#ecfdf5' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: plan._id === currentRoute?._id ? '#f0fdf4' : '#f8fafc',
                        borderColor: 'primary.light',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {plan._id === currentRoute?._id && (
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              backgroundColor: 'success.main', 
                              borderRadius: '50%',
                              mr: 1 
                            }} />
                          )}
                          <Typography variant="body1" fontWeight={600}>
                            {index === 0 ? 'Latest' : `Plan ${index + 1}`} - {plan.mode}
                          </Typography>
                          {plan.routes?.some(r => r.priorityRoute) && (
                            <Chip
                              label="PRIORITY"
                              color="error"
                              size="small"
                              sx={{ ml: 2, fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {plan.routes?.length || 0} routes • {getStatusText(plan)} • {new Date(plan.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < routePlans.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              )) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                  No route plans generated yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          {/* Selected Route Plan Display */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              border: displayPlan._id === currentRoute?._id ? '3px solid' : '1px solid',
              borderColor: displayPlan._id === currentRoute?._id ? 'success.main' : 'divider',
              background: displayPlan._id === currentRoute?._id 
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: displayPlan._id === currentRoute?._id
                ? '0 12px 40px -8px rgba(34, 197, 94, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              position: 'relative'
            }}
            elevation={0}
          >
            {/* Header with Status Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RouteIcon sx={{ 
                  mr: 2, 
                  color: displayPlan._id === currentRoute?._id ? 'success.main' : 'primary.main', 
                  fontSize: 32 
                }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: displayPlan._id === currentRoute?._id ? 'success.dark' : 'primary.main',
                    lineHeight: 1.2
                  }}>
                    {displayPlan._id === currentRoute?._id ? 'ACTIVE ROUTE PLAN' : 'ROUTE PLAN DETAILS'}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: displayPlan._id === currentRoute?._id ? 'success.dark' : 'primary.dark', 
                    opacity: 0.8 
                  }}>
                    {displayPlan.mode?.toUpperCase()} MODE • Generated {new Date(displayPlan.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {displayPlan._id === currentRoute?._id && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="CURRENTLY ACTIVE"
                    color="success"
                    sx={{ fontWeight: 800, fontSize: '0.8rem' }}
                  />
                )}
                <Chip
                  label={getStatusText(displayPlan)}
                  color={getStatusColor(displayPlan)}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Box>

            {/* Routes Grid */}
            <Grid container spacing={3}>
              {displayPlan.routes?.map((route, routeIndex) => {
                const truck = trucks.find(t => t._id === route.truckId)
                const isActive = truck && truck.status === 'Active'

                return (
                  <Grid item xs={12} key={routeIndex}>
                    <Card
                      sx={{
                        border: '2px solid',
                        borderColor: isActive ? 'success.light' : 'grey.300',
                        borderRadius: 3,
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          borderColor: isActive ? 'success.main' : 'primary.main'
                        }
                      }}
                      elevation={2}
                    >
                      {/* Truck Header */}
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalShippingIcon sx={{
                              mr: 1.5,
                              color: isActive ? 'success.main' : 'text.disabled',
                              fontSize: 28
                            }} />
                            <Box>
                              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {route.truckPlate || `Truck ${routeIndex + 1}`}
                              </Typography>
                              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {route.stops?.length || 0} collection points • {isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                            {route.priorityRoute && (
                              <Chip
                                label="HIGH PRIORITY"
                                color="error"
                                sx={{ ml: 2, fontWeight: 800, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StraightenIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                    Distance
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {route.totalDistance || 0} km
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: 'success.main' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                    Duration
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {route.estimatedTimeMin || 0} min
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Route Visualization */}
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 700, 
                            mb: 2, 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <TimelineIcon sx={{ mr: 1 }} />
                            ROUTE SEQUENCE:
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                            p: 3,
                            backgroundColor: '#f8fafc',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative'
                          }}>
                            {route.stops?.map((stop, stopIndex) => (
                              <React.Fragment key={stopIndex}>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  backgroundColor: stopIndex === 0 ? '#dcfce7' : 
                                                 stop.fillLevel > 80 ? '#fef2f2' : '#ffffff',
                                  border: '2px solid',
                                  borderColor: stopIndex === 0 ? '#16a34a' : 
                                             stop.fillLevel > 80 ? '#ef4444' : '#e2e8f0',
                                  borderRadius: 2,
                                  px: 2,
                                  py: 1.5,
                                  minWidth: 0,
                                  flexShrink: 0,
                                  position: 'relative'
                                }}>
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -8,
                                    left: -8,
                                    backgroundColor: stopIndex === 0 ? '#16a34a' : 'primary.main',
                                    color: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 800
                                  }}>
                                    {stopIndex + 1}
                                  </Box>
                                  <LocationOnIcon sx={{
                                    fontSize: 20,
                                    mr: 1,
                                    color: stopIndex === 0 ? '#16a34a' : 
                                           stop.fillLevel > 80 ? '#ef4444' : 'primary.main'
                                  }} />
                                  <Box>
                                    <Typography variant="body1" sx={{
                                      fontWeight: 600,
                                      color: stopIndex === 0 ? '#16a34a' : 
                                             stop.fillLevel > 80 ? '#ef4444' : 'text.primary'
                                    }}>
                                      {stop.locationName || `Stop ${stopIndex + 1}`}
                                    </Typography>
                                    <Typography variant="caption" sx={{
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}>
                                      Fill: {stop.fillLevel || 0}% • ETA: {stop.estimatedTime || 0}min
                                    </Typography>
                                  </Box>
                                </Box>
                                {stopIndex < route.stops.length - 1 && (
                                  <Box sx={{
                                    width: 20,
                                    height: 2,
                                    backgroundColor: 'primary.main',
                                    opacity: 0.5,
                                    position: 'relative',
                                    '&::after': {
                                      content: '"→"',
                                      position: 'absolute',
                                      top: -8,
                                      right: -12,
                                      color: 'primary.main',
                                      fontSize: '1rem'
                                    }
                                  }} />
                                )}
                              </React.Fragment>
                            ))}
                          </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          {!displayPlan.approved && (
                            <Button 
                              variant="outlined" 
                              color="warning"
                              onClick={() => approvePlan(displayPlan._id)}
                            >
                              Approve Plan
                            </Button>
                          )}
                          {displayPlan.approved && !displayPlan.dispatchedAt && (
                            <Button 
                              variant="contained" 
                              color="success"
                              onClick={() => dispatchPlan(displayPlan._id)}
                            >
                              Dispatch Now
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>


          </Paper>
        </Grid>
      </Grid>

      {/* Route Detail Modal */}
      <Dialog
        open={routeDetailModal.open}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Route Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {routeDetailModal.route && (
            <Box>
              <Typography variant="body1">
                Detailed route information would be displayed here...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}