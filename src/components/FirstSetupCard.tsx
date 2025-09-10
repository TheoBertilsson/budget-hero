import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

export default function FirstSetupCard() {
  return (
    <>
      {" "}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            First a little information
          </CardTitle>
          <CardDescription>
            Set up your monthly income and your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex gap-2 justify-between">
                  <Label htmlFor="income">Income</Label>
                  <div className="flex gap-2 items-center">
                    <Label htmlFor="vairedIncome" className="underline text-sm">
                      Income varies monthly
                    </Label>
                    <Checkbox
                      id="vairedIncome"
                      className="border border-primary"
                    />
                  </div>
                </div>

                <Input
                  id="income"
                  type="number"
                  name="income"
                  placeholder="25000 / month"
                  min={0}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savings">Savings</Label>
                <Input
                  id="savings"
                  type="number"
                  min={0}
                  name="savings"
                  placeholder="5000 / month"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="loginForm" className="w-full">
            Start the planning
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
