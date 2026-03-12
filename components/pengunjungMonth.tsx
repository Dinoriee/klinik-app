'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"; 
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { useState } from "react";

const chartConfig = {
  total: {
    label: "Total Pengunjung",
    color: "#2563eb",
  },
} satisfies ChartConfig;

interface chartItem{
  label: string;
  total: number;
}

interface ChartDataProps {
  month: chartItem[];
  monthly: chartItem[];
  weekly: chartItem[];
}

export interface GroupedData {
  month: chartItem[];
  monthly: chartItem[];
  weekly: chartItem[];
}



export default function PengunjungMonth({ chartData }: { chartData: ChartDataProps }) {
  const [filter, setFilter] = useState<keyof ChartDataProps>("month");
  
  const currentData= chartData[filter];

  let data;
  let informasi;

  if(filter === "month"){
    data = "bulan",
    informasi = "Data 4 Bulan Terakhir"
  }else if(filter === "monthly"){
    data = "tanggal",
    informasi = "Data 1 Bulan Terakhir"
  }else{
    data = "hari",
    informasi = "Data 1 Minggu Terakhir"
  }
  
  // const bulanTerbaru = chartData && chartData.length > 0 
  //       ? chartData[chartData.length - 1]?.bulan 
  //       : "";

  //   const bulanTerlama = chartData && chartData.length > 0 
  //       ? chartData[0]?.bulan 
  //       : "";
  
    return (
    <Card>
        <CardHeader>
            <CardTitle>{informasi}</CardTitle>
            <CardDescription>Detail data</CardDescription>
            <NativeSelect onChange={(e) => setFilter(e.target.value as keyof GroupedData)}>
              <NativeSelectOption value="month">4 Bulan</NativeSelectOption>
              <NativeSelectOption value="monthly">1 Bulan</NativeSelectOption>
              <NativeSelectOption value="weekly">1 Minggu</NativeSelectOption>
            </NativeSelect>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart data={currentData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={data}
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