import { format, isAfter, isBefore, addDays } from 'date-fns';

const taskCategories = [
  { value: 'research', label: 'Legal Research', color: 'bg-blue-100 text-blue-800' },
  { value: 'discovery', label: 'Discovery', color: 'bg-green-100 text-green-800' },
  { value: 'filing', label: 'Court Filing', color: 'bg-purple-100 text-purple-800' },
  { value: 'client', label: 'Client Communication', color: 'bg-orange-100 text-orange-800' },
  { value: 'preparation', label: 'Case Preparation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const priorityLevels = [
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' }
];

export default function CaseOrganization() {
  const { state, dispatch } = useLegal();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'research',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    status: 'pending'
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    role: '',
    organization: '',
    email: '',
    phone: '',
    notes: ''
  });

  const tasks = state.tasks || [];
  const contacts = state.contacts || [];

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => 
    task.status === 'pending' && 
    task.dueDate && 
    isBefore(new Date(task.dueDate), new Date())
  );

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: 'research',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      status: 'pending'
    });
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const resetContactForm = () => {
    setContactForm({
      name: '',
      role: '',
      organization: '',
      email: '',
      phone: '',
      notes: ''
    });
    setShowContactModal(false);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      ...taskForm,
      id: selectedTask ? selectedTask.id : Date.now().toString(),
      createdDate: selectedTask ? selectedTask.createdDate : new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    if (selectedTask) {
      dispatch({ type: 'UPDATE_TASK', payload: taskData });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }
    resetTaskForm();
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const contactData = {
      ...contactForm,
      id: Date.now().toString(),
      createdDate: new Date().toISOString()
    };
    dispatch({ type: 'ADD_CONTACT', payload: contactData });
    resetContactForm();
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm(task);
    setShowTaskModal(true);
  };

  const handleToggleTaskStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed',
        completedDate: task.status === 'pending' ? new Date().toISOString() : null,
        updatedDate: new Date().toISOString()
      };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    }
  };

  const getCategoryColor = (category) => {
    const cat = taskCategories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const pri = priorityLevels.find(p => p.value === priority);
    return pri ? pri.color : 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusIcon = (task) => {
    if (task.status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    if (task.dueDate && isBefore(new Date(task.dueDate), new Date())) {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <ClockIcon className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Organization</h1>
          <p className="mt-2 text-gray-600">
            Manage tasks, deadlines, and case contacts in one place
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Task
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="btn-secondary"
          >
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Task Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-red-50 border-red-200"
        >
          <div className="flex items-center mb-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-900">Overdue Tasks</h2>
          </div>
          <div className="space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex justify-between items-center p-2 bg-red-100 rounded">
                <span className="font-medium text-red-900">{task.title}</span>
                <span className="text-sm text-red-700">
                  Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                </span>
              </div>
            ))}
            {overdueTasks.length > 3 && (
              <p className="text-sm text-red-700">+{overdueTasks.length - 3} more overdue tasks</p>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Tasks</h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="mt-1"
                      >
                        {getTaskStatusIcon(task)}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                            {taskCategories.find(c => c.value === task.category)?.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due {format(new Date(task.dueDate), 'MMM dd')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed</h2>
              <div className="space-y-2">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-900 line-through">{task.title}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {format(new Date(task.completedDate), 'MMM dd')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contacts Sidebar */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Contacts</h2>
          <div className="space-y-3">
            {contacts.slice(0, 8).map((contact) => (
              <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{contact.name}</h3>
                <p className="text-sm text-gray-600">{contact.role}</p>
                {contact.organization && (
                  <p className="text-sm text-gray-500">{contact.organization}</p>
                )}
                <div className="mt-2 space-y-1">
                  {contact.email && (
                    <p className="text-xs text-gray-600">{contact.email}</p>
                  )}
                  {contact.phone && (
                    <p className="text-xs text-gray-600">{contact.phone}</p>
                  )}
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-4">
                <UserGroupIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No contacts added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={resetTaskForm} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              >
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {selectedTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="input-field"
                      placeholder="Task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      rows={3}
                      className="input-field"
                      placeholder="Task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={taskForm.category}
                        onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                        className="input-field"
                      >
                        {taskCategories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="input-field"
                      >
                        {priorityLevels.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="input-field"
                      placeholder="Person responsible"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetTaskForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {selectedTask ? 'Update' : 'Add'} Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={resetContactForm} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              >
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Add New Contact
                </h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="input-field"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.role}
                      onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Witness, Expert, Opposing Counsel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={contactForm.organization}
                      onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                      className="input-field"
                      placeholder="Company or firm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-field"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="input-field"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      rows={3}
                      className="input-field"
                      placeholder="Additional notes about this contact"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetContactForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Contact
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
