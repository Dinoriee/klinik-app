'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"; 
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const chartConfig = {
  total: {
    label: "Total Pengunjung",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface PengunjungHarian{
  jam: string;
  total: number;
}

export default function PengunjungMonth({ chartData }: { chartData: PengunjungHarian[] }) {
    const bulanTerbaru = chartData && chartData.length > 0 
        ? chartData[chartData.length - 1]?.jam 
        : "";

    const bulanTerlama = chartData && chartData.length > 0 
        ? chartData[0]?.jam 
        : "";

    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
}).format(today);

  
    return (
    <Card>
        <CardHeader>
            <CardTitle>Total Pengunjung 24 Jam Terakhir</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="jam"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <Tooltip />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
        </CardContent>
    </Card>
  );
}