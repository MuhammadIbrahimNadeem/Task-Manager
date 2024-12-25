require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    // Create default user if not exists
    createDefaultUser();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Create default user function
async function createDefaultUser() {
    try {
        const existingUser = await User.findOne({ email: 'test@gmail.com' });
        if (!existingUser) {
            await User.create({
                email: 'test@gmail.com',
                password: '12345',
                name: 'Ibrahim'
            });
            console.log('Default user created');
        }
    } catch (error) {
        console.error('Error creating default user:', error);
    }
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/user', (req, res) => {
    res.render('user');
});

app.get('/logout', (req, res) => {
    res.render('logout');
});

// Task Routes
// Create Task
app.post('/create-task', async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // Check if task with same title exists
        const existingTask = await Task.findOne({ 
            username: 'tempUser',
            title: title 
        });

        if (existingTask) {
            return res.status(400).json({ error: 'Task with this title already exists' });
        }

        const task = new Task({
            title,
            description,
            username: 'tempUser'
        });

        await task.save();
        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Get All Tasks
app.get('/get-tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ username: 'tempUser' })
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// Get Single Task
app.get('/get-task/:title', async (req, res) => {
    try {
        const task = await Task.findOne({ 
            username: 'tempUser',
            title: req.params.title 
        });
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(task);
    } catch (error) {
        console.error('Error getting task:', error);
        res.status(500).json({ error: 'Failed to get task' });
    }
});

// Update Task
app.put('/update-task/:oldTitle', async (req, res) => {
    try {
        const { title, description } = req.body;

        // Find the task to update
        const task = await Task.findOne({ 
            username: 'tempUser',
            title: req.params.oldTitle 
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if new title already exists (if title is being changed)
        if (title !== req.params.oldTitle) {
            const existingTask = await Task.findOne({
                username: 'tempUser',
                title: title
            });

            if (existingTask) {
                return res.status(400).json({ error: 'Task with new title already exists' });
            }
        }

        // Update task
        task.title = title;
        task.description = description;
        task.updatedAt = new Date();

        await task.save();
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete Task
app.delete('/delete-task/:title', async (req, res) => {
    try {
        const result = await Task.findOneAndDelete({ 
            username: 'tempUser',
            title: req.params.title 
        });

        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Test route for database connection
app.get('/test-db', async (req, res) => {
    try {
        const count = await Task.countDocuments();
        res.json({ message: 'Database connected', taskCount: count });
    } catch (error) {
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
