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
import styles from './schedule.module.css';

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
          {value || <span className={styles.placeholder}>Клікніть для редагування</span>}
        </div>
      )}
    </div>
  );
};

export default function ScheduleTable() {
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

  // Додавання нової групи
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
              <th rowSpan={2} className={styles.dayColumn}>День / Пара</th>
              {teams.map(team => (
                <th key={team.id} className={styles.groupHeader}>
                  {team.name}
                </th>
              ))}
            </tr>
            <tr>
              {teams.map(team => (
                <th key={`sub-${team.id}`} className={styles.groupSubheader}>
                  {team.description}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              PERIODS.map((period, periodIndex) => (
                <tr key={`${day}-${period}`} className={styles.periodRow}>
                  {periodIndex === 0 && (
                    <td rowSpan={PERIODS.length} className={styles.dayPeriodCell}>
                      <div className={styles.dayPeriodWrapper}>
                        <div className={styles.dayName}>{day}</div>
                        <div className={styles.periodsColumn}>
                          {PERIODS.map(p => {
                            const timeIndex = PERIODS.indexOf(p);
                            const time = periodTimes[timeIndex];
                            return (
                              <div key={p} className={styles.periodItem}>
                                {p} {time && `(${time.start}-${time.end})`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  )}
                  {teams.map(team => {
                    const cellId = `${day}-${period}-${team.name}`;
                    const cellData = scheduleData[cellId] || '';
                    return (
                      <td key={cellId} className={styles.scheduleCell}>
                        <EditableCell
                          value={cellData}
                          onValueChange={(value) => dispatch(updateCell({ cellId, value }))}
                          cellId={cellId}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}