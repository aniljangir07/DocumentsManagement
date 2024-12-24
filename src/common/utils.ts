import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';



/**
 * Hashes a password with a salt and returns the hashed password.
 * @param password - The password to hash
 * @param saltRounds - The number of salt rounds (default: 12)
 * @returns The hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 12): Promise<string> => {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
};


/**
 * Generates a random OTP and sets its expiry time.
 * @param expiryHours - Number of hours until the OTP expires (default: 1 hour)
 * @returns An object containing the OTP and its expiry time
 */
export const generateOtp = (expiryHours: number = 1): { otp: number, otpExpiry: Date } => {
      const otp = 12345
      const otpExpiry = new Date();
      otpExpiry.setHours(otpExpiry.getHours() + expiryHours);

      return { otp, otpExpiry };
};

export const calculateTimeDiffInMinutes = (currentTime: Date, otpExpiryTime: Date): number => {
      return (currentTime.getTime() - otpExpiryTime.getTime()) / (1000 * 60);
};

export const generateToken = (userId: string, email: string, role: string): string => {
      const payload = { userId, email, role };
      const secretKey = process.env.JWT_SECRET || '800ANIL31JANGID77721';
      const options = { expiresIn: '7d' };

      return jwt.sign(payload, secretKey, options);
};