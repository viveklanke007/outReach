const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb://localhost:27017/outreach";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('outreach');
    const users = database.collection('users');
    const query = {};
    const cursor = users.find(query);
    const results = await cursor.toArray();
    console.log("Users in DB:");
    results.forEach(u => {
      console.log(`- Email: ${u.email}, Verified: ${u.email_verified}, isVerified: ${u.isVerified}`);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
