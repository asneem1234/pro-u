import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader, 
  AlertCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  Filter,
  X,
  Download
} from 'lucide-react';
import { employeeAPI } from '../api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Input';
import { useToast } from '../context/ToastContext';
import { exportEmployeesToCSV } from '../utils/export';

const DEPARTMENTS = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hire_date: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, filterDepartment, filterStatus]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterDepartment) params.department = filterDepartment;
      if (filterStatus) params.status = filterStatus;
      
      const response = await employeeAPI.getAll(params);
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      hire_date: '',
      status: 'active',
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setEditingEmployee(null);
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department,
      position: employee.position,
      salary: employee.salary || '',
      hire_date: employee.hire_date || '',
      status: employee.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openDeleteModal = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.position.trim()) errors.position = 'Position is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const data = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      };

      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, data);
        toast.success('Employee updated successfully!');
      } else {
        await employeeAPI.create(data);
        toast.success('Employee added successfully!');
      }
      
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save employee';
      setFormErrors({ submit: message });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await employeeAPI.delete(deletingEmployee.id);
      setShowDeleteModal(false);
      toast.success('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to delete employee');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (employees.length === 0) {
      toast.warning('No employees to export');
      return;
    }
    exportEmployeesToCSV(employees);
    toast.success('Employees exported to CSV!');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDepartment('');
    setFilterStatus('');
  };

  const hasActiveFilters = searchQuery || filterDepartment || filterStatus;

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Employees</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your team members</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'secondary'} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                label="Department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                options={DEPARTMENTS}
                placeholder="All Departments"
                className="flex-1"
              />
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
                placeholder="All Status"
                className="flex-1"
              />
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employee Grid */}
      {employees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first employee'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((employee) => (
            <div 
              key={employee.id} 
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-500 animate-slideIn hover:bg-white dark:hover:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{employee.position}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                  employee.status === 'active' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-stone-100 dark:bg-gray-700 text-stone-700 dark:text-gray-300'
                }`}>
                  {employee.status}
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mr-2 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-amber-400/20 transition-all duration-300">
                    <Mail size={14} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mr-2 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-emerald-400/20 transition-all duration-300">
                      <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-2 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-teal-400/20 transition-all duration-300">
                    <Building size={14} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <span>{employee.department}</span>
                </div>
                {employee.salary && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mr-2 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-amber-400/20 transition-all duration-300">
                      <Briefcase size={14} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium">${employee.salary.toLocaleString()}/year</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditModal(employee)}
                >
                  <Edit2 size={14} className="mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openDeleteModal(employee)}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.submit && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {formErrors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              placeholder="John Smith"
            />
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              placeholder="john@company.com"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-234-567-8900"
            />
            <Select
              label="Department *"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={DEPARTMENTS}
              error={formErrors.department}
            />
            <Input
              label="Position *"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              error={formErrors.position}
              placeholder="Software Engineer"
            />
            <Input
              label="Salary (Annual)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="75000"
            />
            <Input
              label="Hire Date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Delete {deletingEmployee?.name}?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This action cannot be undone. All tasks assigned to this employee will be unassigned.
          </p>
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={handleDelete}
              loading={saving}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
