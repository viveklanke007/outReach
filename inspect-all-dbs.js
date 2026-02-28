const mongoose = require('mongoose');

async function run() {
  const dbs = ['outreach', 'quickreach'];
  for (const dbName of dbs) {
    const uri = `mongodb://localhost:27017/${dbName}`;
    console.log(`\nChecking ${dbName}...`);
    try {
      const conn = await mongoose.createConnection(uri).asPromise();
      const User = conn.model('User', new mongoose.Schema({}, { strict: false }), 'users');
      const results = await User.find({});
      if (results.length === 0) {
        console.log("No users found.");
      } else {
        results.forEach(u => {
          console.log(`- Email: ${u.email}, email_verified: ${u.email_verified}, isVerified: ${u.isVerified}`);
        });
      }
      await conn.close();
    } catch (err) {
      console.error(`Error connecting to ${dbName}:`, err.message);
    }
  }
  process.exit(0);
}
run();
 bitumen
