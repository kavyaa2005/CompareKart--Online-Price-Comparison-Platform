import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { DatasetManagement } from "./pages/DatasetManagement";
import { ProductMatching } from "./pages/ProductMatching";
import { PriceIntelligence } from "./pages/PriceIntelligence";
import { ReviewTrust } from "./pages/ReviewTrust";
import { UserAnalytics } from "./pages/UserAnalytics";
import { Settings } from "./pages/Settings";
import { SystemLogs } from "./pages/SystemLogs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "datasets", Component: DatasetManagement },
      { path: "matching", Component: ProductMatching },
      { path: "pricing", Component: PriceIntelligence },
      { path: "reviews", Component: ReviewTrust },
      { path: "analytics", Component: UserAnalytics },
      { path: "settings", Component: Settings },
      { path: "logs", Component: SystemLogs },
    ],
  },
]);