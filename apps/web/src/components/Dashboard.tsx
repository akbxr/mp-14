/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import withAuth from '@/components/Guard';
import axios from 'axios';
import { XAxis, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Area, AreaChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Event, Registration, Transaction } from "@/interface/interfaces";
import GuradPage from '@/components/Guard';




const EventManagementDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [timeRange, setTimeRange] = useState("1y")
  const [chartData, setChartData] = useState([])
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchRegistrations();
    fetchTransactions();
    fetchStatistics();
    fetchEvents();
  }, [timeRange])

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No auth token found');
  }
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };



  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/dashboard/statistics?range=${timeRange}`, { headers })
      setChartData(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/attendees', { headers });
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/transactions', { headers });
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/events', { headers });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const chartConfig = {
    name: {
      label: "Event",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    attendees: {
      label: "Attendees",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const getStatusBadgeVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Event Management Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>List of Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.attendees.length}</TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    IDR {event.transactions.reduce((sum, t) => sum + t.finalAmount, 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

      </Card>
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Event Statistics</CardTitle>
            <CardDescription>
              Showing revenue and attendees for the selected period
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1y" className="rounded-lg">
                Last year
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="1d" className="rounded-lg">
                Today
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillAttendees" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-attendees)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-attendees)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="name" stroke="var(--color-white)" />
              <Area
                dataKey="attendees"
                type="natural"
                fill="url(#fillAttendees)"
                stroke="var(--color-attendees)"
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                stackId="a"
              />
              {/* <ChartLegend content={<ChartLegendContent />} /> */}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>


      <Tabs className='mt-4' defaultValue="registrations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">New Registrations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>New Registrations</CardTitle>
              <CardDescription>Latest attendee registrations for events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Attendee Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.registrationId}>
                      <TableCell>{reg.eventName}</TableCell>
                      <TableCell>{reg.attendeeName}</TableCell>
                      <TableCell>{reg.attendeeEmail}</TableCell>
                      <TableCell>{new Date(reg.registrationDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Recent transactions for events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((trans) => (
                    <TableRow key={trans.transactionId}>
                      <TableCell>{trans.eventName}</TableCell>
                      <TableCell>{trans.userName}</TableCell>
                      <TableCell>IDR {trans.finalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(trans.status)}>
                          {trans.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(trans.transactionDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuradPage(EventManagementDashboard);