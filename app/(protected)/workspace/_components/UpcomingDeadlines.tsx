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
export default function UpcomingDeadlines({tasks,members}) {
  const [freqArray,setFreqArray] = useState([])
  useEffect(() => {
    const today = new Date()
    const sanitisedArray = []
    const freqMap: Record<string, number> = {}
    const tempfreqArray = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (const task of tasks) {
      if (task.deadline !== null) {
        if (task.deadline.slice(0, 4) === today.getFullYear().toString()) {
          sanitisedArray.push(task)
        }
      }
    }

    for (const task of sanitisedArray) {
      const monthNum = task.deadline.slice(5, 7) // "01" to "12"
      freqMap[monthNum] = (freqMap[monthNum] || 0) + 1
    }

     // Convert and sort months chronologically
    Object.keys(freqMap)
      .sort((a, b) => parseInt(a) - parseInt(b)) // sort numerically by month number
      .forEach((monthNum) => {
        tempfreqArray.push({
          month: monthNames[parseInt(monthNum) - 1],
          pendingTasks: freqMap[monthNum],
        })
      })

    setFreqArray(tempfreqArray)
  }, [tasks])


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Check which member is assigned how many tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={freqArray}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 9)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="pendingTasks" fill="var(--color-tasks)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">

        </CardFooter>

      </Card>
    </>
  )
}
