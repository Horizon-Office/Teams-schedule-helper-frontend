import Link from 'next/link'
import sidebar from './styles/sidebar.module.css'

export default function Sidebar() {
  return (
    <section>
        <div className={sidebar.container}>
        <nav className={sidebar.menu}>
            <Link href="/">Home</Link>
            <Link href="/order">Order</Link>
            <Link href="/schedule">Schedule</Link>
        </nav>    
        </div>
    </section>
  );
}
