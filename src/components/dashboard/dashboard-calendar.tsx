import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export default function DashboardCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now()));

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow-sm mx-auto card_gradient"
      captionLayout="dropdown"
    />
  );
}
