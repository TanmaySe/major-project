"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
let chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig
export default function TasksPerMember({tasks,members}) {
  const freqMap: Record<string,number> = {}
  const freqArray = []
  for(const task of tasks) {
    if(!task.assigned) continue
    for(const assignee of task.assigned) {
      freqMap[assignee] = (freqMap[assignee] || 0) + 1
    }
  }
  console.log("Tasks : ",tasks)
  for(const key of Object.keys(freqMap)) {
    freqArray.push({member:key,tasks:freqMap[key]})
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Task burden on members</CardTitle>
          <CardDescription>Check which member is assigned how many tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={freqArray}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="member"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 9)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="tasks" fill="var(--color-tasks)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
   
        </CardFooter>
  
      </Card>
    </>
  )
}
