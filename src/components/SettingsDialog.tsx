import { CogIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export function SettingsDialog() {
  const { t } = useTranslation();
  return (
    <div className=" fixed sm:absolute bottom-0 sm:top-5 left-5 size-10 border shadow-2xl flex justify-center items-center rounded-lg hover:bg-gray-200 z-50 bg-white">
      <Dialog>
        <DialogTrigger>
          <CogIcon />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center ">{t("settings")}</DialogTitle>
            <DialogDescription className="text-center ">
              {t("editAccount")}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
