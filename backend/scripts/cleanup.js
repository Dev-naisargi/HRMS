const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Project-HRMS').then(async () => {
  try {
    const unnamed = await mongoose.connection.collection('companies').updateMany(
      { $or: [{ name: { $exists: false } }, { name: null }, { name: "" }] },
      { $set: { name: 'Legacy Company Found', domain: 'legacy.local' } }
    );
    console.log('Fixed missing names:', unnamed.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
