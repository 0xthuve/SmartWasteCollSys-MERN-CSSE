import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Alert } from '@mui/material';
import ReportForm from '../components/ReportForm';
import ReportTable from '../components/ReportTable';
import ReportDetails from '../components/ReportDetails';
import { api } from '../contexts/AuthContext';

export default function AnalyticsReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports');
    }
  };

  const handleReportGenerated = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Reports
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ReportForm onReportGenerated={handleReportGenerated} />
          <ReportTable
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <ReportDetails report={selectedReport} />
        </Grid>
      </Grid>
    </Box>
  );
}
