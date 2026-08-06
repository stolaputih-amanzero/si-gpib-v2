'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  duration: number;
  failures: number;
  successes: number;
  date: string;
}

interface TelemetryChartsProps {
  chartData: ChartData[];
}

export default function TelemetryCharts({ chartData }: TelemetryChartsProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardContent className="h-72 flex items-center justify-center text-muted-foreground">Belum ada data sinkronisasi</CardContent></Card>
        <Card><CardContent className="h-72 flex items-center justify-center text-muted-foreground">Belum ada data sinkronisasi</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Duration Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" fontSize={12} tickMargin={10} />
              <YAxis fontSize={12} unit="ms" />
              <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Success vs Failures</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" fontSize={12} tickMargin={10} />
              <YAxis fontSize={12} />
              <Bar dataKey="successes" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="failures" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
