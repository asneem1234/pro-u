import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if we're in demo mode (no backend available)
let isDemoMode = false;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Demo data for when backend is unavailable
const demoEmployees = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', phone: '555-0101', position: 'Senior Developer', department: 'Engineering', status: 'active', salary: 95000, hire_date: '2023-01-15' },
  { id: 2, name: 'Michael Chen', email: 'michael@company.com', phone: '555-0102', position: 'Product Manager', department: 'Product', status: 'active', salary: 105000, hire_date: '2022-06-20' },
  { id: 3, name: 'Emily Davis', email: 'emily@company.com', phone: '555-0103', position: 'UX Designer', department: 'Design', status: 'active', salary: 85000, hire_date: '2023-03-10' },
  { id: 4, name: 'James Wilson', email: 'james@company.com', phone: '555-0104', position: 'DevOps Engineer', department: 'Engineering', status: 'active', salary: 92000, hire_date: '2022-11-05' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa@company.com', phone: '555-0105', position: 'Marketing Lead', department: 'Marketing', status: 'active', salary: 88000, hire_date: '2023-02-28' },
  { id: 6, name: 'David Brown', email: 'david@company.com', phone: '555-0106', position: 'Data Analyst', department: 'Analytics', status: 'inactive', salary: 78000, hire_date: '2021-09-15' },
];

const demoTasks = [
  { id: 1, title: 'Implement user authentication', description: 'Add JWT-based authentication system', status: 'completed', priority: 'high', due_date: '2025-11-20', employee_id: 1, employee_name: 'Sarah Johnson' },
  { id: 2, title: 'Design new dashboard', description: 'Create wireframes for the analytics dashboard', status: 'in-progress', priority: 'high', due_date: '2025-11-28', employee_id: 3, employee_name: 'Emily Davis' },
  { id: 3, title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'in-progress', priority: 'medium', due_date: '2025-11-30', employee_id: 4, employee_name: 'James Wilson' },
  { id: 4, title: 'Q4 Marketing campaign', description: 'Plan and execute holiday marketing campaign', status: 'pending', priority: 'high', due_date: '2025-12-01', employee_id: 5, employee_name: 'Lisa Anderson' },
  { id: 5, title: 'Database optimization', description: 'Optimize slow queries and add indexes', status: 'pending', priority: 'medium', due_date: '2025-12-05', employee_id: 1, employee_name: 'Sarah Johnson' },
  { id: 6, title: 'User research interviews', description: 'Conduct 10 user interviews for new feature', status: 'completed', priority: 'medium', due_date: '2025-11-18', employee_id: 3, employee_name: 'Emily Davis' },
  { id: 7, title: 'API documentation', description: 'Document all REST API endpoints', status: 'in-progress', priority: 'low', due_date: '2025-12-10', employee_id: 1, employee_name: 'Sarah Johnson' },
  { id: 8, title: 'Sales report analysis', description: 'Analyze Q3 sales data and prepare report', status: 'completed', priority: 'high', due_date: '2025-11-15', employee_id: 6, employee_name: 'David Brown' },
];

let localEmployees = [...demoEmployees];
let localTasks = [...demoTasks];
let nextEmployeeId = 7;
let nextTaskId = 9;

const demoStats = () => ({
  employees: {
    total: localEmployees.length,
    active: localEmployees.filter(e => e.status === 'active').length,
  },
  tasks: {
    total: localTasks.length,
    completed: localTasks.filter(t => t.status === 'completed').length,
    pending: localTasks.filter(t => t.status === 'pending').length,
    inProgress: localTasks.filter(t => t.status === 'in-progress').length,
  },
  recentTasks: localTasks.slice(0, 5),
  tasksByStatus: [
    { name: 'Pending', value: localTasks.filter(t => t.status === 'pending').length },
    { name: 'In Progress', value: localTasks.filter(t => t.status === 'in-progress').length },
    { name: 'Completed', value: localTasks.filter(t => t.status === 'completed').length },
  ],
  tasksByPriority: [
    { name: 'High', value: localTasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: localTasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: localTasks.filter(t => t.priority === 'low').length },
  ],
});

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check backend availability on startup
const checkBackend = async () => {
  try {
    await api.get('/health');
    isDemoMode = false;
    console.log('✅ Backend connected');
  } catch (error) {
    isDemoMode = true;
    console.log('📦 Running in demo mode (no backend)');
  }
};

// Initialize check
checkBackend();

// Auth API
export const authAPI = {
  login: async (data) => {
    if (isDemoMode) {
      await delay(500);
      return { data: { token: 'demo-token', user: { id: 1, name: 'Demo User', email: data.email } } };
    }
    return api.post('/auth/login', data);
  },
  register: async (data) => {
    if (isDemoMode) {
      await delay(500);
      return { data: { token: 'demo-token', user: { id: 1, name: data.name, email: data.email } } };
    }
    return api.post('/auth/register', data);
  },
  getMe: async () => {
    if (isDemoMode) {
      await delay(200);
      return { data: { id: 1, name: 'Demo User', email: 'demo@example.com' } };
    }
    return api.get('/auth/me');
  },
};

// Employee API
export const employeeAPI = {
  getAll: async (params) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.get('/employees', { params });
    } catch {
      isDemoMode = true;
      await delay(300);
      let filtered = [...localEmployees];
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(search) || 
          e.email.toLowerCase().includes(search)
        );
      }
      if (params?.department) {
        filtered = filtered.filter(e => e.department === params.department);
      }
      if (params?.status) {
        filtered = filtered.filter(e => e.status === params.status);
      }
      return { data: filtered };
    }
  },
  getById: async (id) => {
    if (isDemoMode) {
      await delay(200);
      return { data: localEmployees.find(e => e.id === parseInt(id)) };
    }
    return api.get(`/employees/${id}`);
  },
  create: async (data) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.post('/employees', data);
    } catch {
      isDemoMode = true;
      await delay(300);
      const newEmployee = { ...data, id: nextEmployeeId++ };
      localEmployees.push(newEmployee);
      return { data: newEmployee };
    }
  },
  update: async (id, data) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.put(`/employees/${id}`, data);
    } catch {
      isDemoMode = true;
      await delay(300);
      const index = localEmployees.findIndex(e => e.id === parseInt(id));
      if (index !== -1) {
        localEmployees[index] = { ...localEmployees[index], ...data };
      }
      return { data: localEmployees[index] };
    }
  },
  delete: async (id) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.delete(`/employees/${id}`);
    } catch {
      isDemoMode = true;
      await delay(300);
      localEmployees = localEmployees.filter(e => e.id !== parseInt(id));
      return { data: { success: true } };
    }
  },
};

// Task API
export const taskAPI = {
  getAll: async (params) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.get('/tasks', { params });
    } catch {
      isDemoMode = true;
      await delay(300);
      let filtered = [...localTasks];
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(search) || 
          t.description?.toLowerCase().includes(search)
        );
      }
      if (params?.status) {
        filtered = filtered.filter(t => t.status === params.status);
      }
      if (params?.priority) {
        filtered = filtered.filter(t => t.priority === params.priority);
      }
      return { data: filtered };
    }
  },
  getById: async (id) => {
    if (isDemoMode) {
      await delay(200);
      return { data: localTasks.find(t => t.id === parseInt(id)) };
    }
    return api.get(`/tasks/${id}`);
  },
  create: async (data) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.post('/tasks', data);
    } catch {
      isDemoMode = true;
      await delay(300);
      const employee = localEmployees.find(e => e.id === parseInt(data.employee_id));
      const newTask = { 
        ...data, 
        id: nextTaskId++,
        employee_name: employee?.name || null
      };
      localTasks.push(newTask);
      return { data: newTask };
    }
  },
  update: async (id, data) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.put(`/tasks/${id}`, data);
    } catch {
      isDemoMode = true;
      await delay(300);
      const index = localTasks.findIndex(t => t.id === parseInt(id));
      if (index !== -1) {
        const employee = data.employee_id ? localEmployees.find(e => e.id === parseInt(data.employee_id)) : null;
        localTasks[index] = { 
          ...localTasks[index], 
          ...data,
          employee_name: employee?.name || localTasks[index].employee_name
        };
      }
      return { data: localTasks[index] };
    }
  },
  delete: async (id) => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.delete(`/tasks/${id}`);
    } catch {
      isDemoMode = true;
      await delay(300);
      localTasks = localTasks.filter(t => t.id !== parseInt(id));
      return { data: { success: true } };
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      if (isDemoMode) throw new Error('Demo mode');
      return await api.get('/dashboard/stats');
    } catch {
      isDemoMode = true;
      await delay(400);
      return { data: demoStats() };
    }
  },
};

// Utility API
export const utilityAPI = {
  seedData: async () => {
    if (isDemoMode) {
      await delay(500);
      localEmployees = [...demoEmployees];
      localTasks = [...demoTasks];
      nextEmployeeId = 7;
      nextTaskId = 9;
      return { data: { message: 'Demo data restored!' } };
    }
    return api.post('/seed');
  },
  healthCheck: async () => {
    try {
      return await api.get('/health');
    } catch {
      isDemoMode = true;
      return { data: { status: 'demo', message: 'Running in demo mode' } };
    }
  },
};

export default api;
