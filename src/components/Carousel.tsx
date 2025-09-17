"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useDate } from "@/lib/stores/DateContext";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function MonthSlider() {
  const { year, setMonth, month, setYear } = useDate();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  console.log("current :", year + " " + month);
  React.useEffect(() => {
    if (!api) return;

    const targetIndex = Number(month) - 1;
    api.scrollTo(targetIndex);
    setCurrent(targetIndex);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, month]);

  return (
    <div className="mx-auto max-w-md flex justify-center items-center">
      <Carousel
        setApi={setApi}
        className="w-full max-w-md"
        opts={{ loop: true }}
      >
        <CarouselContent className="">
          {months.map((name, index) => (
            <CarouselItem
              key={index}
              className={cn("basis-[33%]", {})}
              onClick={() => {
                const clickedMonth = String(index + 1).padStart(2, "0");
                if (clickedMonth === "12" && month === "01") {
                  setYear(String(Number(year) - 1));
                } else if (clickedMonth === "01" && month === "12") {
                  setYear(String(Number(year) + 1));
                }

                setMonth(clickedMonth);
                api?.scrollTo(index);
              }}
            >
              <Card
                className={cn(
                  "transition-transform duration-500 shadow-none border-0",
                  {
                    "scale-100": index === current,
                    "text-primary/75 scale-75 cursor-pointer":
                      index !== current,
                  }
                )}
              >
                <CardContent className="flex items-center justify-center">
                  <span className="text-4xl font-semibold">{name}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
