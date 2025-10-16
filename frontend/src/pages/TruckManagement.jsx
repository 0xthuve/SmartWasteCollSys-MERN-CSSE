import React from 'react'
import { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

const locations = [
  'Paranthan', 'Poonagary', 'Kilinochchi Town', 'Ramanathapuram', 'Uruthirapuram',
  'Akkarayankulam', 'Mulankavil', 'Pallai', 'Kandawalai', 'Murikandy',
  'Thiruvaiaru', 'Nachchikuda', 'Anaivilunthan', 'Puthukudiyiruppu', 'Jayapuram',
  'Elephant Pass', 'Iranamadu', 'Mankulam', 'Puliyankulam', 'Vavuniya Road',
  'Oddusuddan', 'Kanakapuram', 'Karachchi', 'Mallavi', 'Thunukkai'
]
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function TruckManagement() {
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ plate: '', model: '', capacity: '', status: 'Active', currentLocation: 'Kilinochchi Town', driver: { name: '', phone: '', email: '' } })

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/trucks`)
      if (!res.ok) throw new Error('Failed to load trucks')
      const data = await res.json()
      setTrucks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ plate: '', model: '', capacity: '', status: 'Active', currentLocation: 'Kilinochchi Town', driver: { name: '', phone: '', email: '' } })
    setDialogOpen(true)
  }

  const openEdit = (truck) => {
    setEditing(truck._id)
    setForm({
      plate: truck.plate,
      model: truck.model,
      capacity: truck.capacity,
      status: truck.status,
      currentLocation: truck.currentLocation || 'Kilinochchi Town',
      driver: truck.driver || { name: '', phone: '', email: '' }
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setError('')
    if (!form.plate || !form.model) {
      setError('Plate and Model are required')
      return
    }

    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/api/trucks/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Failed to update truck')
        const updated = await res.json()
        setTrucks((t) => t.map((tr) => (tr._id === updated._id ? updated : tr)))
      } else {
        const res = await fetch(`${API_BASE}/api/trucks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to create truck')
        }
        const created = await res.json()
        setTrucks((t) => [created, ...t])
      }
      setDialogOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this truck?')) return
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/trucks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete truck')
      setTrucks((t) => t.filter((tr) => (tr._id || tr.id) !== id))
    } catch (err) {
      setError(err.message)
    }
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
          Truck Management
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Manage your waste collection fleet and monitor truck status
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
        >
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        elevation={0}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Fleet Overview ({trucks.length} trucks)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage trucks, statuses, assignments and maintenance logs
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setForm({ plate: '', model: '', capacity: '', status: 'Active', driver: { name: '', phone: '', email: '' } })
              setDialogOpen(true)
            }}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(5, 150, 105, 0.39)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.5)',
              },
            }}
          >
            Add Truck
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Plate</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Model</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Current Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trucks.map((truck) => (
                  <TableRow
                    key={truck._id || truck.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{truck.plate}</TableCell>
                    <TableCell>{truck.model}</TableCell>
                    <TableCell>{truck.capacity}</TableCell>
                    <TableCell>{truck.driver?.name || 'Not assigned'}</TableCell>
                    <TableCell>{truck.currentLocation || 'Not set'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            truck.status === 'Active' ? '#d1fae5' :
                            truck.status === 'In Maintenance' ? '#fef3c7' : '#fee2e2',
                          color:
                            truck.status === 'Active' ? '#047857' :
                            truck.status === 'In Maintenance' ? '#d97706' : '#dc2626',
                        }}
                      >
                        {truck.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(truck._id || truck.id)
                          setForm(truck)
                          setDialogOpen(true)
                        }}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark',
                          },
                        }}
                      >
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(truck._id || truck.id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          {editing ? 'Edit Truck' : 'Add New Truck'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField
              label="License Plate"
              value={form.plate}
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Model"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Capacity (tons)"
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="In Maintenance">In Maintenance</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              select
              label="Current Location"
              value={form.currentLocation}
              onChange={(e) => setForm((f) => ({ ...f, currentLocation: e.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
              ))}
            </TextField>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
              Driver Information
            </Typography>
            <TextField
              label="Driver Name"
              value={form.driver.name}
              onChange={(e) => setForm((f) => ({ ...f, driver: { ...f.driver, name: e.target.value } }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Driver Phone"
              value={form.driver.phone}
              onChange={(e) => setForm((f) => ({ ...f, driver: { ...f.driver, phone: e.target.value } }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Driver Email"
              value={form.driver.email}
              onChange={(e) => setForm((f) => ({ ...f, driver: { ...f.driver, email: e.target.value } }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(5, 150, 105, 0.39)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.5)',
              },
            }}
          >
            {editing ? 'Save Changes' : 'Add Truck'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
