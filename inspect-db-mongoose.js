const mongoose = require('mongoose');

async function run() {
  const uri = "mongodb://localhost:27017/outreach";
  try {
    await mongoose.connect(uri);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, email_verified: Boolean, isVerified: Boolean }, { strict: false }));
    const results = await User.find({});
    console.log("Users in DB:");
    results.forEach(u => {
      console.log(`- Email: ${u.email}, email_verified: ${u.email_verified}, isVerified: ${u.isVerified}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
