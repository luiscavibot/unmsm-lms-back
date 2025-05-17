import { AttendanceStatus } from '../enums/attendance-status.enum';

export interface AttendanceByWeekResponseDto {
  attendancePercentage: string;
  weeks: WeekAttendanceDto[];
}

export interface WeekAttendanceDto {
  weekId: string;
  weekName: string;
  attendances: AttendanceDetailDto[];
}

export interface AttendanceDetailDto {
  date: string;
  formattedDate: string;
  status: AttendanceStatus;
}
