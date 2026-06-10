/**
 * Attendance page - Mark present/absent, view history and monthly statistics
 */
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useConfirm } from '../context/ConfirmContext';
import { getMonthName, getDaysInMonth, calculatePercentage } from '../utils/helpers';
import { FiCheckCircle, FiXCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';

export default function Attendance() {
  const { attendance, markAttendance, getAttendancePercentage } = useData();
  const { confirm } = useConfirm();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  
  // Filter attendance for selected month
  const monthAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const presentCount = monthAttendance.filter(a => a.status === 'present').length;
  const absentCount = monthAttendance.filter(a => a.status === 'absent').length;
  const totalDays = monthAttendance.length;
  const percentage = totalDays > 0 ? calculatePercentage(presentCount, totalDays) : 0;

  // Generate calendar days
  const calendarDays = [];
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null, date: null });
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = new Date(dateStr) > currentDate;
    
    const attendanceRecord = attendance.find(a => a.date === dateStr);
    
    calendarDays.push({
      day,
      date: dateStr,
      isWeekend,
      isFuture,
      status: attendanceRecord?.status || null,
      subject: attendanceRecord?.subject || null,
    });
  }

  const handleMarkAttendance = (date, status) => {
    const dayOfWeek = new Date(date).getDay();
    const subject = dayOfWeek <= 2 ? 'Mathematics' : 'Computer Science';
    markAttendance(date, status, subject);
  };

  const months = Array.from({ length: 12 }, (_, i) => getMonthName(i));
  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your class attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <FiXCircle className="text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance %</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Month/Year Selector */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {months.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-500 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-500 dark:text-gray-400">Absent</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => (
              <div key={index} className="aspect-square">
                {cell.day ? (
                  <div
                    className={`h-full rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                      cell.isFuture
                        ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
                        : cell.status === 'present'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : cell.status === 'absent'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : cell.isWeekend
                        ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                    }`}
                    onClick={async () => {
                      if (!cell.isFuture && !cell.isWeekend && !cell.status) {
                        const result = await confirm({
                          title: 'Mark Attendance',
                          message: `Mark ${cell.date} as Present?`,
                          confirmLabel: 'Present',
                          cancelLabel: 'Absent',
                          variant: 'info',
                        });
                        handleMarkAttendance(cell.date, result ? 'present' : 'absent');
                      }
                    }}
                    title={cell.subject ? `${cell.subject} - ${cell.status}` : 'Click to mark'}
                  >
                    <span className="font-medium">{cell.day}</span>
                    {cell.status && (
                      <span className="text-[10px] mt-0.5">
                        {cell.status === 'present' ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Attendance History</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {monthAttendance.length > 0 ? (
            [...monthAttendance].reverse().slice(0, 20).map(record => (
              <div key={record.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="flex items-center gap-3">
                  {record.status === 'present' ? (
                    <FiCheckCircle className="text-green-500" />
                  ) : (
                    <FiXCircle className="text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{record.subject}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  record.status === 'present'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {record.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No attendance records for this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}