'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Event, Registration, Transaction, ChartData } from '@/interface/interfaces';
import GuardPage from '@/components/Guard';


const EventManagementDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [timeRange, setTimeRange] = useState('1y');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeChart, setActiveChart] = useState('revenue');

  useEffect(() => {
    fetchRegistrations();
    fetchTransactions();
    fetchStatistics();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No auth token found');
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/dashboard/statistics?range=${timeRange}`,
        { headers },
      );
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/dashboard/attendees',
        { headers },
      );
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/dashboard/transactions',
        { headers },
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/dashboard/events',
        { headers },
      );
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
    attendees: {
      label: 'Attendees',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const getStatusBadgeVariant = (
    status: Transaction['status'],
  ): 'default' | 'secondary' | 'destructive' => {
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

  const total = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      attendees: chartData.reduce((acc, curr) => acc + curr.attendees, 0),
    }),
    [chartData],
  );

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
                  <TableCell>
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.attendees.length}</TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    IDR{' '}
                    {event.transactions
                      .reduce((sum, t) => sum + t.finalAmount, 0)
                      .toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Event Statistics</CardTitle>
            <CardDescription>
              Showing event statistics for the selected period
            </CardDescription>
          </div>
          <div className="flex">
            {['revenue', 'attendees'].map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="mb-4 flex items-center justify-end gap-2">
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
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Tabs className="mt-4" defaultValue="registrations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">New Registrations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>New Registrations</CardTitle>
              <CardDescription>
                Latest attendee registrations for events
              </CardDescription>
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
                      <TableCell>
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </TableCell>
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
                      <TableCell>
                        IDR {trans.finalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(trans.status)}>
                          {trans.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(trans.transactionDate).toLocaleDateString()}
                      </TableCell>
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

export default GuardPage(EventManagementDashboard);
