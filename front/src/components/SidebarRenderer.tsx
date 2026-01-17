import { OrderSidebar } from "./UI/Sidebars/Order/SidebarOrder";
import { HomeSidebar } from "./UI/Sidebars/Home/SidebarHome";
import { ScheduleSidebar } from "./UI/Sidebars/Scheduel/SidebarSchedule";

type SidebarPage = "orders" | "home" | "schedule";

type SidebarRendererProps = {
  page: SidebarPage;
};

export function SidebarRenderer({ page }: SidebarRendererProps) {
  switch (page) {
    case "orders":
      return <OrderSidebar />;

    case "home":
      return <HomeSidebar />;

    case "schedule":
      return <ScheduleSidebar />;

    default:
      return null;
  }
}
