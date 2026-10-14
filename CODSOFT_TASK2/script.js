const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const inputError = document.getElementById("inputError");
const emptyState = document.getElementById("emptyState");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const taskProgress = document.getElementById("taskProgress");

const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.getElementById("clearCompleted");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("taskflowTasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    try {
        localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
        return true;
    } catch (error) {
        inputError.textContent = "Unable to save tasks in this browser.";
        return false;
    }
}

function addTask(event) {
    event.preventDefault();

    const text = taskInput.value.trim();
    inputError.textContent = "";

    if (!text) {
        inputError.textContent = "Please enter a task.";
        return;
    }

    const task = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        completed: false
    };

    tasks.unshift(task);

    if (!saveTasks()) {
        tasks.shift();
        return;
    }

    taskInput.value = "";
    currentFilter = "all";

    updateFilters();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.completed = !task.completed;

    if (!saveTasks()) {
        task.completed = !task.completed;
        return;
    }

    renderTasks();
}

function deleteTask(id) {
    const index = tasks.findIndex(item => item.id === id);

    if (index === -1) return;

    const deletedTask = tasks.splice(index, 1)[0];

    if (!saveTasks()) {
        tasks.splice(index, 0, deletedTask);
        return;
    }

    renderTasks();
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("button");
        checkbox.type = "button";
        checkbox.className = "task-checkbox";
        checkbox.textContent = task.completed ? "✓" : "";
        checkbox.setAttribute(
            "aria-label",
            task.completed ? "Mark as pending" : "Mark as completed"
        );

        checkbox.addEventListener("click", () => toggleTask(task.id));

        const text = document.createElement("p");
        text.className = "task-text";
        text.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "task-action delete";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => deleteTask(task.id));

        actions.appendChild(deleteButton);
        item.append(checkbox, text, actions);
        taskList.appendChild(item);
    });

    emptyState.classList.toggle("hidden", visibleTasks.length > 0);

    if (tasks.length === 0) {
        emptyState.querySelector("h3").textContent = "No tasks yet";
        emptyState.querySelector("p").textContent =
            "Add your first task above and start organizing your day.";
    } else if (visibleTasks.length === 0) {
        emptyState.querySelector("h3").textContent = "No matching tasks";
        emptyState.querySelector("p").textContent =
            "There are no tasks in this filter.";
    }

    updateCounts();
}

function updateCounts() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    remainingCount.textContent = pending;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    taskProgress.textContent = `${percentage}% completed`;
    clearCompletedButton.disabled = completed === 0;
}

function updateFilters() {
    filterButtons.forEach(button => {
        const active = button.dataset.filter === currentFilter;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateFilters();
        renderTasks();
    });
});

clearCompletedButton.addEventListener("click", () => {
    const previousTasks = tasks;
    tasks = tasks.filter(task => !task.completed);

    if (!saveTasks()) {
        tasks = previousTasks;
        return;
    }

    renderTasks();
});

taskForm.addEventListener("submit", addTask);

updateFilters();
renderTasks();