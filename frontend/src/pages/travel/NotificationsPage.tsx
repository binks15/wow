import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Header } from '../../components/Header'
import { Spinner } from '../../components/ui/Spinner'
import { useMarkNotification, useNotifications } from '../../hooks/useNotifications'
import { formatDate } from '../../utils/format'
import { MdMarkChatRead } from "react-icons/md"
type NotificationItem = {
  notificationId: number
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

export const NotificationsPage = () => {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markMutation = useMarkNotification()
  const cardGridClass =
    'grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,320px))] justify-center sm:justify-start'

  const handleToggle = async (notificationId: number, isRead: boolean) => {
    await markMutation.mutateAsync({ notificationId, isRead })
    await refetch()
  }

  return (
    <section className="space-y-6">
      <Header title="Notifications" description="Stay updated on travel and expense activity." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading notifications...
        </div>
      ) : null}

      {isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load notifications right now.</p>
        </Card>
      ) : null}

      {data?.length ? (
        <div className={cardGridClass}>
          {(data as NotificationItem[]).map((item) => (
            <Card key={item.notificationId} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.message}</p>
                </div>
                <button
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  onClick={() => handleToggle(item.notificationId, !item.isRead)}
                >
                  <MdMarkChatRead  color='green' size={20}/>
                  
                </button>
              </div>
              <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && !data?.length ? (
        <EmptyState title="No notifications" description="You're all caught up for now." />
      ) : null}
    </section>
  )
}