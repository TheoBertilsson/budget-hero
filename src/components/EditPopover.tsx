import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVerticalIcon, TrashIcon } from "lucide-react";
import { CategoryBox } from "./ComboBoxes";
import { useState } from "react";
import { useFinance } from "@/lib/stores/FinanceContext";
import { Expense, Income, Save } from "@/lib/types";

type EditPopoverType = {
  type: "expense" | "save" | "income";
  price: number;
  name: string;
  index: number;
  category?: string;
  goalId?: string;
};

export function EditPopover({
  type,
  price,
  name,
  index,
  category,
  goalId,
}: EditPopoverType) {
  const {
    removeExpense,
    removeSave,
    removeIncome,
    updateExpenses,
    updateIncomes,
    updateSaves,
  } = useFinance();
  const [categoryState, setCategoryState] = useState<string>(category || "");
  const [nameState, setNameState] = useState(name);
  const [priceState, setPriceState] = useState(price);
  const [open, setOpen] = useState(false);

  const removeItem = (type: "expense" | "save" | "income", index: number) => {
    if (type === "expense") {
      removeExpense(index);
      setCategoryState("");
    } else if (type === "save") {
      removeSave(index);
    } else if (type === "income") {
      removeIncome(index);
    }
    setOpen(false);
  };
  const updateItem = (item: Save | Income | Expense, index: number) => {
    if ("category" in item) {
      updateExpenses(index, item);
      setCategoryState("");
    } else if ("goal" in item) {
      updateSaves(index, item);
    } else {
      updateIncomes(index, item);
    }
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className="size-4 rounded-xs has-[>svg]:px-0 cursor-pointer"
        >
          <EllipsisVerticalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 flex flex-col gap-4 shadow-2xl">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Edit {type}</h4>
            {/* <p className="text-muted-foreground text-sm">
                Edit
            </p> */}
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                defaultValue={name}
                onChange={(value) => setNameState(value.currentTarget.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="price">Price:</Label>
              <Input
                id="price"
                defaultValue={price}
                onChange={(value) =>
                  setPriceState(Number(value.currentTarget.value))
                }
                className="col-span-2 h-8"
              />
            </div>
            {category && (
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="category">Category:</Label>
                <CategoryBox
                  value={categoryState}
                  setValue={setCategoryState}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <Button
            variant={"destructive"}
            className="bg-red-600 has-[>svg]:px-0 size-8"
            onClick={() => removeItem(type, index)}
          >
            <TrashIcon />
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              updateItem(
                category
                  ? ({
                      name: nameState,
                      price: priceState,
                      category,
                    } as Expense)
                  : type === "save" && !category && goalId
                  ? ({ goal: nameState, price: priceState, goalId } as Save)
                  : ({ name: nameState, price: priceState } as Income),
                index
              );
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
