import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Header } from '../components/Header'
import { Spinner } from '../components/ui/Spinner'
import { useTeamMembers } from '../hooks/useManager'

export const TeamMembersPage = () => {
  const { data, isLoading, isError } = useTeamMembers()

  return (
    <section className="space-y-6">
      <Header title="Team members" description="View the employees reporting to you." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading team members...
        </div>
      ) : null}

      {isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load team members right now.</p>
        </Card>
      ) : null}

      {data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((member) => (
            <Card key={member.id} className="space-y-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{member.fullName}</h3>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              <div className="text-xs text-slate-500">
                {member.department ? <p>Department: {member.department}</p> : null}
                {member.designation ? <p>Designation: {member.designation}</p> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && !data?.length ? (
        <EmptyState title="No team members" description="Your team members will appear here once assigned." />
      ) : null}
    </section>
  )
}