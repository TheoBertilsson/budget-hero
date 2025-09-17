import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";

import { useSavingsGoal } from "@/lib/stores/SavingsGoal";

const categories = [
  {
    value: "housing",
    label: "Housing",
  },
  {
    value: "transport",
    label: "Transport",
  },
  {
    value: "food",
    label: "Food",
  },
  {
    value: "entertainment",
    label: "Entertainment",
  },
  {
    value: "health",
    label: "Health",
  },
  {
    value: "miscellaneous",
    label: "Miscellaneous",
  },
];

export function CategoryBox({
  value,
  setValue,
  error,
  setError,
}: {
  value: string;
  setValue: (value: string) => void;
  error: boolean;
  setError: (error: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between",
            error ? "border border-destructive" : ""
          )}
        >
          {value
            ? categories.find((category) => category.value === value)?.label
            : "Select category..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setError(false);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function GoalBox({
  selectedOption,
  setSelectedOption,
  error,
  setError,
}: {
  selectedOption:
    | {
        value: string;
        label: string;
      }
    | undefined;
  setSelectedOption: (
    option:
      | {
          value: string;
          label: string;
        }
      | undefined
  ) => void;
  error: boolean;
  setError: (error: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const { goals } = useSavingsGoal();

  const goalsMap = goals.map((goal) => {
    return { value: goal.id, label: goal.name };
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between",
            error ? "border border-destructive" : ""
          )}
        >
          {selectedOption?.label
            ? goalsMap.find((goal) => goal.value === selectedOption.value)
                ?.label
            : "Select goal..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search goals..." />
          <CommandList>
            <CommandEmpty>No goals found.</CommandEmpty>
            <CommandGroup>
              {goalsMap.map((goal) => (
                <CommandItem
                  key={goal.value}
                  value={goal.value}
                  onSelect={(currentValue) => {
                    setSelectedOption(
                      selectedOption?.value === currentValue
                        ? undefined
                        : goalsMap.find((g) => g.value === currentValue)
                    );
                    setError(false);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      selectedOption?.value === goal.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {goal.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
