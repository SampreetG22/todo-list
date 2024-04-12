import React, { useEffect, useState } from "react";
import "./Tasks.css";
import {
  Button,
  Checkbox,
  Tooltip,
  Dialog,
  Snackbar,
  Alert,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Undo from "@mui/icons-material/Undo";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
}

const Tasks: React.FC = () => {
  const [list, setList] = useState<Task[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [markedTasks, setMarkedTasks] = useState<Task[]>([]);
  const [snackBar, setSnackBar] = useState<{
    open: boolean;
    color: string;
    message: string;
  }>({
    open: false,
    color: "",
    message: "",
  });

  const [currentTask, setCurrentTask] = useState<Task>({
    _id: "",
    title: "",
    priority: "",
    status: "",
    createdAt: "",
  });

  useEffect(() => {
    getAllTasks();
  }, []);

  const getAllTasks = () => {
    axios
      .get("http://localhost:8080/api/task")
      .then((response) => {
        setList(response.data.tasks);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const openDialog = (type: string, task?: Task) => {
    if (type === "edit") {
      setDialogType("EDIT");
      if (task) setCurrentTask(task);
    } else {
      setCurrentTask({
        _id: "",
        title: "",
        priority: "",
        status: "",
        createdAt: "",
      });
      setDialogType("CREATE");
    }
    setShowDialog(true);
  };

  const markAsDone = (task: Task, type: string) => {
    axios
      .put("http://localhost:8080/api/task", { ...task, status: type })
      .then(() => {
        getAllTasks();
        setSnackBar({
          open: true,
          color: "success",
          message: task.status !== "Done"?"Task marked as done":"Task reverted to pending",
        });
      })
      .catch((error) => {
        setSnackBar({
          open: true,
          color: "error",
          message: error.message,
        });
      });
  };

  const markSelectedAsDone = () => {
    axios
      .put("http://localhost:8080/api/task/markAll", {
        markedTasks: markedTasks,
      })
      .then(() => {
        getAllTasks();
        setMarkedTasks([]);
        setSnackBar({
          open: true,
          color: "success",
          message: "Tasks marked as done",
        });
      })
      .catch((error) => {
        setSnackBar({
          open: true,
          color: "error",
          message: error.message,
        });
      });
  };

  const handleAddEdit = () => {
    if (dialogType === "CREATE") {
      axios
        .post("http://localhost:8080/api/task", currentTask)
        .then(() => {
          getAllTasks();
          setSnackBar({
            open: true,
            color: "success",
            message: "Task created successfully",
          });
        })
        .catch((error) => {
          setSnackBar({
            open: true,
            color: "error",
            message: error.message,
          });
        });
    } else {
      axios
        .put("http://localhost:8080/api/task", currentTask)
        .then(() => {
          getAllTasks();
          setSnackBar({
            open: true,
            color: "success",
            message: "Task updated successfully",
          });
        })
        .catch((error) => {
          setSnackBar({
            open: true,
            color: "error",
            message: error.message,
          });
        });
    }
    setShowDialog(false);
  };

  const handleDeleteTask = (task: Task) => {
    axios
      .delete(`http://localhost:8080/api/task?id=${task._id}`)
      .then(() => {
        getAllTasks();
        setSnackBar({
          open: true,
          color: "error",
          message: "Task deleted successfully",
        });
      })
      .catch((error) => {
        setSnackBar({
          open: true,
          color: "error",
          message: error.message,
        });
      });
  };

  const clearList = () => {
    axios
      .delete("http://localhost:8080/api/task/deleteAll")
      .then(() => {
        getAllTasks();
        setSnackBar({
          open: true,
          color: "error",
          message: "All tasks deleted successfully",
        });
      })
      .catch((error) => {
        setSnackBar({
          open: true,
          color: "error",
          message: error.message,
        });
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="mainContainer">
        <h1 className="mainHeading">
          TODO LIST{" "}
          <img
            src="https://static-00.iconduck.com/assets.00/todo-icon-2048x2048-m7wp6prw.png"
            alt="logo"
            className="todoImage"
          />
        </h1>
        <div className="todoListContainer">
          <div className="headersContainer">
            <h3
              className="header"
              style={{ paddingLeft: "4%", width: "43.6%" }}
            >
              TITLE
            </h3>
            <h3 className="status">PRIORITY</h3>
            <h3 className="status">STATUS</h3>
            <h3 className="status">CREATED ON</h3>
            <h3 className="options">OPTIONS</h3>
          </div>
          <div className="tasksContainer">
            {list.length > 0 ? (
              list.map((each, i) => {
                return (
                  <div
                    key={i}
                    className={`headersContainer ${
                      each.status === "Done" && "taskDoneContainer"
                    }`}
                  >
                    {each.status === "Done" ? (
                      <p className="header doneTask">
                        <Checkbox
                          size="small"
                          className="checkbox"
                          checked
                          disabled
                        />
                        {each.title}
                      </p>
                    ) : (
                      <p className="header">
                        <Checkbox
                          size="small"
                          className="checkbox"
                          checked={markedTasks.includes(each)}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setMarkedTasks([...markedTasks, each]);
                            } else {
                              setMarkedTasks(
                                markedTasks.filter(
                                  (task) => task._id !== each._id
                                )
                              );
                            }
                          }}
                        />
                        {each.title}
                      </p>
                    )}
                    <p className={`status ${each.priority}`}>{each.priority}</p>
                    <p className="status">{each.status}</p>
                    <p className="status">{formatDate(each.createdAt)}</p>
                    <div className="optionsContainer">
                      {each.status !== "Done" ? (
                        <Tooltip title="Make as done" placement="top" arrow>
                          <DoneIcon
                            color="success"
                            className="icons"
                            onClick={() => markAsDone(each, "Done")}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Undo" placement="top" arrow>
                          <Undo
                            className="icons"
                            onClick={() => markAsDone(each, "Undo")}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title="Edit" placement="top" arrow>
                        <ModeEditIcon
                          color="primary"
                          className="icons"
                          onClick={() => openDialog("edit", each)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete" placement="top" arrow>
                        <DeleteForeverIcon
                          color="error"
                          className="icons"
                          onClick={() => handleDeleteTask(each)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            ) : (
              <img
                src="https://static.vecteezy.com/system/resources/previews/014/814/192/non_2x/creatively-designed-flat-conceptual-icon-of-no-task-vector.jpg"
                alt="noTasks"
                className="noTaskImage"
              />
            )}
          </div>
          <div className="buttonsContainer">
            {list.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  className="buttons"
                  disabled={markedTasks.length === 0}
                  onClick={markSelectedAsDone}
                >
                  Mark as done
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className="buttons"
                  onClick={clearList}
                >
                  Clear List
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              className="buttons"
              onClick={() => openDialog("add")}
            >
              Add task
            </Button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackBar.open}
        autoHideDuration={4000}
        onClose={() => setSnackBar({ ...snackBar, open: false })}
      >
        <Alert
          onClose={() => setSnackBar({ ...snackBar, open: false })}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={showDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: "30vw",
            padding: "1vw 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        <div className="headerAndClose">
          <h2 className="dialogHeader">{dialogType} TASK</h2>
          <HighlightOffIcon className="closeIcon" onClick={closeDialog} />
        </div>
        <div className="dialogContent">
          <label className="label" htmlFor="title">
            Title:
          </label>
          <input
            id="title"
            value={currentTask.title}
            className="dialogInputs"
            onChange={(event) =>
              setCurrentTask({ ...currentTask, title: event.target.value })
            }
          />
          <label
            className="label"
            htmlFor="priority"
            style={{ marginTop: "1vw" }}
          >
            Priority:
          </label>
          <select
            name="priority"
            id="priority"
            className="dialogInputs"
            value={currentTask.priority}
            required
            onChange={(event) =>
              setCurrentTask({ ...currentTask, priority: event.target.value })
            }
          >
            <option value="" defaultValue="true">
              Priority
            </option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <Button
          variant="contained"
          className="finalButtons"
          onClick={handleAddEdit}
          style={{ marginTop: "1vw" }}
        >
          Save
        </Button>
      </Dialog>
    </>
  );
};

export default Tasks;
