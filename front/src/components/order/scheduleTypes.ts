export interface Member {
  id: string;
  department: string;
  email: string;
  teams: Team[];
}

export interface Order {
  id: string;
  name: string;
  student_count: number;
  department: string;
  teams: Team[];
  events: Event[];
}

export interface Team {
  id: string;
  name: string;
  mail: string;
  description: string;
  members: Member[];
  order: Order;
  events: Event[];
}

export interface Event {
  id: string;
  order: Order;
  subject: string;
  content: string;
  startDateTime: Date;
  endDateTime: Date;
  startDateRange: Date;
  endDateRange: Date;
  teams: Team[];
  type: string;
  interval: number;
  daysOfWeek: string[];
}

export interface PeriodTime {
  start: string;
  end: string;
}


export interface ScheduleState {
  data: Record<string, string>;
  teams: Team[];
  events: Event[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  semester: {
    startDate: string; // Змініть Date на string
    endDate: string;   // Змініть Date на string
  };
  periodTimes: PeriodTime[];
}