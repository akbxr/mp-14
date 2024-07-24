import { Request, Response } from 'express';
import { PrismaClient, UserRole, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default class UserController {
  async getUser(req: Request, res: Response) {
    const userId = req.user?.id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          role: true,
          points: true,
          referralCode: true,
          discountCoupons: true,
          purchasedTickets: true,
        }
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    const userId = req.user?.id;
    const { name, email, currentPassword, newPassword } = req.body;
    try {

      if (!name && !email && !newPassword) {
        return res.status(400).json({ message: 'At least one field (name, email, or newPassword) must be provided for update' });
      }


      const updateData: Partial<User> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;


      if (newPassword) {

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
          return res.status(404).json({ message: 'User not found or password not set' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateData.password = hashedPassword;
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          points: true,
          referralCode: true,
        }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user', error });
    }
  }
}