/**
 * Admin API Router Index
 * Mounts all admin routes under /api/admin
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const productsRoutes = require('./products');
const ordersRoutes = require('./orders');
const customersRoutes = require('./customers');
const usersRoutes = require('./users');
const auditLogsRoutes = require('./auditLogs');
const carouselRoutes = require('./carousel');
const premiumBeansRoutes = require('./premiumBeans');

// Mount routes
router.use('/', authRoutes);              // /api/admin/auth/*, /me
router.use('/dashboard', dashboardRoutes); // /api/admin/dashboard/*
router.use('/products', productsRoutes);   // /api/admin/products/*
router.use('/orders', ordersRoutes);       // /api/admin/orders/*
router.use('/customers', customersRoutes); // /api/admin/customers/*
router.use('/users', usersRoutes);         // /api/admin/users/*
router.use('/audit-logs', auditLogsRoutes); // /api/admin/audit-logs
router.use('/carousel', carouselRoutes);   // /api/admin/carousel/*
router.use('/premium-beans', premiumBeansRoutes); // /api/admin/premium-beans/*

module.exports = router;
