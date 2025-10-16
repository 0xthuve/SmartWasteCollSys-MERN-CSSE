import React, { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { api } from '../contexts/AuthContext'

export default function Collections() {
  const [bins, setBins] = useState([])
  const [routePlans, setRoutePlans] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [binsRes, plansRes] = await Promise.all([
        api.getBins(),
        api.getRoutePlans()
      ])
      setBins(binsRes.data)
      setRoutePlans(plansRes.data)
    } catch (err) {
      setError('Failed to load collection data')
    }
  }

  const getPriorityColor = (fillLevel) => {
    if (fillLevel > 80) return 'error'
    if (fillLevel > 60) return 'warning'
    return 'success'
  }

  const getPriorityText = (fillLevel) => {
    if (fillLevel > 80) return 'Critical'
    if (fillLevel > 60) return 'High'
    if (fillLevel > 40) return 'Medium'
    return 'Low'
  }

  const recentCollections = routePlans
    .filter(plan => plan.dispatchedAt)
    .slice(0, 10)
    .flatMap(plan =>
      plan.routes.flatMap(route =>
        route.stops?.map(stop => ({
          planId: plan._id,
          truckPlate: route.truckPlate,
          binId: stop.sensorId,
          timestamp: plan.dispatchedAt,
          status: route.status
        })) || []
      )
    )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Collections Management</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Bin Status Overview */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Bin Status Overview</Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {bins.filter(b => b.fillLevel > 80).length}
                    </Typography>
                    <Typography variant="body2">Critical (&gt;80%)</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {bins.filter(b => b.fillLevel > 60 && b.fillLevel <= 80).length}
                    </Typography>
                    <Typography variant="body2">High (60-80%)</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {bins.filter(b => b.fillLevel > 40 && b.fillLevel <= 60).length}
                    </Typography>
                    <Typography variant="body2">Medium (40-60%)</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={6}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {bins.filter(b => b.fillLevel <= 40).length}
                    </Typography>
                    <Typography variant="body2">Low (≤40%)</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Button variant="outlined" fullWidth onClick={loadData}>
              Refresh Data
            </Button>
          </Paper>
        </Grid>

        {/* Recent Collections */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Recent Collections</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Truck</TableCell>
                    <TableCell>Bin</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCollections.slice(0, 8).map((collection, index) => (
                    <TableRow key={index}>
                      <TableCell>{collection.truckPlate}</TableCell>
                      <TableCell>{collection.binId}</TableCell>
                      <TableCell>{new Date(collection.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={collection.status}
                          color={collection.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* All Bins Table */}
        <Grid xs={12}>
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>All Bins Status</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bin ID</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Fill Level</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell>Historical Avg</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bins.map((bin) => (
                    <TableRow key={bin._id}>
                      <TableCell>{bin.sensorId}</TableCell>
                      <TableCell>
                        {bin.location && typeof bin.location.lat === 'number' && typeof bin.location.lng === 'number'
                          ? `${bin.location.lat.toFixed(4)}, ${bin.location.lng.toFixed(4)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography>{bin.fillLevel}%</Typography>
                          <Box
                            sx={{
                              width: 60,
                              height: 8,
                              bgcolor: 'grey.300',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${bin.fillLevel}%`,
                                height: '100%',
                                bgcolor: bin.fillLevel > 80 ? 'error.main' : bin.fillLevel > 60 ? 'warning.main' : 'success.main'
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPriorityText(bin.fillLevel)}
                          color={getPriorityColor(bin.fillLevel)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(bin.lastSeenAt).toLocaleString()}</TableCell>
                      <TableCell>{bin.historicalAvgFill}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
