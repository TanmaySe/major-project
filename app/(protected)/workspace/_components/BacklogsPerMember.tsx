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
export default function BacklogsPerMember({tasks,members}) {
  const [hasDeadlineTasks,setHasDeadlineTasks] = useState(true)
  const [freqArray, setFreqArray] = useState([])
  useEffect(() => {
    const freqMap: Record<string, number> = {}
    const today = new Date().toISOString().slice(0, 10)

    for (const task of tasks) {
      if (!task.assigned || !task.deadline || task.category === "done") continue
      if (today > task.deadline) {
        for (const assignee of task.assigned) {
          freqMap[assignee] = (freqMap[assignee] || 0) + 1
        }
      }
    }

    const newFreqArray = Object.keys(freqMap).map((key) => ({
      member: key,
      tasks: freqMap[key],
    }))

    setFreqArray(newFreqArray)
    setHasDeadlineTasks(newFreqArray.length > 0)
  }, [tasks])
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Backlogs per member</CardTitle>
          <CardDescription>Check backlogs for team members.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasDeadlineTasks && (
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
          )}
          {!hasDeadlineTasks && (
      <div className="w-full rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-muted/40">
        <p className="text-base font-medium">🎉 No backlogs!</p>
        <p className="text-sm mt-1">Everyone is on track. Keep up the great work!</p>
      </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          Tasks with no deadline are not taken into consideration
        </CardFooter>

      </Card>
    </>
  )
}
