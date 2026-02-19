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
import { FaRegUser } from "react-icons/fa";

type OrgChartNodeProps = {
  node: OrgChartNode;
  onSelect: (userId: number) => void;
  isSelected?: boolean;
};

const OrgChartNodeCard = ({ node, onSelect, isSelected = false }: OrgChartNodeProps) => {
  const meta = [node.department, node.designation].filter(Boolean).join(" • ");

  return (
    <button
      type="button"
      className={`w-full rounded-lg border p-3 text-left transition ${
        isSelected
          ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
          : "border-slate-200 bg-white hover:border-brand-200"
      }`}
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-3">
        {node.profilePhotoUrl ? (
          <img
            src={node.profilePhotoUrl}
            alt={node.fullName}
            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
            <FaRegUser />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {node.fullName}
          </p>
          <p className="text-xs text-slate-500">{node.email}</p>
          {meta ? <p className="text-xs text-slate-500">{meta}</p> : null}
        </div>
      </div>
    </button>
  );
};

const findPathToUser = (
  node: OrgChartNode,
  targetId: number,
): OrgChartNode[] | null => {
  if (node.id === targetId) {
    return [node];
  }

  for (const child of node.directReports) {
    const childPath = findPathToUser(child, targetId);
    if (childPath) {
      return [node, ...childPath];
    }
  }

  return null;
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

  const orgPath = (() => {
    if (!orgChartQuery.data) {
      return [];
    }

    const targetId = selectedUserId ?? orgChartQuery.data.id;
    return findPathToUser(orgChartQuery.data, targetId) ?? [orgChartQuery.data];
  })();

  const selectedNode = orgPath.length ? orgPath[orgPath.length - 1] : undefined;
  const parentNode = orgPath.length > 1 ? orgPath[orgPath.length - 2] : undefined;
  const siblings = parentNode && selectedNode
    ? parentNode.directReports.filter((user) => user.id !== selectedNode.id)
    : [];

  const handleSelectUser = (userIdValue: number) => {
    setSelectedUserId(userIdValue);
    setSearchQuery("");
  };

  return (
    <section className="space-y-6">
      <Header
        title="Organization chart"
        description="Explore reporting lines, direct reports, and siblings."
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
              Reporting path
            </h3>
            <p className="text-xs text-slate-500">
              Click any person to focus their organization chain.
            </p>
          </div>
          <div className="mx-auto w-full max-w-2xl space-y-1">
            {orgPath.map((node, index) => (
              <div key={node.id} className="flex flex-col items-center">
                {index > 0 ? <div className="h-5 w-px bg-slate-300" /> : null}
                <OrgChartNodeCard
                  node={node}
                  onSelect={handleSelectUser}
                  isSelected={node.id === selectedUserId}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h4 className="text-sm font-semibold text-slate-900">Siblings</h4>
            {siblings.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {siblings.map((sibling) => (
                  <OrgChartNodeCard
                    key={sibling.id}
                    node={sibling}
                    onSelect={handleSelectUser}
                    isSelected={sibling.id === selectedUserId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {parentNode
                  ? "No siblings found for the selected employee."
                  : "Top-level employee has no siblings in this view."}
              </p>
            )}
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
