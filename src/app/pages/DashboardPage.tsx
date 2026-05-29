import { KpiCards } from "../components/KpiCards";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { Reminders } from "../components/Reminders";
import { ModulesList } from "../components/ModulesList";
import { TeamCollaboration } from "../components/TeamCollaboration";
import { ProjectProgress } from "../components/ProjectProgress";
import { BestModel } from "../components/BestModel";

export function DashboardPage() {
  return (
    <>
      <KpiCards />
      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 min-w-0">
          <AnalyticsChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TeamCollaboration />
            <ProjectProgress />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <Reminders />
          <ModulesList />
          <BestModel />
        </div>
      </div>
    </>
  );
}
