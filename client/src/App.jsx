import { Route, Routes } from 'react-router-dom';
import { PageMetaProvider } from './context/PageMetaContext';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { LeadFormPage } from './pages/leads/LeadFormPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { CompaniesPage } from './pages/companies/CompaniesPage';
import { CompanyFormPage } from './pages/companies/CompanyFormPage';
import { CompanyDetailPage } from './pages/companies/CompanyDetailPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { TaskFormPage } from './pages/tasks/TaskFormPage';
import { TaskDetailPage } from './pages/tasks/TaskDetailPage';
import { UsersPage } from './pages/users/UsersPage';
import { UserFormPage } from './pages/users/UserFormPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <PageMetaProvider>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/new" element={<RoleGuard roles={['admin']}><LeadFormPage /></RoleGuard>} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/:id/edit" element={<LeadFormPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<RoleGuard roles={['admin']}><CompanyFormPage /></RoleGuard>} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="companies/:id/edit" element={<RoleGuard roles={['admin']}><CompanyFormPage /></RoleGuard>} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/new" element={<RoleGuard roles={['admin']}><TaskFormPage /></RoleGuard>} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="tasks/:id/edit" element={<RoleGuard roles={['admin']}><TaskFormPage /></RoleGuard>} />
          <Route path="users" element={<RoleGuard roles={['admin']}><UsersPage /></RoleGuard>} />
          <Route path="users/new" element={<RoleGuard roles={['admin']}><UserFormPage /></RoleGuard>} />
          <Route path="users/:id/edit" element={<RoleGuard roles={['admin']}><UserFormPage /></RoleGuard>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </PageMetaProvider>
  );
}
