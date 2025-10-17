import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';

export default function ReportDetails({ report }) {
  if (!report) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }} elevation={1}>
        <Typography variant="h6" color="text.secondary">
          Select a report to view details and analytics
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          {report.type.toUpperCase()} Report
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Generated: {new Date(report.generatedAt).toLocaleString()}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary.main">
                  {report.data.totalCollections || 0}
                </Typography>
                <Typography variant="body2">Collections</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="success.main">
                  {report.data.totalBinsEmptied || 0}
                </Typography>
                <Typography variant="body2">Bins Emptied</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main">
                  {report.data.averageFillLevel || 0}%
                </Typography>
                <Typography variant="body2">Avg Fill Level</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="info.main">
                  {report.data.efficiency?.timeSaved || 0}min
                </Typography>
                <Typography variant="body2">Time Saved</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}