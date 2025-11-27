import { useState } from 'react';
import { taskAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { CheckCircle, Clock, AlertTriangle, MoreVertical, User } from 'lucide-react';

const TaskKanban = ({ tasks, employees, onTaskUpdate, onRefresh }) => {
  const toast = useToast();
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'pending', title: 'To Do', icon: AlertTriangle, color: 'yellow' },
    { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'blue' },
    { id: 'completed', title: 'Completed', icon: CheckCircle, color: 'green' },
  ];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskAPI.update(draggedTask.id, { ...draggedTask, status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update task');
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-gray-400';
    }
  };

  const getColumnTasks = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        const Icon = column.icon;
        
        return (
          <div
            key={column.id}
            className={`
              bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-h-[400px]
              border-2 border-dashed border-transparent
              transition-colors duration-200
              ${draggedTask && draggedTask.status !== column.id ? 'border-indigo-300 dark:border-indigo-600' : ''}
            `}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-${column.color}-100 dark:bg-${column.color}-900/30`}>
                  <Icon className={`w-4 h-4 text-${column.color}-600 dark:text-${column.color}-400`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm
                    border-l-4 ${getPriorityColor(task.priority)}
                    cursor-grab active:cursor-grabbing
                    hover:shadow-md transition-all duration-200
                    ${draggedTask?.id === task.id ? 'opacity-50' : ''}
                  `}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.employee_name ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              {task.employee_name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.employee_name.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <User size={14} />
                          <span className="text-xs">Unassigned</span>
                        </div>
                      )}
                    </div>
                    
                    {task.due_date && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        new Date(task.due_date) < new Date() && task.status !== 'completed'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Priority indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanban;
