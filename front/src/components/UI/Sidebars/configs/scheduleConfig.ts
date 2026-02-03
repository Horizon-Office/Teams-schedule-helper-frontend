import type { Faculty, FacultyKey } from './homeConfig';

export type { FacultyKey };

export const SCHEDULE_FACULTIES: Faculty[] = [
    {
        key: 'fit',
        label: 'ФІТ',
        courses: [
            { id: 'fit-1', title: '1 курс', groups: ['І-21-24-1'] },
            { id: 'fit-2', title: '2 курс', groups: ['І-21-23-1'] },
            { id: 'fit-3', title: '3 курс', groups: ['І-21-22-1'] },
            { id: 'fit-4', title: '4 курс', groups: ['І-21-21-1'] },
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
