import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { DiscountController } from './discount.controller';
import { PointController } from './point.controller';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();
const generateReferralCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export class AuthController {
  pointController: PointController;
  discountController: DiscountController;

  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.pointController = new PointController();
    this.discountController = new DiscountController();
  }

  async register(req: Request, res: Response) {
    const { email, password, name, role, referralCode } = req.body;
    console.log(
      `Registration attempt with email: ${email}, referralCode: ${referralCode}`,
    );

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        console.log(`User with email ${email} already exists`);
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newReferralCode = generateReferralCode();
      const verificationToken = crypto.randomBytes(20).toString('hex');

      let userData: {
        email: string;
        password: string;
        name: string;
        role: UserRole;
        referralCode: string;
        referredById?: number;
        verificationToken: string;
        isVerified: boolean;
      } = {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        referralCode: newReferralCode,
        verificationToken,
        isVerified: false,
      };

      if (referralCode) {
        console.log(`Attempting to process referral code: ${referralCode}`);
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (referrer) {
          console.log(`Referrer found with ID: ${referrer.id}`);
          userData = { ...userData, referredById: referrer.id };
        } else {
          console.log(`No referrer found for referral code: ${referralCode}`);
        }
      } else {
        console.log('No referral code provided');
      }

      const user = await prisma.user.create({ data: userData });
      console.log(`New user created with ID: ${user.id}`);

      await this.sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        message:
          'User registered. Please check your email to verify your account.',
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Error registering user', error });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: 'Please verify your email before logging in' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' },
      );
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.params;

    try {
      const user = await prisma.user.findFirst({
        where: { verificationToken: token },
      });
      if (!user) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: null },
      });

      if (user.referredById) {
        await this.pointController
          .addReferralPoints(user.referredById)
          .catch((error) => {
            console.error('Error adding referral points:', error);
          });
        await this.discountController.createDiscountCoupon(user.id);
      }

      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying email', error });
    }
  }

  private async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Please click on the following link to verify your email: ${process.env.APP_URL}/verify/${token}`,
    };

    await transporter.sendMail(mailOptions);
  }
}
