import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { styled, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import MuiAppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Badge from '@mui/material/Badge'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'

import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MapIcon from '@mui/icons-material/Map'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AnalyticsIcon from '@mui/icons-material/QueryStats'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 280

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderBottom: 'none',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}))

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(true)
  const [notifications, setNotifications] = useState([])

  const handleLogout = () => {
    logout()
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview'
      case '/trucks':
        return 'Truck Management'
      case '/routes':
        return 'Route Planning & Optimization'
      case '/collections':
        return 'Waste Collections'
      case '/analytics':
        return 'Analytics & Reports'
      default:
        return 'EcoCollect Dashboard'
    }
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            {getPageTitle()}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`Welcome, ${user?.name || 'Admin'}`}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '& .MuiChip-label': { fontWeight: 500 }
              }}
            />
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </Box>
        </Toolbar>
        <LinearProgress
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white',
            }
          }}
        />
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, px: 1 }}>
            <Box
              sx={{
                bgcolor: '#10b981',
                p: 2,
                borderRadius: 2,
                mr: 2,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              🌿
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                EcoCollect
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                Smart Waste Management
              </Typography>
            </Box>
          </Box>

          <List sx={{ px: 1 }}>
            <ListItem
              selected={isActive('/')}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive('/') ? '#10b981' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontWeight: isActive('/') ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              selected={isActive('/trucks')}
              onClick={() => navigate('/trucks')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive('/trucks') ? '#10b981' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText
                primary="Truck Management"
                primaryTypographyProps={{
                  fontWeight: isActive('/trucks') ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              selected={isActive('/routes')}
              onClick={() => navigate('/routes')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive('/routes') ? '#10b981' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <MapIcon />
              </ListItemIcon>
              <ListItemText
                primary="Route Planning"
                primaryTypographyProps={{
                  fontWeight: isActive('/routes') ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              selected={isActive('/collections')}
              onClick={() => navigate('/collections')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive('/collections') ? '#10b981' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <ListAltIcon />
              </ListItemIcon>
              <ListItemText
                primary="Collections"
                primaryTypographyProps={{
                  fontWeight: isActive('/collections') ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              selected={isActive('/analytics')}
              onClick={() => navigate('/analytics')}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive('/analytics') ? '#10b981' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Analytics & Reports"
                primaryTypographyProps={{
                  fontWeight: isActive('/analytics') ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 'auto', pt: 4 }}>
            <ListItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sign Out"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#ef4444'
                }}
              />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
          {children ? children : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="error">
                No content to display
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                The page component failed to load or render.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}