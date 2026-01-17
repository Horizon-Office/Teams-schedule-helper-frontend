import Link from 'next/link'
import sidebar from './styles/sidebar.module.css'

export function OrderSidebar() {
    return (
        <div className={sidebar.container}>
        <nav className={sidebar.menu}>
            <Link href="/">Home</Link>
            <Link href="/orders">Order</Link>
            <Link href="/schedule">Schedule</Link>
        </nav>
        </div>
    );
}
