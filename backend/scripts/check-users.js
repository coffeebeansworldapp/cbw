#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-beans-world')
  .then(async () => {
    const Customer = require('../models/Customer');
    
    console.log('\n📊 MongoDB Users:');
    console.log('=================\n');
    
    const customers = await Customer.find()
      .select('email fullName firebaseUid authProvider emailVerified createdAt lastLoginAt')
      .sort({ createdAt: -1 });
    
    if (customers.length === 0) {
      console.log('❌ No users found. Sign in from the app first!\n');
    } else {
      customers.forEach((customer, i) => {
        console.log(`${i + 1}. ${customer.email}`);
        console.log(`   Name: ${customer.fullName}`);
        console.log(`   Provider: ${customer.authProvider}`);
        console.log(`   Firebase UID: ${customer.firebaseUid}`);
        console.log(`   Email Verified: ${customer.emailVerified}`);
        console.log(`   Created: ${customer.createdAt.toLocaleString()}`);
        console.log(`   Last Login: ${customer.lastLoginAt?.toLocaleString() || 'Never'}\n`);
      });
    }
    
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
