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
import { useEffect, useState } from "react"

const chartConfig = {
  todo: {
    label: "Low",
    color: "hsl(var(--chart-1))",
  },
  inprogress: {
    label: "Medium",
    color: "hsl(var(--chart-2))",
  },
  done: {
    label: "High",
    color: "hsl(var(--chart-3))",
  },
  na: {
    label: "NA",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig

export default function TasksPerMemberByPriority({tasks,members}) {
  const [freqArray,setFreqArray] = useState([])
  useEffect(() => {

    const freqMap: Record<string,Record<string,number>> = {}
    const newfreqArray = []
    for(const task of tasks) {
      if(!task.assigned) continue
      for (const assignee of task.assigned) {
        if (!freqMap[assignee]) {
          freqMap[assignee] = { Low: 0, Medium: 0, High: 0 ,NA:0}
        }
        if(task.priority !== null){
        freqMap[assignee][task.priority] += 1
        }
        else{
          freqMap[assignee]["NA"] +=1
        }
      }

    }
    for(const key of Object.keys(freqMap)) {
      newfreqArray.push({member:key,Low:freqMap[key]['Low'],Medium:freqMap[key]['Medium'],High:freqMap[key]['High'],NA:freqMap[key]['NA']})
    }
    setFreqArray(newfreqArray)

  },[tasks])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks per member by priority</CardTitle>
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
              dataKey="Low"
              stackId="a"
              fill="var(--color-todo)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="Medium"
              stackId="a"
              fill="var(--color-inprogress)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="High"
              stackId="a"
              fill="var(--color-done)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="NA"
              stackId="a"
              fill="var(--color-na)"
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
