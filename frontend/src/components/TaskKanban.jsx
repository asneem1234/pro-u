import { useState } from 'react';
import { taskAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

const TaskKanban = ({ tasks = [], onStatusChange }) => {
  const toast = useToast();
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'pending', title: 'To Do', icon: AlertTriangle, bgColor: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
    { id: 'in-progress', title: 'In Progress', icon: Clock, bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'completed', title: 'Completed', icon: CheckCircle, bgColor: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
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
      if (onStatusChange) {
        onStatusChange(draggedTask.id, newStatus);
      }
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
              bg-stone-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 min-h-[400px]
              border-2 border-dashed border-transparent
              transition-all duration-300 hover:bg-stone-100/80 dark:hover:bg-gray-800/70
              ${draggedTask && draggedTask.status !== column.id ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[1.02]' : ''}
            `}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${column.bgColor} transition-all duration-300 hover:scale-110 hover:shadow-md`}>
                  <Icon className={`w-4 h-4 ${column.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{column.title}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-sm">
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
                    group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-sm
                    border-l-4 ${getPriorityColor(task.priority)}
                    cursor-grab active:cursor-grabbing
                    hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300
                    ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''}
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
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-emerald-500/30 transition-all duration-300">
                            <span className="text-xs font-medium text-white">
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
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        new Date(task.due_date) < new Date() && task.status !== 'completed'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-stone-100 text-stone-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Priority indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-stone-100 text-stone-600 dark:bg-gray-700 dark:text-gray-400'
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
