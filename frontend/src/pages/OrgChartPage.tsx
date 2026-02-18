import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Header } from '../components/Header'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../hooks/useAuth'
import { useOrgChart } from '../hooks/useOrgChart'
import {useEmployeeSearch} from "../hooks/useEmployeeSearch"
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { OrgChartNode, OrgChartUser } from '../types/org-chart'

type OrgChartNodeProps = {
  node: OrgChartNode
  onSelect: (userId: number) => void
}

const OrgChartNodeCard = ({ node, onSelect }: OrgChartNodeProps) => {
  const departmentLabel = node.department ? `• ${node.department}` : ''
  const designationLabel = node.designation ? `• ${node.designation}` : ''

  return (
    <button
      type="button"
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-brand-200"
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-center gap-4">
        {node.profilePhotoUrl ? (
          <img
            src={node.profilePhotoUrl}
            alt={node.fullName}
            className="h-12 w-12 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
            N/A
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">{node.fullName}</p>
          <p className="text-xs text-slate-500">{node.email}</p>
          <p className="text-xs text-slate-500">
            {departmentLabel} {designationLabel}
          </p>
        </div>
      </div>
    </button>
  )
}

const findPathToUser = (node: OrgChartNode, targetId: number): OrgChartNode[] | null => {
  if (node.id === targetId) {
    return [node]
  }

  for (const child of node.directReports) {
    const childPath = findPathToUser(child, targetId)
    if (childPath) {
      return [node, ...childPath]
    }
  }

  return null
}

const getAlignmentClass = (index: number) => {
  if (index === 0) {
    return 'flex justify-center'
  }

  return index % 2 === 1 ? 'flex justify-start' : 'flex justify-end'
}

export const OrgChartPage = () => {
  const { userId } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(userId)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(searchQuery, 300)

  const orgChartQuery = useOrgChart(selectedUserId, Boolean(selectedUserId))
  const searchQueryEnabled = debouncedQuery.trim().length >= 2
  const searchQueryResult = useEmployeeSearch(debouncedQuery.trim(), searchQueryEnabled)

  const searchResults = searchQueryResult.data ?? []

  const orgPath = (() => {
    if (!orgChartQuery.data) {
      return []
    }

    const targetId = selectedUserId ?? orgChartQuery.data.id
    return findPathToUser(orgChartQuery.data, targetId) ?? [orgChartQuery.data]
  })()

  const handleSelectUser = (userIdValue: number) => {
    setSelectedUserId(userIdValue)
    setSearchQuery('')
  }

  const handleSearchSelect = (user: OrgChartUser) => {
    setSelectedUserId(user.id)
    setSearchQuery(user.fullName)
  }

  return (
    <section className="space-y-6">
      <Header
        title="Organization chart"
        description="Explore reporting lines and navigate to any employee."
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

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search employee"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Select from results</span>
            <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white">
              {searchQueryEnabled && searchQueryResult.isLoading ? (
                <div className="px-3 py-2 text-xs text-slate-500">Searching...</div>
              ) : null}
              {searchQueryEnabled && !searchQueryResult.isLoading && searchResults.length ? (
                searchResults.map((user:any) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-50"
                    onClick={() => handleSearchSelect(user)}
                  >
                    <span>{user.fullName}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </button>
                ))
              ) : null}
              {searchQueryEnabled && !searchQueryResult.isLoading && !searchResults.length ? (
                <div className="px-3 py-2 text-xs text-slate-500">No matches</div>
              ) : null}
              {!searchQueryEnabled ? (
                <div className="px-3 py-2 text-xs text-slate-500">Type at least 2 characters.</div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {orgChartQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading org chart...
        </div>
      ) : null}

      {orgChartQuery.isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load organization chart.</p>
        </Card>
      ) : null}

      {orgChartQuery.data ? (
        <div className="space-y-3">
          {orgPath.map((node, index) => {
            const alignmentClass = getAlignmentClass(index)

            return (
              <div key={node.id} className="space-y-2">
                {index > 0 ? (
                  <div className={alignmentClass}>
                    <div className="flex w-full max-w-sm justify-center">
                      <div className="h-6 w-px bg-slate-300" />
                    </div>
                  </div>
                ) : null}
                <div className={alignmentClass}>
                  <OrgChartNodeCard node={node} onSelect={handleSelectUser} />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {!orgChartQuery.isLoading && !orgChartQuery.isError && !orgChartQuery.data ? (
        <EmptyState
          title="No org chart"
          description="We couldn't find any reporting structure for this user."
        />
      ) : null}
    </section>
  )
}