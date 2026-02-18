import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Header } from "../components/Header";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../hooks/useAuth";
import { useHrExpenses } from "../hooks/travel/useExpenses";
import {
  useAssignedTravels,
  useCreatedTravels,
} from "../hooks/travel/useTravel";

export const DashboardPage = () => {
  const { role, userId } = useAuth();
  const isHr = role === "HR";
  const isEmployee = role === "Employee";
  const hrExpenses = useHrExpenses({ status: "Submitted" }, isHr);
  const employeeTravels = useAssignedTravels(
    userId,
    Boolean(userId) && isEmployee,
  );
  const hrTravels = useCreatedTravels(isHr);
  const pendingCount = hrExpenses.data?.length ?? 0;
  const employeeTravelCount = employeeTravels.data?.length ?? 0;
  const hrTravelCount = hrTravels.data?.length ?? 0;

  return (
    <section className="space-y-6">
      <Header
        title="Overview"
        description="Monitor travel plans, expense activity, and notifications in one place."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              to="/travels"
            >
              View travels
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {isEmployee ? (
          <StatCard
            label="Assigned travels"
            value={String(employeeTravelCount)}
            message="Travels assigned to you."
          />
        ) : null}
        {isHr ? (
          <StatCard
            label="Created travels"
            value={String(hrTravelCount)}
            message="Travels created by you."
          />
        ) : null}
        {isHr ? (
          <StatCard
            label="Expenses awaiting review"
            value={String(pendingCount)}
            message="Submitted expenses pending HR review."
          />
        ) : null}
      </div>

      {isHr ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Pending HR reviews
            </h3>
            <p className="text-sm text-slate-500">
              {pendingCount} expenses waiting for action.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            to="/hr/reviews"
          >
            Review now
          </Link>
        </Card>
      ) : null}
    </section>
  );
};
