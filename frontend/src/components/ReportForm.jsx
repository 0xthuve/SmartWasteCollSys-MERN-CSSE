import React, { useState } from 'react';
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress } from '@mui/material';
import { api } from '../contexts/AuthContext';

export default function ReportForm({ onReportGenerated }) {
  const [reportType, setReportType] = useState('efficiency');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateReport({
        type: reportType,
        startDate,
        endDate,
      });
      onReportGenerated(res.data);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={1}>
      <Typography variant="h6" gutterBottom>
        Generate Report
      </Typography>

      {error && <Typography color="error" variant="body2">{error}</Typography>}

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
  );
}