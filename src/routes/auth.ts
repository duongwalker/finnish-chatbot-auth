import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/jwt";

const router = Router();

// Health check route
router.get("/", (req: Request, res: Response) => {
  res.send("✅ Finnish Chatbot Auth Server is running!");
});


// Signup
router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ detail: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ detail: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ detail: "Invalid credentials" });

    const token = generateToken(email);
    res.json({ access_token: token, token_type: "bearer" });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

export default router;
