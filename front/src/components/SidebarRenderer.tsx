'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './SidebarRenderer.module.css';
import { HomeSidebar } from './UI/Sidebars/Home/SidebarHome';
import { OrderSidebar } from './UI/Sidebars/Order/SidebarOrder';
import { ScheduleSidebar } from './UI/Sidebars/Scheduel/SidebarSchedule';
import { HOME_FACULTIES } from './UI/Sidebars/configs/homeConfig';
import { SCHEDULE_FACULTIES } from './UI/Sidebars/configs/scheduleConfig';
import { ORDER_FACULTIES } from './UI/Sidebars/configs/orderConfig';
import type { Faculty, FacultyKey } from './UI/Sidebars/configs/homeConfig';

type SidebarPage = "order" | "home" | "schedule";
type TabKey = 'home' | 'schedule' | 'orders';

type SidebarRendererProps = {
  page: SidebarPage;
};

type GroupMatch = {
  facultyKey: FacultyKey;
  courseId: string;
  group: string;
};

export function SidebarRenderer({ page }: SidebarRendererProps) {
  const pathname = usePathname();

  // Получаем конфигурацию в зависимости от страницы
  const FACULTIES = page === 'home'
    ? HOME_FACULTIES
    : page === 'schedule'
      ? SCHEDULE_FACULTIES
      : ORDER_FACULTIES;

  const [collapsed, setCollapsed] = useState(() => {
    // Читаем сразу при инициализации, чтобы не было мигания
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchHighlightGroup, setSearchHighlightGroup] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const HOME_ICON_SRC = '/icons/icons8-office-50.png';
  const activeTab: TabKey = pathname === '/' ? 'home' : pathname?.startsWith('/order') ? 'orders' : 'schedule';
  const isHome = pathname === '/';

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Создаем список всех групп для поиска
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
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
    setSearchHighlightGroup(match.group);
    setSearchOpen(false);
    highlightTimerRef.current = window.setTimeout(() => {
      setSearchHighlightGroup(null);
    }, 700);
  };

  const toggleSidebar = () => {
    setCollapsed(v => !v);
    if (!collapsed) {
      setSearchOpen(false);
      setDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(v => !v);
  };

  return (
    <>
      {/* Backdrop - когда dropdown или search открыт */}
      <div
        className={`${styles.backdrop} ${(dropdownOpen || (collapsed && searchOpen)) ? styles.backdropShow : ''}`}
        onClick={() => {
          setDropdownOpen(false);
          setSearchOpen(false);
        }}
        aria-hidden
      />

      {/* FLOATING WIDGET - показывается когда свернуто */}
      {collapsed && (
        <div className={styles.floatingWidget}>
          <button
            className={styles.widgetToggle}
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            type="button"
          >
            <MenuIcon />
          </button>

          <Link href="/" className={`${styles.widgetIcon} ${isHome ? styles.widgetIconActive : ''}`}>
            <Image src={HOME_ICON_SRC} alt="Home" width={20} height={20} priority />
          </Link>

          <Link
            href="/schedule"
            className={`${styles.widgetIcon} ${activeTab === 'schedule' ? styles.widgetIconActive : ''}`}
          >
            <CalendarIcon />
          </Link>

          <Link
            href="/order"
            className={`${styles.widgetIcon} ${activeTab === 'orders' ? styles.widgetIconActive : ''}`}
          >
            <ListIcon />
          </Link>

          <button
            className={styles.widgetIcon}
            onClick={() => setSearchOpen(v => !v)}
            type="button"
          >
            <SearchIcon />
          </button>
        </div>
      )}

      {/* DROPDOWN PANEL - раскрывающаяся панель вниз */}
      {collapsed && dropdownOpen && (
        <div className={styles.dropdownPanel}>
          {/* Тот же контент что и в sidebar */}
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Меню</span>
            <div className={styles.dropdownActions}>
              <button
                className={styles.dropdownExpand}
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                type="button"
                title="Развернуть панель"
              >
                <MenuIcon />
              </button>
              <button
                className={styles.dropdownClose}
                onClick={() => setDropdownOpen(false)}
                aria-label="Close"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* TABS в dropdown */}
          <div className={styles.dropdownTabs}>
            <Link
              href="/schedule"
              className={`${styles.tab} ${activeTab === 'schedule' ? styles.tabActive : ''}`}
              onClick={() => setDropdownOpen(false)}
            >
              Розклад
            </Link>

            <Link
              href="/order"
              className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
              onClick={() => setDropdownOpen(false)}
            >
              Наряд
            </Link>
          </div>

          {/* CONTENT */}
          <div className={styles.dropdownContent}>
            {page === 'home' && <HomeSidebar searchHighlightGroup={searchHighlightGroup} />}
            {page === 'schedule' && <ScheduleSidebar searchHighlightGroup={searchHighlightGroup} />}
            {page === 'order' && <OrderSidebar searchHighlightGroup={searchHighlightGroup} />}
          </div>
        </div>
      )}

      {/* FLOATING SEARCH PANEL - для свернутого состояния */}
      {collapsed && searchOpen && (
        <div className={styles.floatingSearchPanel}>
          <div className={styles.searchInputWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Пошук групи..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              autoFocus
            />
          </div>

          {/* Search Results Dropdown - показывается под полем ввода */}
          {searchValue.trim() && (
            <div className={styles.floatingSearchResults}>
              <div className={styles.floatingSearchHint}>
                {suggestions.length === 0
                  ? 'Нічого не знайдено'
                  : `Знайдено ${suggestions.length} груп${suggestions.length === 1 ? 'у' : ''}`}
              </div>

              {suggestions.length > 0 && (
                <div className={styles.floatingSearchList}>
                  {suggestions.map((match, idx) => (
                    <button
                      key={idx}
                      className={styles.floatingSuggestionBtn}
                      type="button"
                      onClick={() => {
                        handleGroupPick(match);
                        setSearchValue('');
                        setSearchOpen(false);
                      }}
                    >
                      <div className={styles.suggestionGroup}>{match.group}</div>
                      <div className={styles.suggestionMeta}>
                        {match.facultyKey} • Курс {match.courseId}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL SIDEBAR - развернутый режим */}
      <aside
        className={`${styles.drawer} ${collapsed ? styles.drawerCollapsed : styles.drawerExpanded}`}
      >
        {/* TOP BAR */}
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
            aria-label="Close sidebar"
            type="button"
            onClick={toggleSidebar}
          >
            <CloseIcon />
          </button>
        </div>

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
          >
            <SearchIcon />
          </button>
        </div>

        {/* CONTENT - рендерим разный контент в зависимости от страницы */}
        {!collapsed && (
          <>
            {page === 'home' && <HomeSidebar searchHighlightGroup={searchHighlightGroup} />}
            {page === 'schedule' && <ScheduleSidebar searchHighlightGroup={searchHighlightGroup} />}
            {page === 'order' && <OrderSidebar searchHighlightGroup={searchHighlightGroup} />}
          </>
        )}
      </aside>

      {/* EXPANDED SEARCH PANEL - виїжджає справа від відкритого сайдбару */}
      {!collapsed && searchOpen && (
        <div className={styles.expandedSearchPanel}>
          <div className={styles.searchInputWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Пошук групи..."
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchValue.trim() ? (
            <>
              <div className={styles.searchHint}>
                {suggestions.length === 0
                  ? 'Нічого не знайдено'
                  : `Знайдено ${suggestions.length} груп${suggestions.length === 1 ? 'у' : ''}`}
              </div>
              {suggestions.length > 0 && (
                <div className={styles.searchSuggestions}>
                  {suggestions.map(match => (
                    <button
                      key={`${match.courseId}-${match.group}`}
                      className={styles.suggestionBtn}
                      type="button"
                      onClick={() => {
                        handleGroupPick(match);
                        setSearchValue('');
                        setSearchOpen(false);
                      }}
                    >
                      <div className={styles.suggestionGroup}>{match.group}</div>
                      <div className={styles.suggestionMeta}>
                        {match.facultyKey} • Курс {match.courseId}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.searchHint}>Найближчі групи</div>
              <div className={styles.searchSuggestions}>
                {groupMatches.slice(0, 5).map(match => (
                  <button
                    key={`${match.courseId}-${match.group}`}
                    className={styles.suggestionBtn}
                    type="button"
                    onClick={() => {
                      handleGroupPick(match);
                      setSearchOpen(false);
                    }}
                  >
                    <div className={styles.suggestionGroup}>{match.group}</div>
                    <div className={styles.suggestionMeta}>
                      {match.facultyKey} • Курс {match.courseId}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
