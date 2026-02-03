'use client';

import { useState } from 'react';
import styles from '../SidebarContent.module.css';
import { ORDER_FACULTIES, type FacultyKey } from '../configs/orderConfig';

type OrderSidebarProps = {
  searchHighlightGroup: string | null;
};

export function OrderSidebar({ searchHighlightGroup }: OrderSidebarProps) {
  const FACULTIES = ORDER_FACULTIES;

  const [facultyOpen, setFacultyOpen] = useState(true);
  const [faculty, setFaculty] = useState<FacultyKey>('fit');
  const [openCourseIdsByFaculty, setOpenCourseIdsByFaculty] = useState<Record<FacultyKey, string[]>>(
    () =>
      FACULTIES.reduce<Record<FacultyKey, string[]>>((acc, item) => {
        const first = item.courses[0]?.id;
        acc[item.key] = first ? [first] : [];
        return acc;
      }, {} as Record<FacultyKey, string[]>)
  );

  const activeFaculty = FACULTIES.find(item => item.key === faculty) ?? FACULTIES[0];
  const openCourseIds = openCourseIdsByFaculty[faculty] ?? [];

  const toggleCourse = (id: string) => {
    setOpenCourseIdsByFaculty(prev => {
      const current = prev[faculty] ?? [];
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...prev, [faculty]: next };
    });
  };

  return (
    <>
      {/* FACULTIES */}
      <section className={styles.section}>
        <button
          type="button"
          className={styles.sectionHeader}
          onClick={() => setFacultyOpen(v => !v)}
          aria-label="Toggle faculties"
        >
          <span className={styles.sectionTitle}>Факультет</span>
          <span className={`${styles.coursePlus} ${facultyOpen ? styles.plusRot : ''}`}>
            <PlusIcon />
          </span>
        </button>

        <div className={`${styles.facultyWrap} ${facultyOpen ? styles.expandOpen : ''}`}>
          <div className={styles.list}>
            {FACULTIES.map(item => (
              <button
                key={item.key}
                type="button"
                className={`${styles.itemBtn} ${faculty === item.key ? styles.itemActive : ''}`}
                onClick={() => {
                  setFacultyOpen(faculty === item.key ? !facultyOpen : true);
                  setFaculty(item.key);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className={styles.section}>
        {activeFaculty.courses.map(course => {
          const isOpen = openCourseIds.includes(course.id);
          return (
            <div key={course.id}>
              <button
                type="button"
                className={`${styles.courseHeader} ${isOpen ? styles.courseHeaderOpen : ''}`}
                onClick={() => toggleCourse(course.id)}
              >
                <span>{course.title}</span>
                <span className={`${styles.coursePlus} ${isOpen ? styles.plusRot : ''}`}>
                  <PlusIcon />
                </span>
              </button>

              <div className={`${styles.expandWrap} ${isOpen ? styles.expandOpen : ''}`}>
                <ul className={styles.bullets}>
                  {course.groups.map(group => (
                    <li
                      key={group}
                      className={`${styles.groupItem} ${searchHighlightGroup === group ? styles.groupFlash : ''
                        }`}
                    >
                      {group}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <button className={styles.importBtn} type="button">
          Імпорт
        </button>
      </div>
    </>
  );
}

/* ===== Icons ===== */

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
