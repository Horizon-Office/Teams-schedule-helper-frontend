import ScheduleTable from '@/components/schedule/ScheduleTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Університетський розклад занять
          </h1>
          <p className="text-gray-600">
            Система управління розкладом для університету
          </p>
        </header>
        <ScheduleTable />
      </div>
    </main>
  );
}