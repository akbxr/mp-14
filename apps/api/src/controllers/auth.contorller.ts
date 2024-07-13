import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { DiscountController } from './discount.controller';
import { PointController } from './point.controller';


const prisma = new PrismaClient();

const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export class AuthController {
  pointController: PointController;
  discountController: DiscountController;

  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.pointController = new PointController();
    this.discountController = new DiscountController();
  }

  async register(req: Request, res: Response) {
    const { email, password, name, role, referralCode } = req.body;
    console.log(`Registration attempt with email: ${email}, referralCode: ${referralCode}`);

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        console.log(`User with email ${email} already exists`);
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newReferralCode = generateReferralCode();

      let userData: {
        email: any;
        password: string;
        name: any;
        role: UserRole;
        referralCode: string;
        referredById?: number;
      } = {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        referralCode: newReferralCode,
      };

      if (referralCode) {
        console.log(`Attempting to process referral code: ${referralCode}`);
        const referrer = await prisma.user.findUnique({ where: { referralCode } });
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

      if (user.referredById) {
        await this.pointController.addReferralPoints(user.referredById).catch(error => {
          console.error('Error adding referral points:', error);
        });
        await this.discountController.createDiscountCoupon(user.id);
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
      res.status(201).json({ user, token });
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

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }


}