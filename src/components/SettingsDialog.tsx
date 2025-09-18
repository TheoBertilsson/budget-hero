import { CogIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SettingsDialog() {
  return (
    <div className="absolute top-5 left-5 size-10 border shadow-2xl flex justify-center items-center rounded-lg hover:bg-primary/10">
      <Dialog>
        <DialogTrigger>
          {" "}
          <CogIcon />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center ">Settings</DialogTitle>
            <DialogDescription className="text-center ">
              Edit your account!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
