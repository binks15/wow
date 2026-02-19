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
  currentDepth: number;
  maxDepth?: number;
};

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const findNodeDepth = (
  node: OrgChartNode,
  targetId?: number,
  depth = 0,
): number | undefined => {
  if (!targetId) return undefined;
  if (node.id === targetId) return depth;

  for (const child of node.directReports) {
    const childDepth = findNodeDepth(child, targetId, depth + 1);
    if (childDepth !== undefined) {
      return childDepth;
    }
  }

  return undefined;
};

const OrgTreeNode = ({
  node,
  selectedUserId,
  onSelect,
  currentDepth,
  maxDepth,
}: TreeNodeProps) => {
  const isSelected = node.id === selectedUserId;
  const canRenderChildren =
    maxDepth === undefined || currentDepth < maxDepth;
  const directReports = canRenderChildren ? node.directReports : [];

  return (
    <div className="flex flex-col items-center">
      <div className="group relative">
        <button
          type="button"
          className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold transition ${
            isSelected
              ? "border-brand-500 ring-2 ring-brand-200"
              : "border-slate-300 hover:border-brand-300"
          }`}
          onClick={() => onSelect(node.id)}
        >
          {node.profilePhotoUrl ? (
            <img
              src={node.profilePhotoUrl}
              alt={node.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center ${
                isSelected ? "bg-brand-600 text-white" : "bg-white text-slate-700"
              }`}
            >
              {getInitials(node.fullName)}
            </span>
          )}
        </button>

        {isSelected ? (
          <span className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-600 ring-2 ring-white" />
        ) : null}

        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-2 text-left shadow-sm group-hover:block">
          <p className="text-sm font-semibold text-slate-900">{node.fullName}</p>
          <p className="text-xs text-slate-600">{node.designation || "No designation"}</p>
          <p className="text-xs text-slate-500">{node.department || "No department"}</p>
        </div>
      </div>

      {directReports.length ? (
        <div className="mt-2 flex w-full flex-col items-center">
          <div className="h-5 w-px bg-slate-300" />
          <div className="relative flex flex-nowrap justify-center gap-x-6 gap-y-5 pt-3">
            {directReports.length > 1 ? (
              <div className="pointer-events-none absolute left-16 right-16 top-0 h-px bg-slate-300" />
            ) : null}
            {directReports.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-3 w-px bg-slate-300" />
                <OrgTreeNode
                  node={child}
                  selectedUserId={selectedUserId}
                  onSelect={onSelect}
                  currentDepth={currentDepth + 1}
                  maxDepth={maxDepth}
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

  const selectedDepth = orgChartQuery.data
    ? findNodeDepth(orgChartQuery.data, selectedUserId)
    : undefined;

  return (
    <section className="space-y-6">
      <Header
        title="Organization chart"
        description="Profile-based org chart with hover details and selected-level focus."
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
              Hover a profile to see name, designation, and department.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="min-w-[360px]">
              <OrgTreeNode
                node={orgChartQuery.data}
                selectedUserId={selectedUserId}
                onSelect={handleSelectUser}
                currentDepth={0}
                maxDepth={selectedDepth}
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
