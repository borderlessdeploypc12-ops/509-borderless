"use client";

import { useState } from "react";

import { DashboardBarChart } from "@/components/dashboard/dashboard-bar-chart";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ChartTab = {
  value: string;
  label: string;
};

type ChartSeries = {
  label: string;
  value: number;
};

type DashboardChartPanelProps = {
  title: string;
  tabs: ChartTab[];
  dataByTab: Record<string, ChartSeries[]>;
  variant?: "horizontal" | "vertical";
  footnotes?: string[];
  valueSuffix?: string;
  barClassName?: string;
};

export function DashboardChartPanel({
  title,
  tabs,
  dataByTab,
  variant = "horizontal",
  footnotes = [],
  valueSuffix,
  barClassName,
}: DashboardChartPanelProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value ?? "");

  const chartItems = dataByTab[activeTab] ?? [];

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="space-y-4 border-b border-border/60 pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-0 bg-transparent p-0"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none px-0 py-2 text-xs font-medium uppercase tracking-wide after:bottom-0 sm:mr-5 sm:text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 py-6">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={cn(activeTab === tab.value ? "block" : "hidden")}
          >
            <DashboardBarChart
              items={(dataByTab[tab.value] ?? []).map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              variant={variant}
              valueSuffix={valueSuffix}
              barClassName={
                barClassName ??
                (variant === "horizontal" ? "bg-emerald-500" : "bg-sky-400")
              }
            />
          </div>
        ))}

        {chartItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </p>
        ) : null}
      </CardContent>

      {footnotes.length > 0 ? (
        <CardFooter className="flex-col items-start gap-1 border-t border-border/60 bg-muted/20 px-5 py-3">
          {footnotes.map((note) => (
            <p key={note} className="text-xs text-muted-foreground">
              {note}
            </p>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
}
