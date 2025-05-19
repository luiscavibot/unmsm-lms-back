import { AttendanceStatus } from '../enums/attendance-status.enum';

export interface AttendanceByWeekResponseDto {
  attendancePercentage: string;
  weeks: WeekAttendanceDto[];
}

export interface WeekAttendanceDto {
  weekId: string;
  weekName: string;
  weekNumber: number;
  attendances: AttendanceDetailDto[];
}

export interface AttendanceDetailDto {
  date: string;
  formattedDate: string;
  status: AttendanceStatus;
}
