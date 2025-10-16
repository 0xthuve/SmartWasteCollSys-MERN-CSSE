import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

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
  axios.get(`${API_BASE}/api/auth/me`)
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
  const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password })
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
  login: (data) => axios.post(`${API_BASE}/api/auth/login`, data),

  // Bins
  getBins: () => axios.get(`${API_BASE}/api/bins`),

  // Trucks
  getTrucks: () => axios.get(`${API_BASE}/api/trucks`),

  // Route Plans
  getRoutePlans: () => axios.get(`${API_BASE}/api/routeplans`),
  generateRoutePlan: (data) => axios.post(`${API_BASE}/api/routeplans/generate`, data),
  approveRoutePlan: (id) => axios.post(`${API_BASE}/api/routeplans/${id}/approve`),
  dispatchRoutePlan: (id) => axios.post(`${API_BASE}/api/routeplans/${id}/dispatch`),

  // Collections
  getCollections: () => axios.get(`${API_BASE}/api/collections`),
  createCollection: (data) => axios.post(`${API_BASE}/api/collections`, data),

  // Reports
  getReports: () => axios.get(`${API_BASE}/api/reports`),
  generateReport: (data) => axios.post(`${API_BASE}/api/reports/generate`, data),
  getReport: (id) => axios.get(`${API_BASE}/api/reports/${id}`)
}