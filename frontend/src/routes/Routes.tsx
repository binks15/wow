import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, GuestRoute, RoleRoute } from "./protected-route";
import { LoginPage } from "../pages/LoginPage";
import { Home } from "../components/Home";
import { DashboardPage } from "../pages/DashboardPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AccessDeniedPage } from "../pages/AccessDeniedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { TravelsPage } from "../pages/travel/TravelPage";
import { ExpensesPage } from "../pages/travel/ExpensesPage";
import { DocumentsPage } from "../pages/travel/DocumentsPage";
import { NotificationsPage } from "../pages/travel/NotificationsPage";
import { HrReviewsPage } from "../pages/travel/HrReviewsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { OrgChartPage } from "../pages/OrgChartPage";
import { ExpenseConfigPage } from "../pages/travel/ExpenseConfigPage";
import { TeamMembersPage } from "../pages/TeamMembersPage";
import { GamesPage } from "../pages/games/GamesPage";
import { GameAdminPage } from "../pages/games/GameAdminPage";
import { GameBookingsPage } from "../pages/games/GameBookingsPage";
import { GameRequestsPage } from "../pages/games/GameRequestsPage";


export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
    {
      path: '/register',
      element: (
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      )
    },
    {
      path: '/access-denied',
      element: <AccessDeniedPage />
    },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
        {
          path: 'travels',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <TravelsPage />
            </RoleRoute>
          )
        },
        {
          path: 'expenses',
          element: (
            <RoleRoute allowedRoles={['Employee', 'HR']}>
              <ExpensesPage />
            </RoleRoute>
          )
        },
        {
          path: 'documents',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <DocumentsPage />
            </RoleRoute>
          )
        },
        {
          path: 'notifications',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <NotificationsPage />
            </RoleRoute>
          )
        },
        {
          path: 'profile',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <ProfilePage />
            </RoleRoute>
          )
        },
        {
          path: 'org-chart',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <OrgChartPage />
            </RoleRoute>
          )
        },
        {
          path: 'games',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <GamesPage />
            </RoleRoute>
          )
        },
        {
          path: 'games/bookings',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <GameBookingsPage />
            </RoleRoute>
          )
        },
        {
          path: 'games/requests',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <GameRequestsPage />
            </RoleRoute>
          )
        },
        {
          path: 'games/upcoming',
          element: (
            <RoleRoute allowedRoles={['Employee', 'Manager', 'HR']}>
              <GameBookingsPage />
            </RoleRoute>
          )
        },
        {
          path: 'games/admin',
          element: (
            <RoleRoute allowedRoles={['Manager', 'HR']}>
              <GameAdminPage />
            </RoleRoute>
          )
        },
        {
          path: 'manager/team-members',
          element: (
            <RoleRoute allowedRoles={['Manager']}>
              <TeamMembersPage />
            </RoleRoute>
          )
        },
        {
          path: 'hr/reviews',
          element: (
            <RoleRoute allowedRoles={['HR']}>
              <HrReviewsPage />
            </RoleRoute>
          )
        },
        {
          path: 'hr/expense-config',
          element: (
            <RoleRoute allowedRoles={['HR']}>
              <ExpenseConfigPage />
            </RoleRoute>
          )
        }
    ],
  },
    {
      path: '*',
      element: <NotFoundPage />
    }
]);