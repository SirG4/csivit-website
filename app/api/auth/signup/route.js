import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateAvatarUrl } from "@/lib/avatarGenerator";

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate random avatar
    const avatarUrl = generateAvatarUrl(email);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      image: avatarUrl,
    });

    return Response.json(
      { message: "User created successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: error.message || "Signup failed" },
      { status: 500 }
    );
  }
}
