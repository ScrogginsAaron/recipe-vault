import prisma from "../config/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import type {
  NextFunction,
  Request,
  Response
} from "express";
  
// Ensures that only safe fields are sent back to the client.
function serializeUser(user: {
  id: string;
  email: string;
  createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Prevents multiple accounts from using the same email address.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Stores a hashed password instead of a raw password for security.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: serializeUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });


    // Using the same error message for both cases increases security by not letting the user
    // know if a specific email exists in the system.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: serializeUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Whether the email already exists in the system.
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: serializeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
};