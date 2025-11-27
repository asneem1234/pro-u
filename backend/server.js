const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'prou-secret-key-2025';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database('database.sqlite');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    salary REAL,
    hire_date DATE,
    status TEXT DEFAULT 'active',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
  );
`);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);

    const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastInsertRowid, name, email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
app.get('/api/employees', (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR position LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const employees = db.prepare(query).all(...params);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
app.post('/api/employees', (req, res) => {
  try {
    const { name, email, phone, department, position, salary, hire_date, status, avatar } = req.body;

    if (!name || !email || !department || !position) {
      return res.status(400).json({ error: 'Name, email, department, and position are required' });
    }

    const existingEmployee = db.prepare('SELECT * FROM employees WHERE email = ?').get(email);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    const result = db.prepare(`
      INSERT INTO employees (name, email, phone, department, position, salary, hire_date, status, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone || null, department, position, salary || null, hire_date || null, status || 'active', avatar || null);

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  try {
    const { name, email, phone, department, position, salary, hire_date, status, avatar } = req.body;
    const { id } = req.params;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, phone = ?, department = ?, position = ?, salary = ?, hire_date = ?, status = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || employee.name,
      email || employee.email,
      phone !== undefined ? phone : employee.phone,
      department || employee.department,
      position || employee.position,
      salary !== undefined ? salary : employee.salary,
      hire_date !== undefined ? hire_date : employee.hire_date,
      status || employee.status,
      avatar !== undefined ? avatar : employee.avatar,
      id
    );

    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ROUTES ====================

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const { search, status, priority, employee_id } = req.query;
    let query = `
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (tasks.title LIKE ? OR tasks.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND tasks.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND tasks.priority = ?';
      params.push(priority);
    }
    if (employee_id) {
      query += ' AND tasks.employee_id = ?';
      params.push(employee_id);
    }

    query += ' ORDER BY tasks.created_at DESC';
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = db.prepare(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE tasks.id = ?
    `).get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, status, priority, due_date, employee_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (employee_id) {
      const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }

    const result = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, employee_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description || null, status || 'pending', priority || 'medium', due_date || null, employee_id || null);

    const newTask = db.prepare(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE tasks.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, status, priority, due_date, employee_id } = req.body;
    const { id } = req.params;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (employee_id) {
      const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }

    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, employee_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || task.title,
      description !== undefined ? description : task.description,
      status || task.status,
      priority || task.priority,
      due_date !== undefined ? due_date : task.due_date,
      employee_id !== undefined ? employee_id : task.employee_id,
      id
    );

    const updatedTask = db.prepare(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      WHERE tasks.id = ?
    `).get(id);

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD STATS ====================

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'active'").get().count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get().count;
    const inProgressTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'").get().count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get().count;

    const departmentStats = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM employees 
      GROUP BY department
    `).all();

    const priorityStats = db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority
    `).all();

    const recentTasks = db.prepare(`
      SELECT tasks.*, employees.name as employee_name 
      FROM tasks 
      LEFT JOIN employees ON tasks.employee_id = employees.id 
      ORDER BY tasks.created_at DESC 
      LIMIT 5
    `).all();

    const recentEmployees = db.prepare(`
      SELECT * FROM employees 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all();

    res.json({
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks
      },
      departmentStats,
      priorityStats,
      recentTasks,
      recentEmployees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed sample data endpoint
app.post('/api/seed', (req, res) => {
  try {
    // Check if data already exists
    const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    if (employeeCount > 0) {
      return res.json({ message: 'Data already seeded' });
    }

    // Seed employees
    const employees = [
      { name: 'John Smith', email: 'john.smith@company.com', phone: '+1-234-567-8901', department: 'Engineering', position: 'Senior Developer', salary: 95000, hire_date: '2022-03-15', status: 'active' },
      { name: 'Sarah Johnson', email: 'sarah.j@company.com', phone: '+1-234-567-8902', department: 'Design', position: 'UI/UX Designer', salary: 75000, hire_date: '2022-06-01', status: 'active' },
      { name: 'Michael Brown', email: 'michael.b@company.com', phone: '+1-234-567-8903', department: 'Engineering', position: 'Backend Developer', salary: 85000, hire_date: '2021-11-20', status: 'active' },
      { name: 'Emily Davis', email: 'emily.d@company.com', phone: '+1-234-567-8904', department: 'HR', position: 'HR Manager', salary: 70000, hire_date: '2020-08-10', status: 'active' },
      { name: 'David Wilson', email: 'david.w@company.com', phone: '+1-234-567-8905', department: 'Marketing', position: 'Marketing Lead', salary: 80000, hire_date: '2021-04-25', status: 'active' },
      { name: 'Jessica Taylor', email: 'jessica.t@company.com', phone: '+1-234-567-8906', department: 'Engineering', position: 'Frontend Developer', salary: 82000, hire_date: '2023-01-10', status: 'active' },
      { name: 'Robert Martinez', email: 'robert.m@company.com', phone: '+1-234-567-8907', department: 'Sales', position: 'Sales Manager', salary: 90000, hire_date: '2019-09-05', status: 'active' },
      { name: 'Amanda Lee', email: 'amanda.l@company.com', phone: '+1-234-567-8908', department: 'Finance', position: 'Financial Analyst', salary: 72000, hire_date: '2022-12-01', status: 'inactive' }
    ];

    const insertEmployee = db.prepare(`
      INSERT INTO employees (name, email, phone, department, position, salary, hire_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    employees.forEach(emp => {
      insertEmployee.run(emp.name, emp.email, emp.phone, emp.department, emp.position, emp.salary, emp.hire_date, emp.status);
    });

    // Seed tasks
    const tasks = [
      { title: 'Implement user authentication', description: 'Add JWT-based authentication to the API', status: 'completed', priority: 'high', due_date: '2025-11-20', employee_id: 1 },
      { title: 'Design new dashboard', description: 'Create mockups for the new admin dashboard', status: 'in-progress', priority: 'high', due_date: '2025-11-28', employee_id: 2 },
      { title: 'Database optimization', description: 'Optimize slow queries and add indexes', status: 'pending', priority: 'medium', due_date: '2025-12-05', employee_id: 3 },
      { title: 'Onboard new team members', description: 'Prepare onboarding materials and schedule meetings', status: 'in-progress', priority: 'medium', due_date: '2025-11-30', employee_id: 4 },
      { title: 'Q4 Marketing campaign', description: 'Plan and execute Q4 marketing strategy', status: 'pending', priority: 'high', due_date: '2025-12-15', employee_id: 5 },
      { title: 'Fix responsive issues', description: 'Fix CSS issues on mobile devices', status: 'pending', priority: 'low', due_date: '2025-12-01', employee_id: 6 },
      { title: 'Client presentation', description: 'Prepare slides for client meeting', status: 'completed', priority: 'high', due_date: '2025-11-22', employee_id: 7 },
      { title: 'Budget review', description: 'Review Q4 budget allocations', status: 'pending', priority: 'medium', due_date: '2025-12-10', employee_id: 8 },
      { title: 'API documentation', description: 'Write comprehensive API documentation', status: 'in-progress', priority: 'medium', due_date: '2025-12-03', employee_id: 1 },
      { title: 'Security audit', description: 'Conduct security review of the application', status: 'pending', priority: 'high', due_date: '2025-12-20', employee_id: 3 }
    ];

    const insertTask = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, employee_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    tasks.forEach(task => {
      insertTask.run(task.title, task.description, task.status, task.priority, task.due_date, task.employee_id);
    });

    res.json({ message: 'Sample data seeded successfully', employees: employees.length, tasks: tasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
