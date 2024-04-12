const express = require("express");
const Task = require("../models/taskModel");

const router = express.Router();

//Create task
router.post("/", async (request, response) => {
  const { title, priority } = request.body;
  try {
    const newTask = await Task.create({
      title: title,
      status: "Pending",
      priority: priority ? priority : "Low",
    });
    response
      .status(200)
      .json({ new_task: newTask, message: "Task created successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

//Read tasks
router.get("/", async (request, response) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: "asc" });
    response.status(200).json({
      tasks: tasks,
    });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

//Update task
router.put("/", async (request, response) => {
  const { _id, title, priority, status } = request.body;
  try {
    const existingTask = await Task.findOne({ _id: _id });
    if (existingTask) {
      const query = { _id: _id };
      const updatedTask = await Task.findOneAndUpdate(query, {
        title: title,
        priority: priority,
        status: status === "Done" ? status : "Pending",
      });
      response.status(200).json({
        updated_task: updatedTask,
        message: "Task updated successfully",
      });
    } else {
      response.status(404).json({
        message: "Task not found",
      });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

//Update multiple tasks as done
router.put("/markAll", async (request, response) => {
  const { markedTasks } = request.body;
  try {
    for (const task of markedTasks) {
      await Task.updateOne({ _id: task._id }, { status: "Done" });
    }
    response.status(200).json({ message: "Tasks updated successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

//Delete task
router.delete("/", async (request, response) => {
  const { id } = request.query;
  try {
    const tasksExists = await Task.findOne({ _id: id });
    if (tasksExists) {
      await Task.findOneAndDelete({ _id: id });
      response.status(200).json({ message: "Task deleted successfully" });
    } else {
      response.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

//Delete all tasks
router.delete("/deleteAll", async (request, response) => {
  try {
    await Task.deleteMany({});
    response.status(200).json({ message: "All tasks deleted successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

module.exports = router;
