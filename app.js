// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const tasksFilePath = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to read tasks from the JSON file
function readTasksFile() {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks file:', error.message);
    return [];
  }
}

// Helper function to write tasks to the JSON file
function writeTasksFile(tasks) {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks file:', error.message);
  }
}

// Get tasks from the JSON file and store them in-memory
let tasks = readTasksFile();

// Routes
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = { id: Date.now().toString(), title, completed: false };
  tasks.push(newTask);
  writeTasksFile(tasks); // Update the tasks in the JSON file
  res.status(201).json(newTask);
});

app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const taskToUpdate = tasks.find(task => task.id === id);
  if (!taskToUpdate) {
    return res.status(404).json({ error: 'Task not found' });
  }

  taskToUpdate.completed = completed;
  writeTasksFile(tasks); // Update the tasks in the JSON file
  res.json(taskToUpdate);
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id !== id);
  writeTasksFile(tasks); // Update the tasks in the JSON file
  res.sendStatus(204);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
