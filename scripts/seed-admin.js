const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "Error: MONGO_URI is not defined. \nRun with: node --env-file=.env.local scripts/seed-admin.js <name> <email> <password>"
  );
  process.exit(1);
}

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: "user" },
  provider: { type: String, default: "credentials" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log(
      "Usage: node --env-file=.env.local scripts/seed-admin.js <name> <email> <password>"
    );
    process.exit(1);
  }

  const [name, email, password] = args;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      provider: "credentials",
    };

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      userData,
      { upsert: true, new: true }
    );

    console.log(`\n✅ Admin user seeded successfully!`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nYou can now log in at /login with these credentials.`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seed();

// node --env-file=.env.local scripts/seed-admin.js "[username]" "[EMAIL_ADDRESS]" "[PASSWORD]"