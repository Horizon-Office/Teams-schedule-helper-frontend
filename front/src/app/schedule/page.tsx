import { SidebarRenderer } from "@/components/SidebarRenderer";


export default function SchedulePage() {
  return (
    <section>
      <SidebarRenderer page="schedule" />
      <div className="
      flex 
      justify-center 
      items-center 
      h-screen 
      w-full 
      text-black
      ">
        Schedule Page
      </div>
    </section>
  );
}
