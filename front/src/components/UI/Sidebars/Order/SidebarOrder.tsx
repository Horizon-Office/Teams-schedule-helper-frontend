'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './styles/sidebar.module.css';

type TabKey = 'home' | 'schedule' | 'orders';

type FacultyKey = 'fit' | 'ftb';

type Course = {
  id: string;
  title: string;
  groups: string[];
};

type Faculty = {
  key: FacultyKey;
  label: string;
  courses: Course[];
};

type GroupMatch = {
  facultyKey: FacultyKey;
  courseId: string;
  group: string;
};

const FACULTIES: Faculty[] = [
  {
    key: 'fit',
    label: 'Ф?Т',
    courses: [
      { id: 'fit-1', title: '1 курс', groups: ['?-21-24-1'] },
      { id: 'fit-2', title: '2 курс', groups: ['?-21-23-1'] },
      { id: 'fit-3', title: '3 курс', groups: ['?-21-22-1'] },
      { id: 'fit-4', title: '4 курс', groups: ['?-21-21-1'] },
    ],
  },
  {
    key: 'ftb',
    label: 'ФТБ',
    courses: [
      { id: 'ftb-1', title: '1 курс', groups: ['Б-21-24-1'] },
      { id: 'ftb-2', title: '2 курс', groups: ['Б-21-23-1'] },
      { id: 'ftb-3', title: '3 курс', groups: ['Б-21-22-1'] },
    ],
  },
];

export function OrderSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(true);
  const [facultyOpen, setFacultyOpen] = useState(true);
  const [faculty, setFaculty] = useState<FacultyKey>('fit');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchHighlightGroup, setSearchHighlightGroup] = useState<string | null>(null);
  const [searchSpotlight, setSearchSpotlight] = useState(false);
  const highlightTimerRef = useRef<number | null>(null);
  const [openCourseIdsByFaculty, setOpenCourseIdsByFaculty] = useState<Record<FacultyKey, string[]>>(
    () =>
      FACULTIES.reduce<Record<FacultyKey, string[]>>((acc, item) => {
        const first = item.courses[0]?.id;
        acc[item.key] = first ? [first] : [];
        return acc;
      }, {} as Record<FacultyKey, string[]>)
  );

  const HOME_ICON_SRC = '/icons/icons8-office-50.png';

  const activeTab: TabKey = pathname === '/' ? 'home' : pathname?.startsWith('/order') ? 'orders' : 'schedule';
  const isHome = pathname === '/';
  const activeFaculty = FACULTIES.find(item => item.key === faculty) ?? FACULTIES[0];
  const openCourseIds = openCourseIdsByFaculty[faculty] ?? [];
  const groupMatches: GroupMatch[] = FACULTIES.flatMap(item =>
    item.courses.flatMap(course =>
      course.groups.map(group => ({
        facultyKey: item.key,
        courseId: course.id,
        group,
      }))
    )
  );
  const normalizedQuery = searchValue.trim().toLowerCase();
  const suggestions = groupMatches
    .filter(match => match.group.toLowerCase().includes(normalizedQuery))
    .slice(0, 6);

  const handleGroupPick = (match: GroupMatch) => {
    setFaculty(match.facultyKey);
    setFacultyOpen(true);
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
    setSearchHighlightGroup(match.group);
    setSearchSpotlight(true);
    setOpenCourseIdsByFaculty(prev => {
      const current = prev[match.facultyKey] ?? [];
      const next = current.includes(match.courseId) ? current : [...current, match.courseId];
      return { ...prev, [match.facultyKey]: next };
    });
    setSearchOpen(false);
    highlightTimerRef.current = window.setTimeout(() => {
      setSearchHighlightGroup(null);
      setSearchSpotlight(false);
    }, 700);
  };

  const toggleCourse = (id: string) => {
    setOpenCourseIdsByFaculty(prev => {
      const current = prev[faculty] ?? [];
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...prev, [faculty]: next };
    });
  };

  const closeSidebar = () => {
    setOpen(false);
    setSearchOpen(false);
  };

  const toggleSidebar = () => {
    setOpen(v => {
      if (v) {
        setSearchOpen(false);
      }
      return !v;
    });
  };

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropShow : ''}`} aria-hidden />

      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : styles.drawerClosed} ${
          searchSpotlight ? styles.drawerSpotlight : ''
        }`}
      >
        {/* TOP NAV */}
        <div className={styles.topBar}>
          <Link
            href="/"
            className={`${styles.iconBtn} ${styles.homeBtn} ${isHome ? styles.iconBtnActive : ''}`}
            aria-label="Home"
          >
            <Image src={HOME_ICON_SRC} alt="Home" width={22} height={22} priority />
          </Link>

          <button
            className={styles.iconBtn}
            aria-label="Close"
            type="button"
            onClick={closeSidebar}
          >
            <CloseIcon />
          </button>
        </div>

        <button
          type="button"
          className={`${styles.edgeToggle} ${open ? styles.edgeToggleOpen : styles.edgeToggleClosed}`}
          onClick={toggleSidebar}
          aria-label={open ? 'Close sidebar' : 'Open sidebar'}
        >
          <span className={`${styles.edgeArrow} ${open ? styles.edgeArrowOpen : ''}`}>
            <ChevronIcon />
          </span>
        </button>

        {/* TABS */}
        <div className={styles.tabs}>
          <Link
            href="/schedule"
            className={`${styles.tab} ${activeTab === 'schedule' ? styles.tabActive : ''}`}
          >
            Розклад
          </Link>

          <Link
            href="/order"
            className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          >
            Наряд
          </Link>

          <button
            className={styles.searchBtn}
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(v => !v)}
            disabled={!open}
          >
            <SearchIcon />
          </button>
        </div>

        <div className={`${styles.searchPanel} ${searchOpen ? styles.searchPanelOpen : ''}`}>
          <div className={styles.searchInputWrap}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Пошук групи"
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
            />
          </div>
          <div className={styles.searchHint}>Найближч? групи</div>
          <div className={styles.searchSuggestions}>
            {(normalizedQuery ? suggestions : groupMatches.slice(0, 5)).map(match => (
              <button
                key={`${match.courseId}-${match.group}`}
                className={styles.suggestionBtn}
                type="button"
                onClick={() => handleGroupPick(match)}
              >
                {match.group}
              </button>
            ))}
          </div>
        </div>

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
                        className={`${styles.groupItem} ${
                          searchHighlightGroup === group ? styles.groupFlash : ''
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
            ?мпорт
          </button>
        </div>
      </aside>
    </>
  );
}

/* ===== Icons ===== */

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
