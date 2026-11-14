export interface ClosepathCalendarEvent {
  title?: string;
  description?: string;
  location?: string;
  date: string;
}

export interface ClosepathCalendarPlugin {
  addEvent(options: ClosepathCalendarEvent): Promise<{ opened: boolean }>;
}

export const ClosepathCalendar: ClosepathCalendarPlugin;
