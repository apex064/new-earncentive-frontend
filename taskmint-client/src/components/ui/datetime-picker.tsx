import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    const newDateTime = new Date(newDate);
    if (selectedDate) {
      newDateTime.setHours(selectedDate.getHours());
      newDateTime.setMinutes(selectedDate.getMinutes());
    } else {
      const now = new Date();
      newDateTime.setHours(now.getHours());
      newDateTime.setMinutes(now.getMinutes());
    }

    setSelectedDate(newDateTime);
    setDate(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue) return;

    const [hours, minutes] = timeValue.split(":").map(Number);
    const baseDate = selectedDate || new Date();

    const newDateTime = new Date(baseDate);
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);

    setSelectedDate(newDateTime);
    setDate(newDateTime);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <div className="w-24">
        <Input
          type="time"
          value={selectedDate ? format(selectedDate, "HH:mm") : ""}
          onChange={handleTimeChange}
          className="appearance-none"
        />
      </div>
    </div>
  );
}
