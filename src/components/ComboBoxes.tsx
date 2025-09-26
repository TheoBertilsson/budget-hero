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
import { useTranslation } from "react-i18next";

export function CategoryBox({
  value,
  setValue,
  error,
  setError,
}: {
  value: string;
  setValue: (value: string) => void;
  error?: boolean;
  setError?: (error: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const categories = [
    {
      value: "housing",
      label: t("housing"),
    },
    {
      value: "transport",
      label: t("transport"),
    },
    {
      value: "food",
      label: t("food"),
    },
    {
      value: "entertainment",
      label: t("entertainment"),
    },
    {
      value: "health",
      label: t("health"),
    },
    {
      value: "miscellaneous",
      label: t("miscellaneous"),
    },
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[11.58375rem] justify-between",
            error ? "border border-destructive" : ""
          )}
        >
          {value
            ? categories.find((category) => category.value === value)?.label
            : t("selectCategory")}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t("searchCategory")} />
          <CommandList>
            <CommandEmpty>{t("noCategoryFound")}</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    if (setError) setError(false);
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
        id: string;
      }
    | undefined;
  setSelectedOption: (
    option:
      | {
          value: string;
          label: string;
          id: string;
        }
      | undefined
  ) => void;
  error: boolean;
  setError: (error: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const { goals } = useSavingsGoal();
  const { t } = useTranslation();

  const goalsMap = goals.map((goal) => {
    return { value: goal.id, label: goal.name, id: goal.id };
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
            : t("selectGoal")}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t("searchGoal")} />
          <CommandList>
            <CommandEmpty>{t("noGoalsFound")}</CommandEmpty>
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
