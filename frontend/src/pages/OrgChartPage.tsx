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
import type { OrgChartNode } from "../types/org-chart";

type TreeNodeProps = {
  node: OrgChartNode;
  selectedUserId?: number;
  onSelect: (userId: number) => void;
  depth?: number;
};

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const OrgTreeNode = ({
  node,
  selectedUserId,
  onSelect,
  depth = 0,
}: TreeNodeProps) => {
  const isSelected = node.id === selectedUserId;
  const hoverText = `${node.fullName}${node.designation ? ` • ${node.designation}` : ""}`;

  return (
    <div className={depth === 0 ? "" : "ml-6 border-l border-slate-300 pl-5"}>
      <div className="flex items-center gap-2">
        {depth > 0 ? <span className="h-px w-4 bg-slate-300" /> : null}
        <button
          type="button"
          title={hoverText}
          className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition ${
            isSelected
              ? "border-brand-500 bg-brand-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50"
          }`}
          onClick={() => onSelect(node.id)}
        >
          {getInitials(node.fullName)}
        </button>
      </div>

      {node.directReports.length ? (
        <div className="mt-3 space-y-3">
          {node.directReports.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              selectedUserId={selectedUserId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
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
  const searchOptions = searchResults.map((user) => ({
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
        description="Tree view org chart. Hover on nodes to see name and designation."
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
              Click a node to focus that employee's tree.
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
