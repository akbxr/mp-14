'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../app/utils/AuthContext';
import axios from 'axios';

const CATEGORIES = [
  { value: 'Music', label: 'Music' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts', label: 'Arts & Culture' },
  { value: 'Food', label: 'Food & Drink' },
  { value: 'Business', label: 'Business' },
];

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  category: z.enum([
    'Music',
    'Technology',
    'Sports',
    'Arts',
    'Food',
    'Business',
  ]),
  isFreeEvent: z.boolean(),
  capacity: z.number().positive('Capacity must be a positive number'),
  tickets: z
    .array(
      z.object({
        type: z.string().min(3, 'Ticket type must be at least 3 characters'),
        price: z.number().nonnegative('Price must be a non-negative number'),
        quantity: z.number().positive('Quantity must be a positive number'),
        description: z.string().optional(),
      }),
    )
    .optional(),
  promotion: z
    .object({
      discountPercent: z
        .number()
        .min(0, 'Discount percent must be at least 0')
        .max(100, 'Discount percent cannot exceed 100'),
      startDate: z.date(),
      endDate: z.date(),
    })
    .optional(),
});

type EventForm = z.infer<typeof eventSchema>;

const CreateEvent: React.FC = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoggedIn, userRole } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      date: new Date(),
      location: '',
      category: 'Music',
      isFreeEvent: false,
      capacity: 0,
      tickets: [{ type: '', price: 0, quantity: 0, description: '' }],
    },
  });

  const isFreeEvent = watch('isFreeEvent');

  useEffect(() => {
    if (isFreeEvent) {
      setValue('tickets', undefined);
    } else if (!watch('tickets')) {
      setValue('tickets', [
        { type: '', price: 0, quantity: 0, description: '' },
      ]);
    }
  }, [isFreeEvent, setValue, watch]);

  const onSubmit = async (data: EventForm) => {
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        ...data,
        tickets: isFreeEvent ? undefined : data.tickets,
      };

      const response = await axios.post(
        'http://localhost:8000/api/create-event',
        eventData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Event created:', response.data);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Event creation failed');
      } else {
        console.error(err);
        setError('An error occurred during event creation');
      }
    }
  };

  const addTicket = () => {
    const currentTickets = watch('tickets') || [];
    setValue('tickets', [
      ...currentTickets,
      { type: '', price: 0, quantity: 0, description: '' },
    ]);
  };

  if (!isLoggedIn || userRole !== 'ORGANIZER') {
    return (
      <div className="min-h-screen bg-background p-8 text-center">
        <div className="text-red-500 text-lg mt-4">
          You must be logged in as an organizer to create an event.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-600">
        Create New Event
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-lg">
                Event Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter event name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="date" className="text-lg">
                Date
              </Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    className="w-full p-2 border rounded mt-1"
                  />
                )}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-lg">
                Location
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Enter event location"
                className="mt-1"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-lg">
                Category
              </Label>
              <select
                id="category"
                {...register('category')}
                className="w-full p-2 border rounded mt-1"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-lg">
                Description
              </Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full p-2 border rounded mt-1"
                rows={4}
                placeholder="Enter event description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="capacity" className="text-lg">
                Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="Enter event capacity"
                className="mt-1"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center text-lg">
            <input
              type="checkbox"
              {...register('isFreeEvent')}
              className="mr-2"
            />
            Is this a free event?
          </label>
        </div>

        {!isFreeEvent && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Tickets</h3>
            {watch('tickets')?.map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`tickets.${index}.type`}>Ticket Type</Label>
                  <Input
                    id={`tickets.${index}.type`}
                    {...register(`tickets.${index}.type`)}
                    placeholder="Ticket Type"
                  />
                </div>
                <div>
                  <Label htmlFor={`tickets.${index}.price`}>Price</Label>
                  <Input
                    id={`tickets.${index}.price`}
                    type="number"
                    {...register(`tickets.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Price"
                  />
                </div>
                <div>
                  <Label htmlFor={`tickets.${index}.quantity`}>Quantity</Label>
                  <Input
                    id={`tickets.${index}.quantity`}
                    type="number"
                    {...register(`tickets.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Quantity"
                  />
                </div>
                <div>
                  <Label htmlFor={`tickets.${index}.description`}>
                    Description (optional)
                  </Label>
                  <Input
                    id={`tickets.${index}.description`}
                    {...register(`tickets.${index}.description`)}
                    placeholder="Description (optional)"
                  />
                </div>
              </div>
            ))}
            <Button type="button" onClick={addTicket} variant="outline">
              Add Ticket
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Promotion (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="discountPercent" className="text-lg">
                Discount Percent
              </Label>
              <Input
                id="discountPercent"
                type="number"
                {...register('promotion.discountPercent', {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="startDate" className="text-lg">
                Start Date
              </Label>
              <Controller
                name="promotion.startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    className="w-full p-2 border rounded mt-1"
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-lg">
                End Date
              </Label>
              <Controller
                name="promotion.endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    className="w-full p-2 border rounded mt-1"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

        <Button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 py-3 text-lg"
        >
          Create Event
        </Button>
      </form>
    </div>
  );
};

export default CreateEvent;
