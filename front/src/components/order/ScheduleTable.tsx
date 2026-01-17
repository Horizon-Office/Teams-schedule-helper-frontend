'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  updateCell,
  addTeam,
  setSemesterDates,
  clearSchedule,
  saveSchedule,
} from './scheduleSlice';
import styles from './schedule1.module.css';

// Константи
const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
const PERIODS = ['I', 'II', 'III', 'IV', 'V'];

// Компонент редагування комірки
const EditableCell = ({
  value,
  onValueChange,
  cellId
}: {
  value: string;
  onValueChange: (value: string) => void;
  cellId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue !== value) {
      onValueChange(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setInputValue(value || '');
      setIsEditing(false);
    }
  };

  return (
    <div
      className={styles.editableCell}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          className={styles.cellTextarea}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
          placeholder="Введіть предмет та викладача"
        />
      ) : (
        <div className={styles.cellContent}>
          {value || <span className={styles.placeholder}></span>}
        </div>
      )}
    </div>
  );
};

export default function OrderTable() {
  const dispatch = useAppDispatch();
  const {
    data: scheduleData,
    teams,
    loading,
    error,
    lastUpdated,
    semester,
    periodTimes
  } = useAppSelector((state) => state.schedule);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddGroup = () => {
    const groupName = prompt('Введіть назву нової групи (наприклад: 121-24-3):');
    if (groupName && !teams.some(t => t.name === groupName)) {
      const newTeam = {
        id: `team_${Date.now()}`,
        name: groupName,
        mail: `${groupName.replace(/-/g, '_')}@university.edu`,
        description: `Група ${groupName}`,
        members: [],
        order: {
          id: `order_${Date.now()}`,
          name: `Навчальний план ${groupName}`,
          student_count: 30,
          department: 'Кафедра',
          teams: [],
          events: []
        },
        events: []
      };

      dispatch(addTeam(newTeam));

      // Створюємо порожні комірки для нової групи
      const newData = { ...scheduleData };
      DAYS.forEach(day => {
        PERIODS.forEach(period => {
          const cellId = `${day}-${period}-${groupName}`;
          if (!newData[cellId]) {
            newData[cellId] = '';
          }
        });
      });

      // Диспатчимо кожну комірку окремо
      Object.entries(newData).forEach(([cellId, value]) => {
        if (!scheduleData[cellId] && value === '') {
          dispatch(updateCell({ cellId, value }));
        }
      });
    }
  };

  // Збереження в БД
  const handleSave = async () => {
    if (confirm('Зберегти розклад в базу даних?')) {
      try {
        await dispatch(saveSchedule()).unwrap();
        alert('Розклад успішно збережено!');
      } catch (error) {
        alert(`Помилка збереження: ${error}`);
      }
    }
  };

  // Скидання даних
  const handleReset = () => {
    if (confirm('Ви впевнені, що хочете скинути всі дані?')) {
      dispatch(clearSchedule());
      alert('Дані успішно скинуті!');
    }
  };

  // Експорт даних
  const handleExport = () => {
    const exportData = {
      schedule: scheduleData,
      teams,
      semester,
      periodTimes,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalCells: Object.keys(scheduleData).length,
        totalTeams: teams.length
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className={styles.scheduleContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Завантаження розкладу...</p>
        </div>
      </div>
    );
  }

  // Create rows array from schedule data
  const rows = teams.length > 0 
    ? Array.from({ length: 20 }).map((_, index) => ({
        discipline: scheduleData[`row-${index}-discipline`] || '',
        groupFlow: scheduleData[`row-${index}-groupFlow`] || '',
        studentCount: scheduleData[`row-${index}-studentCount`] || '',
        lectureHours: scheduleData[`row-${index}-lectureHours`] || '',
        lectureTeacher: scheduleData[`row-${index}-lectureTeacher`] || '',
        labGroup: scheduleData[`row-${index}-labGroup`] || '',
        labTeacher: scheduleData[`row-${index}-labTeacher`] || '',
        room: scheduleData[`row-${index}-room`] || '',
        notes: scheduleData[`row-${index}-notes`] || '',
      }))
    : [];

  return (
    <div className={styles.scheduleContainer}>
      <h2>Розклад занять</h2>

      {/* Статус та налаштування */}
      <div className={styles.controlsBar}>
        <div className={styles.statusSection}>
          {loading && (
            <div className={styles.statusMessage}>
              <div className={styles.spinnerSmall}></div>
              <span>Збереження...</span>
            </div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              <span>Помилка: {error}</span>
            </div>
          )}
          {lastUpdated && (
            <div className={styles.lastUpdated}>
              Оновлено: {new Date(lastUpdated).toLocaleString('uk-UA')}
            </div>
          )}
        </div>

        {/* Налаштування семестру */}
        <div className={styles.semesterControls}>
          <div className={styles.dateInput}>
            <label>Початок:</label>
            <input
              type="date"
              value={semester.startDate}
              onChange={(e) => dispatch(setSemesterDates({
                startDate: e.target.value,
                endDate: semester.endDate
              }))}
            />
          </div>
          <div className={styles.dateInput}>
            <label>Кінець:</label>
            <input
              type="date"
              value={semester.endDate}
              onChange={(e) => dispatch(setSemesterDates({
                startDate: semester.startDate,
                endDate: e.target.value
              }))}
            />
          </div>
        </div>
      </div>

      {/* Кнопки управління */}
      <div className={styles.controls}>
        <button
          onClick={handleAddGroup}
          className={`${styles.btn} ${styles.btnAdd}`}
          disabled={loading}
        >
          + Додати групу
        </button>
        <button
          onClick={handleSave}
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loading}
        >
          {loading ? 'Збереження...' : 'Зберегти в БД'}
        </button>
        <button
          onClick={handleExport}
          className={`${styles.btn} ${styles.btnExport}`}
          disabled={loading}
        >
          Експортувати JSON
        </button>
        <button
          onClick={handleReset}
          className={`${styles.btn} ${styles.btnReset}`}
          disabled={loading}
        >
          Скинути дані
        </button>
      </div>

      {/* Таблиця */}
      <div className={styles.tableWrapper}>
  <table className={styles.scheduleTable}>
    <thead>
      <tr>
        <th rowSpan={2} className={styles.disciplineHeader}>Дисципліни</th>
        <th rowSpan={2} className={styles.groupFlowHeader}>Групи потока</th>
        <th rowSpan={2} className={styles.countHeader}>Кількість студентів</th>

        <th colSpan={2} className={styles.lecturesHeader}>Лекції</th>

        <th colSpan={2} className={styles.labsHeader}>Лабораторні, практичні</th>

        <th rowSpan={2} className={styles.notesHeader}>Примітки</th>
      </tr>
      <tr>
        <th className={styles.lectureHoursHeader}>Кількість годин</th>
        <th className={styles.lectureTeacherHeader}>Прізвище викладача</th>

        <th className={styles.labGroupHeader}>Група</th>
        <th className={styles.labTeacherHeader}>Прізвище викладача</th>
      </tr>
    </thead>

    <tbody>
        {rows.map((row, rowIndex) => {
          const rowId = `r-${rowIndex}`;
          return (
            <tr key={rowId} className={styles.dataRow}>
              {/* Дисципліна */}
              <td className={styles.disciplineCell}>
                <EditableCell
                  value={row.discipline || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-discipline`, value }))}
                  cellId={`${rowId}-discipline`}
                />
              </td>

              {/* Групи потока */}
              <td className={styles.groupFlowCell}>
                <EditableCell
                  value={row.groupFlow || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-groupFlow`, value }))}
                  cellId={`${rowId}-groupFlow`}
                />
              </td>

              {/* Кількість студентів */}
              <td className={styles.countCell}>
                <EditableCell
                  value={row.studentCount != null ? String(row.studentCount) : ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-studentCount`, value }))}
                  cellId={`${rowId}-studentCount`}
                />
              </td>

              {/* Лекції: кількість годин */}
              <td className={styles.lectureHoursCell}>
                <EditableCell
                  value={row.lectureHours != null ? String(row.lectureHours) : ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-lectureHours`, value }))}
                  cellId={`${rowId}-lectureHours`}
                />
              </td>

              {/* Лекції: прізвище викладача */}
              <td className={styles.lectureTeacherCell}>
                <EditableCell
                  value={row.lectureTeacher || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-lectureTeacher`, value }))}
                  cellId={`${rowId}-lectureTeacher`}
                />
              </td>

              {/* Лабораторні: група */}
              <td className={styles.labGroupCell}>
                <EditableCell
                  value={row.labGroup || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-labGroup`, value }))}
                  cellId={`${rowId}-labGroup`}
                />
              </td>

              {/* Лабораторні: прізвище викладача */}
              <td className={styles.labTeacherCell}>
                <EditableCell
                  value={row.labTeacher || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-labTeacher`, value }))}
                  cellId={`${rowId}-labTeacher`}
                />
              </td>

         

              {/* Примітки */}
              <td className={styles.notesCell}>
                <EditableCell
                  value={row.notes || ''}
                  onValueChange={(value) => dispatch(updateCell({ cellId: `${rowId}-notes`, value }))}
                  cellId={`${rowId}-notes`}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

    </div>
  );
}