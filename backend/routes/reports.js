/**
 * Routes for Report operations
 * Defines REST API endpoints for analytics and reporting
 * Uses the layered architecture: Controller → Service → DAO → DB
 * Follows RESTful conventions and proper error handling
 */
const express = require('express')
const router = express.Router()
const ReportController = require('../controllers/ReportController')
const AuthController = require('../controllers/AuthController')

// Initialize controllers
const reportController = new ReportController()
const authController = new AuthController()

// Middleware for authentication
const authenticate = authController.authenticateMiddleware()

// GET /api/reports - Get all reports
router.get('/', authenticate, reportController.getAllReports.bind(reportController))

// POST /api/reports/generate - Generate a new report
router.post('/generate', authenticate, reportController.generateReport.bind(reportController))

// GET /api/reports/:id - Get a specific report by ID
router.get('/:id', authenticate, reportController.getReportById.bind(reportController))

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', authenticate, reportController.deleteReport.bind(reportController))

// GET /api/reports/type/:type - Get reports by type
router.get('/type/:type', authenticate, reportController.getLatestReportByType.bind(reportController))

// GET /api/reports/date-range - Get reports within a date range
router.get('/date-range', authenticate, reportController.getDashboardStats.bind(reportController))

// GET /api/reports/analytics/overview - Get analytics overview
router.get('/analytics/overview', authenticate, reportController.getDashboardStats.bind(reportController))

// GET /api/reports/analytics/efficiency - Get efficiency analytics
router.get('/analytics/efficiency', authenticate, reportController.generateEfficiencyReport.bind(reportController))

// GET /api/reports/analytics/bin-performance - Get bin performance analytics
router.get('/analytics/bin-performance', authenticate, reportController.getDashboardStats.bind(reportController))

module.exports = router