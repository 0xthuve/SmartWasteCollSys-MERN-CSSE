import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

export default function ReportTable({ reports, selectedReport, onSelectReport }) {
  const handleDownload = (e, reportId) => {
    e.stopPropagation();
    // Implement download logic here
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }} elevation={1}>
      <Typography variant="h6" gutterBottom>
        Generated Reports
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report._id}
                hover
                selected={selectedReport?._id === report._id}
                onClick={() => onSelectReport(report)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{report.type}</TableCell>
                <TableCell>{new Date(report.generatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => handleDownload(e, report._id)}
                  >
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}