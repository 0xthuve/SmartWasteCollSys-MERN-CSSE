import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token and get user info
      axios.get(`${API_BASE}/auth/me`)
        .then(res => {
          setUser(res.data.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// API service functions
export const api = {
  // Auth
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),

  // Bins
  getBins: () => axios.get(`${API_BASE}/bins`),
  createBin: (data) => axios.post(`${API_BASE}/bins`, data),
  updateBin: (id, data) => axios.put(`${API_BASE}/bins/${id}`, data),
  deleteBin: (id) => axios.delete(`${API_BASE}/bins/${id}`),
  seedBins: () => axios.post(`${API_BASE}/bins/seed`),
  reportBinFill: (data) => axios.post(`${API_BASE}/bins/report`, data),

  // Trucks
  getTrucks: () => axios.get(`${API_BASE}/trucks`),
  createTruck: (data) => axios.post(`${API_BASE}/trucks`, data),
  updateTruck: (id, data) => axios.put(`${API_BASE}/trucks/${id}`, data),
  deleteTruck: (id) => axios.delete(`${API_BASE}/trucks/${id}`),

  // Route Plans
  getRoutePlans: () => axios.get(`${API_BASE}/routeplans`),
  generateRoutePlan: (data) => axios.post(`${API_BASE}/routeplans/generate`, data),
  approveRoutePlan: (id) => axios.post(`${API_BASE}/routeplans/${id}/approve`),
  dispatchRoutePlan: (id) => axios.post(`${API_BASE}/routeplans/${id}/dispatch`),
  completeRoutePlan: (id) => axios.post(`${API_BASE}/routeplans/${id}/complete`),

  // Reports
  getReports: () => axios.get(`${API_BASE}/reports`),
  generateReport: (data) => axios.post(`${API_BASE}/reports/generate`, data),
  getReport: (id) => axios.get(`${API_BASE}/reports/${id}`)
}