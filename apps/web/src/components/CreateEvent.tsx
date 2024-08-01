'use client';

import React, { useState } from 'react';
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
  category: z.union([
    z.literal('Music'),
    z.literal('Technology'),
    z.literal('Sports'),
    z.literal('Arts'),
    z.literal('Food'),
    z.literal('Business'),
  ]),
  isFreeEvent: z.boolean(),
  capacity: z.number().positive('Capacity must be a positive number'),
  tickets: z.array(
    z.object({
      type: z.string().min(3, 'Ticket type must be at least 3 characters'),
      price: z.number().positive('Price must be a positive number'),
      quantity: z.number().positive('Quantity must be a positive number'),
      description: z.string().optional(),
    }),
  ),
  promotion: z
    .object({
      discountPercent: z.number().min(0, 'Discount percent must be at least 0'),
      startDate: z.date(),
      endDate: z.date(),
    })
    .optional(),
});

type EventForm = Omit<z.infer<typeof eventSchema>, 'category'> & {
  category: (typeof CATEGORIES)[number]['value'];
};

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
      category: CATEGORIES[0].value,
      isFreeEvent: false,
      capacity: 0,
      tickets: [{ type: '', price: 0, quantity: 0, description: '' }],
      promotion: {
        discountPercent: 0,
        startDate: new Date(),
        endDate: new Date(),
      },
    },
  });

  const onSubmit = async (data: EventForm) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/create-event',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Event created:', response.data);
      router.push('/dashboard'); // Redirect to dashboard or event list page
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
    setValue(`tickets.${watch('tickets').length}`, {
      type: '',
      price: 0,
      quantity: 0,
      description: '',
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-600">
        Create New Event
      </h1>
      {!isLoggedIn || userRole !== 'ORGANIZER' ? (
        <div className="text-red-500 text-sm mt-4">
          You must be logged in as an organizer to create an event.
        </div>
      ) : (
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
                      onChange={(date: Date | null) =>
                        field.onChange(date || new Date())
                      }
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
                  <option value="">Select a category</option>
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

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Tickets</h3>
            {watch('tickets').map((_, index) => (
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
                      onChange={(date: Date | null) =>
                        field.onChange(date || new Date())
                      }
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
                      onChange={(date: Date | null) =>
                        field.onChange(date || new Date())
                      }
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
      )}
    </div>
  );
};

export default CreateEvent;
