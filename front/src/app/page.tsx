import { SidebarRenderer } from "@/components/SidebarRenderer";


export default function HomePage() {
  return (
    <section>
      <SidebarRenderer page="home" />
      <div className="
      flex 
      justify-center 
      items-center 
      h-screen 
      w-full 
      text-black
      ">
        Home Page
      </div>
    </section>
  );
}
