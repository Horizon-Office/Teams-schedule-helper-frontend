import { SidebarRenderer } from "@/components/SidebarRenderer";


export default function OrderPage() {
  return (
    <section>
      <SidebarRenderer page="order" />
      <div className="
      flex 
      justify-center 
      items-center 
      h-screen 
      w-full 
      text-black
      ">
        Order Page
      </div>
    </section>
  );
}
