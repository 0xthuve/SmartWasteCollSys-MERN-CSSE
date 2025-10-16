import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TruckManagement from './pages/TruckManagement'
import RoutePlanning from './pages/RoutePlanning'
import Collections from './pages/Collections'
import Bins from './pages/Bins'
import AnalyticsReports from './pages/AnalyticsReports'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#059669', // Emerald green
      dark: '#047857',
      light: '#10b981',
    },
    secondary: {
      main: '#f59e0b', // Amber
      dark: '#d97706',
      light: '#fbbf24',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
})

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <Box textAlign="center">
          <Typography variant="h6" sx={{ mb: 2 }}>Loading EcoCollect...</Typography>
          <Box sx={{ width: 200, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              animation: 'loading 1.5s ease-in-out infinite'
            }} />
          </Box>
        </Box>
      </Box>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trucks" element={<TruckManagement />} />
          <Route path="/routes" element={<RoutePlanning />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/bins" element={<Bins />} />
          <Route path="/analytics" element={<AnalyticsReports />} />
          <Route path="*" element={
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="error">
                404 - Page Not Found
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                The requested page does not exist.
              </Typography>
            </Box>
          } />
        </Routes>
      </Layout>
    </Router>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}