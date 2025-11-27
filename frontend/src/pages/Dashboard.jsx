import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader,
  Database,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dashboardAPI, utilityAPI } from '../api';
import Button from '../components/Button';
import AnimatedCounter from '../components/AnimatedCounter';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await utilityAPI.seedData();
      await fetchStats();
      toast.success('Sample data loaded successfully!');
    } catch (err) {
      toast.error('Failed to load sample data');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const COLORS = ['#059669', '#D97706', '#0D9488', '#CA8A04', '#047857', '#B45309'];

  const StatCard = ({ icon: Icon, title, value, subtitle, color, to }) => (
    <Link to={to} className="block group">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-500 hover:-translate-y-2 hover:bg-white dark:hover:bg-gray-800 group-hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              <AnimatedCounter value={value} duration={1200} />
            </p>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-3`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
      </div>
    </Link>
  );

  const TaskStatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={fetchStats} className="mt-4">Retry</Button>
      </div>
    );
  }

  const hasData = stats?.employees?.total > 0 || stats?.tasks?.total > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of your employees and tasks</p>
        </div>
        {!hasData && (
          <Button onClick={handleSeedData} loading={seeding}>
            <Database className="w-4 h-4 mr-2" />
            Load Sample Data
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Employees"
          value={stats?.employees?.total || 0}
          subtitle={`${stats?.employees?.active || 0} active`}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          to="/employees"
        />
        <StatCard
          icon={CheckSquare}
          title="Total Tasks"
          value={stats?.tasks?.total || 0}
          subtitle={`${stats?.tasks?.completed || 0} completed`}
          color="bg-gradient-to-br from-amber-400 to-amber-500"
          to="/tasks"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={stats?.tasks?.inProgress || 0}
          subtitle="Tasks being worked on"
          color="bg-gradient-to-br from-teal-500 to-teal-600"
          to="/tasks"
        />
        <StatCard
          icon={AlertCircle}
          title="Pending Tasks"
          value={stats?.tasks?.pending || 0}
          subtitle="Awaiting action"
          color="bg-gradient-to-br from-orange-400 to-orange-500"
          to="/tasks"
        />
      </div>

      {/* Charts Row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employees by Department</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.departmentStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Priority Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.priorityStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="priority"
                    label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.priorityStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
            <Link to="/tasks" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(stats?.recentTasks || []).length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No tasks yet. Create your first task!
              </div>
            ) : (
              (stats?.recentTasks || []).map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.employee_name || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Employees</h3>
            <Link to="/employees" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(stats?.recentEmployees || []).length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No employees yet. Add your first employee!
              </div>
            ) : (
              (stats?.recentEmployees || []).map((employee) => (
                <div key={employee.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{employee.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{employee.position} • {employee.department}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
