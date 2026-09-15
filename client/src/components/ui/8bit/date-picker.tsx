import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import "./styles/retro.css";

export interface BitDatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}: BitDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          borderStyle="retro-beveled"
          className={cn(
            "w-[280px] sm:w-[310px] justify-start text-left font-normal retro text-xs h-10 px-4 bg-background",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 text-foreground" />
          <span className="truncate">
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-none border-y-6 border-foreground dark:border-ring bg-background text-foreground shadow-2xl"
        align="start"
      >
        <div className="relative p-2">
          {/* 8bitcn Stepped Cut-Corner Overlay */}
          <div
            className="absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
            aria-hidden="true"
          />
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="retro text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
