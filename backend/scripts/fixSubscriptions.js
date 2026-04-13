const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  const r = await mongoose.connection.collection('companies').updateMany(
    {},
    { 
      $set: { 
        status: 'APPROVED',
        'subscription.isActive': true,
        'subscription.plan': 'BASIC',
        'subscription.startDate': new Date(),
        'subscription.endDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      } 
    }
  );
  console.log('Fixed subscriptions for companies:', r.modifiedCount);
  process.exit();
});
