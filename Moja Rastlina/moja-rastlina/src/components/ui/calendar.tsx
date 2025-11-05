import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { sl } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  initialFocus?: boolean;
  locale?: Locale;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, locale, className }) => {
  return (
    <DayPicker
      className={className}
      mode={"single"}
      selected={selected}
      onSelect={onSelect as ((date?: Date) => void) | undefined}
      captionLayout="dropdown"
      fromYear={2020}
      toYear={2035}
      locale={locale ?? sl}
      showOutsideDays
    />
  );
};

export default Calendar;


