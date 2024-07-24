"use client"

import React, { useState, useEffect } from "react"
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User } from "@/interface/interfaces"


// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function ProfilePage() {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await api.get('/user/profile', { headers });
      setUser(response.data)
      setName(response.data.name || '')
      setEmail(response.data.email || '')
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to fetch user data. Please try again.')
    }
  }

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No auth token found');
      }
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await api.put('/user/profile', {
        name,
        email,
        currentPassword,
        newPassword,
      }, { headers })

      if (response.status === 200) {
        setIsEditProfileOpen(false)
        setIsConfirmationOpen(true)
        await fetchUserData() // Refresh user data
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    }
  }

  const handleConfirmChanges = () => {
    setIsConfirmationOpen(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-muted">
      <div className="flex flex-col items-center">
        <Card className="w-full md:m-24 m-12">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="m-2">{user?.name || 'Loading...'}</CardTitle>
              <CardDescription>Email: {user?.email || 'Loading...'}</CardDescription>
              <CardDescription>Role: {user?.role || 'Loading...'}</CardDescription>
              <CardDescription>Referral Code: {user?.referralCode || 'Loading...'}</CardDescription>
              <CardDescription>Points: {user?.points !== undefined ? user.points : 'Loading...'}</CardDescription>
              {user?.discountCoupons.map((coupon) => (
                <div key={coupon.id}>
                  <CardDescription className="text-lg mt-2 text-black">Discount Coupon</CardDescription>
                  <CardDescription>Code: {coupon.code} </CardDescription>
                  <CardDescription>Discount: {coupon.discount}% </CardDescription>
                  <CardDescription>Expires: {formatDate(coupon.expiresAt)} </CardDescription>
                  <CardDescription>{coupon.isUsed ? <b>Used</b> : <b>Unused</b>}</CardDescription>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={handleEditProfile}>Edit Profile</Button>
          </CardContent>
        </Card>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex justify-center">
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Edit your profile details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 flex flex-col items-center">
              <div className="space-y-2 w-full">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={handleSaveProfile}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex justify-center">
              <DialogTitle>Profile Updated</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">Your profile has been successfully updated.</div>
            <DialogFooter className="flex justify-center gap-2">
              <Button onClick={handleConfirmChanges}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  )
}