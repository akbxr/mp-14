'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const eventSchema = z.object({
  eventName: z
    .string()
    .min(2, { message: 'Event name must be at least 2 characters long' }),
  date: z.date(),
  time: z.string(),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
  availableSeats: z
    .number()
    .min(1, { message: 'Must have at least 1 available seat' }),
  isPaid: z.boolean(),
  price: z.number().min(0).optional(),
  ticketTypes: z.array(
    z.object({
      name: z.string().min(1, { message: 'Ticket name is required' }),
      price: z.number().min(0, { message: 'Price must be 0 or greater' }),
      quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
    }),
  ),
  promotions: z.object({
    referralDiscount: z.number().min(0),
    referralLimit: z.number().min(0),
    earlyBirdDiscount: z.number().min(0),
    earlyBirdDate: z.date(),
  }),
});

type EventForm = z.infer<typeof eventSchema>;

const CreateEvent: React.FC = () => {
  const [error, setError] = useState('');
  const [organizerImage, setOrganizerImage] = useState<File | null>(null);
  const router = useRouter();

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
      isPaid: false,
      ticketTypes: [{ name: '', price: 0, quantity: 0 }],
      promotions: {
        referralDiscount: 0,
        referralLimit: 0,
        earlyBirdDiscount: 0,
        earlyBirdDate: new Date(),
      },
    },
  });

  const isPaid = watch('isPaid');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (
      file &&
      file.size <= MAX_FILE_SIZE &&
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    ) {
      setOrganizerImage(file);
      setError(''); // Clear any previous errors
    } else {
      setError(
        'Invalid file. Please upload an image (jpg, png, webp) less than 5MB.',
      );
      setOrganizerImage(null); // Clear the invalid image
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const onSubmit = async (data: EventForm) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'organizerImage') {
          if (organizerImage) {
            formData.append(key, organizerImage);
          }
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      const response = await axios.post(
        'http://localhost:8000/api/events/create',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      const responseData = response.data;
      console.log('Event created:', responseData);
      router.push('/dashboard'); // Redirect to dashboard or event list page
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Event creation failed');
      } else {
        console.error(err);
        setError('An error occurred during event creation');
      }
    }
  };

  const addTicketType = () => {
    setValue('ticketTypes', [
      ...watch('ticketTypes'),
      { name: '', price: 0, quantity: 0 },
    ]);
  };

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
              <Label htmlFor="eventName" className="text-lg">
                Event Name
              </Label>
              <Input
                id="eventName"
                {...register('eventName')}
                placeholder="Enter event name"
                className="mt-1"
              />
              {errors.eventName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.eventName.message}
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
              <Label htmlFor="time" className="text-lg">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
                className="mt-1"
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
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
              <Label htmlFor="availableSeats" className="text-lg">
                Available Seats
              </Label>
              <Input
                id="availableSeats"
                type="number"
                {...register('availableSeats', { valueAsNumber: true })}
                placeholder="Enter number of available seats"
                className="mt-1"
              />
              {errors.availableSeats && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.availableSeats.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center text-lg">
            <input type="checkbox" {...register('isPaid')} className="mr-2" />
            Is this a paid event?
          </label>

          {isPaid && (
            <div>
              <Label htmlFor="price" className="text-lg">
                Price (IDR)
              </Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="Enter event price"
                className="mt-1"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Ticket Types</h3>
          {watch('ticketTypes').map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              <Input
                {...register(`ticketTypes.${index}.name` as const)}
                placeholder="Ticket Name"
              />
              <Input
                type="number"
                {...register(`ticketTypes.${index}.price` as const, {
                  valueAsNumber: true,
                })}
                placeholder="Price (IDR)"
              />
              <Input
                type="number"
                {...register(`ticketTypes.${index}.quantity` as const, {
                  valueAsNumber: true,
                })}
                placeholder="Quantity"
              />
            </div>
          ))}
          <Button type="button" onClick={addTicketType} variant="outline">
            Add Ticket Type
          </Button>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Promotions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="referralDiscount" className="text-lg">
                Referral Discount (IDR)
              </Label>
              <Input
                id="referralDiscount"
                type="number"
                {...register('promotions.referralDiscount', {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="referralLimit" className="text-lg">
                Referral Limit
              </Label>
              <Input
                id="referralLimit"
                type="number"
                {...register('promotions.referralLimit', {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="earlyBirdDiscount" className="text-lg">
                Early Bird Discount (IDR)
              </Label>
              <Input
                id="earlyBirdDiscount"
                type="number"
                {...register('promotions.earlyBirdDiscount', {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="earlyBirdDate" className="text-lg">
                Early Bird Date
              </Label>
              <Controller
                name="promotions.earlyBirdDate"
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

        <div className="space-y-4">
          <Label htmlFor="organizerImage" className="text-lg">
            Organizer Image
          </Label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition duration-300"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-center">Drop the image here ...</p>
            ) : (
              <p className="text-center">
                Drag 'n' drop an image here, or click to select an image
              </p>
            )}
          </div>
          {organizerImage && (
            <div className="mt-4">
              <p>Selected file: {organizerImage.name}</p>
              <img
                src={URL.createObjectURL(organizerImage)}
                alt="Preview"
                className="mt-2 max-w-full h-auto"
              />
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
