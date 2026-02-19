import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Header } from "../components/Header";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { AsyncSearchableSelect } from "../components/ui/AsyncSearchableSelect";
import { useAuth } from "../hooks/useAuth";
import { useOrgChart } from "../hooks/useOrgChart";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import type { OrgChartNode, OrgChartUser } from "../types/org-chart";

type TreeNodeProps = {
  node: OrgChartNode;
  selectedUserId?: number;
  onSelect: (userId: number) => void;
};

const OrgTreeNode = ({
  node,
  selectedUserId,
  onSelect,
}: TreeNodeProps) => {
  const isSelected = node.id === selectedUserId;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        className={`w-60 rounded-lg border p-3 text-left transition ${
          isSelected
            ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
            : "border-slate-300 bg-white hover:border-brand-300"
        }`}
        onClick={() => onSelect(node.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{node.fullName}</p>
            <p className="truncate text-xs text-slate-600">{node.designation || "No designation"}</p>
            <p className="truncate text-xs text-slate-500">{node.department || "No department"}</p>
          </div>
          {isSelected ? (
            <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Selected
            </span>
          ) : null}
        </div>
        <p className="mt-2 truncate text-[11px] text-slate-500">{node.email}</p>
      </button>

      {node.directReports.length ? (
        <div className="mt-2 flex w-full flex-col items-center">
          <div className="h-5 w-px bg-slate-300" />
          <div className="relative flex flex-nowrap justify-center gap-x-6 gap-y-5 pt-3">
            {node.directReports.length > 1 ? (
              <div className="pointer-events-none absolute left-16 right-16 top-0 h-px bg-slate-300" />
            ) : null}
            {node.directReports.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-3 w-px bg-slate-300" />
                <OrgTreeNode
                  node={child}
                  selectedUserId={selectedUserId}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const OrgChartPage = () => {
  const { userId } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    userId,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const orgChartQuery = useOrgChart(selectedUserId, Boolean(selectedUserId));
  const searchQueryEnabled = searchQuery.trim().length >= 2;
  const searchQueryResult = useEmployeeSearch(searchQuery.trim(), searchQueryEnabled);

  const searchResults = searchQueryResult.data ?? [];
  const searchOptions = searchResults.map((user: OrgChartUser) => ({
    value: user.id,
    label: `${user.fullName} (${user.email})`,
  }));

  const handleSelectUser = (userIdValue: number) => {
    setSelectedUserId(userIdValue);
    setSearchQuery("");
  };

  return (
    <section className="space-y-6">
      <Header
        title="Organization chart"
        description="Card-based org chart from root to all reporting levels."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-200"
              to="/"
            >
              Back to dashboard
            </Link>
            <Button
              type="button"
              className="bg-brand-600 text-white"
              onClick={() => setSelectedUserId(userId)}
            >
              My org chart
            </Button>
          </div>
        }
      />

      <Card className="space-y-3 p-4">
        <AsyncSearchableSelect
          label="Search and select employee"
          placeholder="Type name or email"
          options={searchOptions}
          value={undefined}
          isLoading={searchQueryEnabled ? searchQueryResult.isLoading : false}
          onSearch={setSearchQuery}
          onChange={(value) => {
            if (value !== undefined) {
              handleSelectUser(value);
            }
          }}
        />
      </Card>

      {orgChartQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading org chart...
        </div>
      ) : null}

      {orgChartQuery.isError ? (
        <Card>
          <p className="text-sm text-red-600">
            Unable to load organization chart.
          </p>
        </Card>
      ) : null}

      {orgChartQuery.data ? (
        <Card className="space-y-4 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Organization tree
            </h3>
            <p className="text-xs text-slate-500">
              Click any card to focus and highlight that employee.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="min-w-[360px]">
              <OrgTreeNode
                node={orgChartQuery.data}
                selectedUserId={selectedUserId}
                onSelect={handleSelectUser}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {!orgChartQuery.isLoading &&
      !orgChartQuery.isError &&
      !orgChartQuery.data ? (
        <EmptyState
          title="No org chart"
          description="We couldn't find any reporting structure for this user."
        />
      ) : null}
    </section>
  );
};
