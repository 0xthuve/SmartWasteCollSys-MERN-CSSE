import React, { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { api } from '../contexts/AuthContext'

export default function AnalyticsReports() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportType, setReportType] = useState('efficiency')
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const res = await api.getReports()
      setReports(res.data)
    } catch (err) {
      setError('Failed to load reports')
    }
  }

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.generateReport({
        type: reportType,
        startDate,
        endDate
      })
      setReports(prev => [res.data, ...prev])
      setSelectedReport(res.data)
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const mockChartData = {
    efficiency: {
      xAxis: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      series: [
        { data: [120, 135, 98, 142], label: 'Time Saved (min)' },
        { data: [45, 52, 38, 61], label: 'Distance Saved (km)' },
        { data: [3.6, 4.2, 3.0, 4.9], label: 'Fuel Saved (L)' }
      ]
    },
    bins: {
      xAxis: ['BIN-001', 'BIN-002', 'BIN-003', 'BIN-004', 'BIN-005'],
      series: [{ data: [75, 82, 45, 68, 91], label: 'Fill Level (%)' }]
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analytics & Reports</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Report Generation */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Generate Report</Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <MenuItem value="efficiency">Efficiency Report</MenuItem>
                <MenuItem value="daily">Daily Summary</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
                <MenuItem value="monthly">Monthly Summary</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={generateReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Paper>

          {/* Reports List */}
          <Paper sx={{ p: 3, mt: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Generated Reports</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow
                      key={report._id}
                      hover
                      selected={selectedReport?._id === report._id}
                      onClick={() => setSelectedReport(report)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Charts and Details */}
        <Grid xs={12} md={8}>
          {selectedReport ? (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
                <Typography variant="h6" gutterBottom>
                  {selectedReport.type.toUpperCase()} Report
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Generated: {new Date(selectedReport.generatedAt).toLocaleString()}
                </Typography>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid xs={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary.main">
                          {selectedReport.data.totalCollections || 0}
                        </Typography>
                        <Typography variant="body2">Collections</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {selectedReport.data.totalBinsEmptied || 0}
                        </Typography>
                        <Typography variant="body2">Bins Emptied</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main">
                          {selectedReport.data.averageFillLevel || 0}%
                        </Typography>
                        <Typography variant="body2">Avg Fill Level</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main">
                          {selectedReport.data.efficiency?.timeSaved || 0}min
                        </Typography>
                        <Typography variant="body2">Time Saved</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Charts */}
                {selectedReport.type === 'efficiency' && (
                  <Box sx={{ height: 300, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Efficiency Trends</Typography>
                    <LineChart
                      xAxis={[{ data: mockChartData.efficiency.xAxis }]}
                      series={mockChartData.efficiency.series}
                      height={250}
                    />
                  </Box>
                )}

                {/* Bin Performance Table */}
                {selectedReport.data.binPerformance && selectedReport.data.binPerformance.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Bin Performance</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Bin ID</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Avg Fill Rate</TableCell>
                            <TableCell>Collection Freq</TableCell>
                            <TableCell>Overflow Incidents</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedReport.data.binPerformance.map((bin) => (
                            <TableRow key={bin.sensorId}>
                              <TableCell>{bin.sensorId}</TableCell>
                              <TableCell>{bin.location.lat.toFixed(4)}, {bin.location.lng.toFixed(4)}</TableCell>
                              <TableCell>{bin.averageFillRate}%</TableCell>
                              <TableCell>{bin.collectionFrequency}x</TableCell>
                              <TableCell>{bin.overflowIncidents}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Paper>
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }} elevation={1}>
              <Typography variant="h6" color="text.secondary">
                Select a report to view details and analytics
              </Typography>
            </Paper>
          )}

          {/* Sample Charts */}
          <Paper sx={{ p: 3 }} elevation={1}>
            <Typography variant="h6" gutterBottom>Bin Fill Levels Overview</Typography>
            <Box sx={{ height: 300 }}>
              <BarChart
                xAxis={[{ data: mockChartData.bins.xAxis, scaleType: 'band' }]}
                series={mockChartData.bins.series}
                height={250}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
