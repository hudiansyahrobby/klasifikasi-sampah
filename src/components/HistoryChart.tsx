"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import styles from "../app/page.module.css";

const data = [
  { name: "Organik", value: 400, color: "url(#colorOrganic)", dropShadow: "rgba(16, 185, 129, 0.6)" },
  { name: "Anorganik", value: 300, color: "url(#colorInorganic)", dropShadow: "rgba(59, 130, 246, 0.6)" },
  { name: "B3 (Berbahaya)", value: 100, color: "url(#colorHazardous)", dropShadow: "rgba(239, 68, 68, 0.6)" },
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={-6} textAnchor="middle" fill="var(--foreground)" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
        {value} Item
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 8px 16px ${payload.dropShadow})`, cursor: 'pointer' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--foreground)" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{`Total: ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="var(--foreground)" opacity={0.6} style={{ fontSize: '0.875rem' }}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

type ChartData = {
  name: string;
  value: number;
  color: string;
  dropShadow: string;
};

// Initial state
const initialData = [
  { name: "Organik", value: 0, color: "url(#colorOrganic)", dropShadow: "rgba(16, 185, 129, 0.6)" },
  { name: "Anorganik", value: 0, color: "url(#colorInorganic)", dropShadow: "rgba(59, 130, 246, 0.6)" },
  { name: "B3 (Berbahaya)", value: 0, color: "url(#colorHazardous)", dropShadow: "rgba(239, 68, 68, 0.6)" },
];

export default function HistoryChart() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState<ChartData[]>(initialData);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/stats");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        // Map the backend data to our specific ui configuration
        const formattedData = json.data.map((item: any) => {
          let color = "url(#colorOrganic)";
          let dropShadow = "rgba(16, 185, 129, 0.6)";

          if (item.name.toLowerCase().includes("anorganik")) {
            color = "url(#colorInorganic)";
            dropShadow = "rgba(59, 130, 246, 0.6)";
          } else if (item.name.toLowerCase().includes("b3")) {
            color = "url(#colorHazardous)";
            dropShadow = "rgba(239, 68, 68, 0.6)";
          }

          return {
            name: item.name,
            value: item.value || 1, // Minimum 1 for display if 0 wasn't sent
            color,
            dropShadow
          };
        });
        setData(formattedData);
      }
    } catch (err) {
      console.error("Gagal mengambil data stats", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className={styles.chartContainer}>Loading chart...</div>;
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="colorOrganic" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="colorInorganic" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="colorHazardous" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
            </linearGradient>
          </defs>
          <Pie
            {...({ activeIndex } as any)}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={115}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            stroke="none"
            animationDuration={1500}
            animationEasing="ease-out"
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
