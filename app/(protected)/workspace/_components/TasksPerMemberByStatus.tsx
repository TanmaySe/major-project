"use client"

import { TrendingUp } from "lucide-react"
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  todo: {
    label: "To do",
    color: "hsl(var(--chart-1))",
  },
  inprogress: {
    label: "In progress",
    color: "hsl(var(--chart-2))",
  },
  done: {
    label: "Done",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function TasksPerMemberByStatus({tasks,members}) {
  const freqMap: Record<string,Record<string,number>> = {}
  const freqArray = []
  for(const task of tasks) {
    if(!task.assigned) continue
    for(const assignee of task.assigned) {
      freqMap[assignee][task.category] = freqMap[assignee][task.category] | 0 + 1;
    }
  }
  for(const key of Object.keys(freqMap)) {
    freqArray.push({member:key,todo:freqMap[key]['todo'],inprogress:freqMap[key]['inprogress'],done:freqMap[key]['done']})
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks per member by status</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="todo"
              stackId="a"
              fill="var(--color-desktop)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="inprogress"
              stackId="a"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="done"
              stackId="a"
              fill="var(--color-mobile)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        
      </CardFooter>
    </Card>
  )
}
