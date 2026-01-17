import OrderTable from "@/components/order/ScheduleTable";
import { SidebarRenderer } from "@/components/SidebarRenderer";


export default function OrderPage() {
  return (
    <section>
      {/* <SidebarRenderer page="order" /> */}
      <OrderTable />
    </section>
  );
}
