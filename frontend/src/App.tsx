import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Projects } from './pages/Projects/Projects';
import { ProjectDetails } from './pages/Projects/ProjectDetails';
import { MyTasks } from './pages/Tasks/MyTasks';
import { ActivityLog } from './pages/Activity/ActivityLog';
import { TeamManagement } from './pages/Users/TeamManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="users" element={<TeamManagement />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid #f1f5f9'
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
