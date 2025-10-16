import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Fab from '@mui/material/Fab'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MapIcon from '@mui/icons-material/Map'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AnalyticsIcon from '@mui/icons-material/QueryStats'
import MinimizeIcon from '@mui/icons-material/Minimize'
import { useAuth, api } from '../contexts/AuthContext'

function StatCard({ icon, title, value, change, color = 'primary' }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#ecfdf5' : color === 'warning' ? '#fffbeb' : '#fef3c7'} 0%, white 100%)`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box
            sx={{
              bgcolor: color === 'primary' ? '#d1fae5' : color === 'warning' ? '#fef3c7' : '#dbeafe',
              p: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box
            textAlign="right"
            sx={{
              color: change?.startsWith('+') ? 'success.main' : change?.startsWith('-') ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {change}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [range, setRange] = useState('This Week')
  const [stats, setStats] = useState([
    {
      icon: <LocalShippingIcon sx={{ color: '#059669', fontSize: 28 }} />,
      title: 'Active Trucks',
      value: '0',
      change: 'Loading...',
      color: 'primary'
    },
    {
      icon: <MapIcon sx={{ color: '#d97706', fontSize: 28 }} />,
      title: 'Bins >70% Full',
      value: '0',
      change: 'Loading...',
      color: 'warning'
    },
    {
      icon: <ListAltIcon sx={{ color: '#7c3aed', fontSize: 28 }} />,
      title: 'Routes Dispatched',
      value: '0',
      change: 'Loading...',
      color: 'secondary'
    },
    {
      icon: <AnalyticsIcon sx={{ color: '#0891b2', fontSize: 28 }} />,
      title: 'Avg Fill Level',
      value: '0%',
      change: 'Loading...',
      color: 'info'
    },
  ])
  const [bins, setBins] = useState([])
  const [trucks, setTrucks] = useState([])
  const [routePlans, setRoutePlans] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const addNotification = (message) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)])
  }

  const loadDashboardData = async () => {
    try {
      const [binsRes, trucksRes, plansRes] = await Promise.all([
        api.getBins(),
        api.getTrucks(),
        api.getRoutePlans()
      ])

      setBins(binsRes.data)
      setTrucks(trucksRes.data)
      setRoutePlans(plansRes.data)

      // Calculate stats
      const activeTrucks = trucksRes.data.filter(t => t.status === 'Active').length
      const highFillBins = binsRes.data.filter(b => b.fillLevel > 70).length
      const dispatchedPlans = plansRes.data.filter(p => p.dispatchedAt).length
      const avgFillLevel = binsRes.data.length > 0
        ? Math.round(binsRes.data.reduce((sum, b) => sum + b.fillLevel, 0) / binsRes.data.length)
        : 0

      setStats([
        {
          icon: <LocalShippingIcon sx={{ color: '#059669', fontSize: 28 }} />,
          title: 'Active Trucks',
          value: activeTrucks.toString(),
          change: '+2%',
          color: 'primary'
        },
        {
          icon: <MapIcon sx={{ color: '#d97706', fontSize: 28 }} />,
          title: 'Bins >70% Full',
          value: highFillBins.toString(),
          change: highFillBins > 5 ? 'High Priority' : 'Normal',
          color: 'warning'
        },
        {
          icon: <ListAltIcon sx={{ color: '#7c3aed', fontSize: 28 }} />,
          title: 'Routes Dispatched',
          value: dispatchedPlans.toString(),
          change: '+15%',
          color: 'secondary'
        },
        {
          icon: <AnalyticsIcon sx={{ color: '#0891b2', fontSize: 28 }} />,
          title: 'Avg Fill Level',
          value: `${avgFillLevel}%`,
          change: avgFillLevel > 60 ? 'High Usage' : 'Normal',
          color: 'info'
        },
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Show error in the UI
      setStats([
        {
          icon: <LocalShippingIcon sx={{ color: '#ef4444', fontSize: 28 }} />,
          title: 'Error Loading Data',
          value: 'N/A',
          change: 'Check console',
          color: 'error'
        },
        {
          icon: <MapIcon sx={{ color: '#ef4444', fontSize: 28 }} />,
          title: 'API Connection',
          value: 'Failed',
          change: 'Check backend',
          color: 'error'
        },
        {
          icon: <ListAltIcon sx={{ color: '#ef4444', fontSize: 28 }} />,
          title: 'Database',
          value: 'Offline',
          change: 'Check MongoDB',
          color: 'error'
        },
        {
          icon: <AnalyticsIcon sx={{ color: '#ef4444', fontSize: 28 }} />,
          title: 'System Status',
          value: 'Error',
          change: 'Check logs',
          color: 'error'
        },
      ])
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Box>
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
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Monitor your waste collection operations in real-time
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((s, idx) => (
          <Grid size={{ xs: 12, md: 6 }} key={idx}>
            <StatCard {...s} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Latest route plans and system updates
                </Typography>
              </Box>
              <Select
                size="small"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                }}
              >
                <MenuItem value="This Week">This Week</MenuItem>
                <MenuItem value="This Month">This Month</MenuItem>
                <MenuItem value="This Year">This Year</MenuItem>
              </Select>
            </Box>
            <Box sx={{ height: 280, overflow: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { backgroundColor: '#f1f5f9' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 } }}>
              {routePlans.slice(0, 5).map(plan => (
                <Box
                  key={plan._id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)',
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                        Route Plan - {plan.mode} Mode
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {plan.routes.length} trucks assigned
                      </Typography>
                    </Box>
                    <Chip
                      label={plan.dispatchedAt ? 'Dispatched' : plan.approved ? 'Approved' : 'Pending'}
                      color={plan.dispatchedAt ? 'success' : plan.approved ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    {new Date(plan.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              System Notifications
            </Typography>
            <Box sx={{ height: 280, overflow: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { backgroundColor: '#f1f5f9' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 3 } }}>
              {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    No recent notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    All systems operating normally
                  </Typography>
                </Box>
              ) : (
                notifications.map((note, idx) => (
                  <Alert
                    key={idx}
                    severity="info"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    variant="outlined"
                  >
                    {note}
                  </Alert>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Fab
        color="primary"
        size="large"
        sx={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)',
          '&:hover': {
            boxShadow: '0 20px 40px -10px rgba(5, 150, 105, 0.6)',
          },
        }}
        aria-label="quick actions"
      >
        <MinimizeIcon />
      </Fab>
    </Box>
  )
}