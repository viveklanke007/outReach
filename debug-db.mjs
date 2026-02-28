import dbConnect from "./src/lib/mongodb";
import User from "./src/models/User";

async function test() {
  await dbConnect();
  const users = await User.find({}).limit(5);
  console.log("Users found:", users.map(u => ({ email: u.email, verified: u.email_verified || u.isVerified, hasPass: !!u.password })));
  process.exit(0);
}

test();
