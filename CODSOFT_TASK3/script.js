"use strict";

// ==========================================
// EXPENSEFLOW - PERSONAL FINANCE TRACKER
// ==========================================

// ---------- HTML ELEMENTS ----------

const todayDate = document.getElementById("todayDate");
const currentYear = document.getElementById("currentYear");

const balanceAmount = document.getElementById("balanceAmount");
const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");

const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const descriptionError = document.getElementById("descriptionError");
const amountError = document.getElementById("amountError");
const dateError = document.getElementById("dateError");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");
const formMessage = document.getElementById("formMessage");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const clearFiltersButton = document.getElementById("clearFilters");

const categoryBreakdown = document.getElementById("categoryBreakdown");
const breakdownTotal = document.getElementById("breakdownTotal");

// ---------- STORAGE SETTINGS ----------

const STORAGE_KEY = "expenseFlowTransactions";

let transactions = [];
let editingTransactionId = null;

// ---------- INITIALIZATION ----------

function initializeApp() {
    loadTransactions();
    setCurrentDate();
    setCurrentYear();
    setDefaultTransactionDate();
    renderDashboard();
    renderTransactions();
}

function setCurrentDate() {
    todayDate.textContent = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function setCurrentYear() {
    currentYear.textContent = new Date().getFullYear();
}

function getLocalDateString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setDefaultTransactionDate() {
    if (!dateInput.value) {
        dateInput.value = getLocalDateString();
    }
}

// ---------- LOCAL STORAGE ----------

function loadTransactions() {
    try {
        const savedTransactions = localStorage.getItem(STORAGE_KEY);

        if (!savedTransactions) {
            transactions = [];
            return;
        }

        const parsedTransactions = JSON.parse(savedTransactions);

        if (!Array.isArray(parsedTransactions)) {
            transactions = [];
            return;
        }

        transactions = parsedTransactions.filter((transaction) => {
            return (
                transaction &&
                typeof transaction.id === "string" &&
                typeof transaction.description === "string" &&
                Number.isFinite(Number(transaction.amount)) &&
                Number(transaction.amount) > 0 &&
                ["income", "expense"].includes(transaction.type) &&
                typeof transaction.category === "string" &&
                typeof transaction.date === "string"
            );
        });

    } catch (error) {
        console.error("Unable to load saved transactions:", error);
        transactions = [];
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {
        console.error("Unable to save transactions:", error);

        showMessage(
            "Unable to save data. Check your browser storage.",
            "error"
        );

        return false;
    }
}

// ---------- HELPER FUNCTIONS ----------

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function generateId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function showMessage(message, type = "success") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

function clearErrors() {
    descriptionError.textContent = "";
    amountError.textContent = "";
    dateError.textContent = "";
}

function getTransactionById(id) {
    return transactions.find((transaction) => {
        return transaction.id === id;
    });
}

// ---------- FORM VALIDATION ----------

function validateForm() {
    clearErrors();
    clearMessage();

    let isValid = true;

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (description === "") {
        descriptionError.textContent =
            "Please enter a transaction name.";

        isValid = false;

    } else if (description.length > 80) {
        descriptionError.textContent =
            "Transaction name cannot exceed 80 characters.";

        isValid = false;
    }

    if (amountInput.value.trim() === "") {
        amountError.textContent =
            "Please enter an amount.";

        isValid = false;

    } else if (!Number.isFinite(amount) || amount <= 0) {
        amountError.textContent =
            "Amount must be greater than zero.";

        isValid = false;

    } else if (!Number.isFinite(Math.round(amount * 100) / 100)) {
        amountError.textContent =
            "Please enter a valid amount.";

        isValid = false;
    }

    if (!date) {
        dateError.textContent =
            "Please select a transaction date.";

        isValid = false;

    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateError.textContent =
            "Please select a valid date.";

        isValid = false;
    }

    return isValid;
}

// ---------- ADD / UPDATE TRANSACTION ----------

transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const description = descriptionInput.value.trim();
    const amount = Math.round(Number(amountInput.value) * 100) / 100;
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!["income", "expense"].includes(type)) {
        showMessage("Please select a valid transaction type.", "error");
        return;
    }

    if (!category) {
        showMessage("Please select a category.", "error");
        return;
    }

    if (editingTransactionId !== null) {
        const transaction = getTransactionById(editingTransactionId);

        if (!transaction) {
            showMessage(
                "Transaction not found. Please try again.",
                "error"
            );

            resetForm();
            return;
        }

        const oldTransaction = { ...transaction };

        transaction.description = description;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;
        transaction.date = date;

        if (!saveTransactions()) {
            Object.assign(transaction, oldTransaction);
            return;
        }

        resetForm();
        renderDashboard();
        renderTransactions();

        showMessage("Transaction updated successfully!");

    } else {
        const newTransaction = {
            id: generateId(),
            description,
            amount,
            type,
            category,
            date,
            createdAt: Date.now()
        };

        transactions.push(newTransaction);

        if (!saveTransactions()) {
            transactions = transactions.filter((transaction) => {
                return transaction.id !== newTransaction.id;
            });

            return;
        }

        resetForm();
        renderDashboard();
        renderTransactions();

        showMessage("Transaction added successfully!");
    }
});

// ---------- RESET FORM ----------

function resetForm() {
    transactionForm.reset();

    editingTransactionId = null;

    submitButton.textContent = "+ Add Transaction";
    cancelEditButton.hidden = true;

    clearErrors();
    setDefaultTransactionDate();
}

cancelEditButton.addEventListener("click", () => {
    resetForm();
    clearMessage();
});

// ---------- EDIT TRANSACTION ----------

function editTransaction(id) {
    const transaction = getTransactionById(id);

    if (!transaction) {
        showMessage("Transaction not found.", "error");
        return;
    }

    editingTransactionId = id;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    submitButton.textContent = "Save Changes";
    cancelEditButton.hidden = false;

    clearErrors();
    clearMessage();

    transactionForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    descriptionInput.focus();
}

// ---------- DELETE TRANSACTION ----------

function deleteTransaction(id) {
    const transaction = getTransactionById(id);

    if (!transaction) {
        return;
    }

    const confirmed = window.confirm(
        `Delete "${transaction.description}"?`
    );

    if (!confirmed) {
        return;
    }

    const previousTransactions = [...transactions];

    transactions = transactions.filter((item) => {
        return item.id !== id;
    });

    if (!saveTransactions()) {
        transactions = previousTransactions;
        return;
    }

    if (editingTransactionId === id) {
        resetForm();
    }

    renderDashboard();
    renderTransactions();

    showMessage("Transaction deleted successfully!");
}

// ---------- DASHBOARD SUMMARY ----------

function calculateTotals() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);

        if (transaction.type === "income") {
            totalIncome += amount;
        } else {
            totalExpenses += amount;
        }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;

    return {
        totalIncome,
        totalExpenses,
        balance: Math.round((totalIncome - totalExpenses) * 100) / 100
    };
}

function renderDashboard() {
    const totals = calculateTotals();

    balanceAmount.textContent = formatCurrency(totals.balance);
    incomeAmount.textContent = formatCurrency(totals.totalIncome);
    expenseAmount.textContent = formatCurrency(totals.totalExpenses);

    renderCategoryBreakdown();
}

// ---------- CATEGORY BREAKDOWN ----------

function renderCategoryBreakdown() {
    const expensesByCategory = {};

    transactions.forEach((transaction) => {
        if (transaction.type !== "expense") {
            return;
        }

        const category = transaction.category;

        expensesByCategory[category] =
            (expensesByCategory[category] || 0) +
            Number(transaction.amount);
    });

    const categories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1]);

    const total = categories.reduce((sum, item) => {
        return sum + item[1];
    }, 0);

    breakdownTotal.textContent = formatCurrency(total);

    if (categories.length === 0) {
        categoryBreakdown.innerHTML = `
            <div class="empty-breakdown">
                <span class="empty-icon">◉</span>
                <p>No expenses recorded yet.</p>
                <small>Add an expense to see your breakdown.</small>
            </div>
        `;

        return;
    }

    categoryBreakdown.innerHTML = categories.map(([category, amount]) => {
        const percentage = total > 0
            ? (amount / total) * 100
            : 0;

        return `
            <div class="category-row">
                <div class="category-row-top">
                    <span>${escapeHTML(category)}</span>
                    <span>${formatCurrency(amount)} · ${percentage.toFixed(1)}%</span>
                </div>

                <div
                    class="category-track"
                    role="progressbar"
                    aria-label="${escapeHTML(category)} expenses"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="${percentage.toFixed(1)}"
                >
                    <div
                        class="category-fill"
                        style="width: ${percentage.toFixed(2)}%"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}

// ---------- FILTER TRANSACTIONS ----------

function getFilteredTransactions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    return [...transactions]
        .filter((transaction) => {
            const matchesSearch =
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.category.toLowerCase().includes(searchTerm);

            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;

            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;

            return matchesSearch && matchesType && matchesCategory;
        })
        .sort((a, b) => {
            const dateComparison = b.date.localeCompare(a.date);

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return Number(b.createdAt || 0) - Number(a.createdAt || 0);
        });
}

// ---------- RENDER TRANSACTION HISTORY ----------

function renderTransactions() {
    const filteredTransactions = getFilteredTransactions();

    transactionCount.textContent = filteredTransactions.length;

    transactionList.innerHTML = filteredTransactions.map((transaction) => {
        const isIncome = transaction.type === "income";

        return `
            <tr>
                <td class="transaction-name">
                    ${escapeHTML(transaction.description)}
                </td>

                <td>
                    <span class="transaction-category">
                        ${escapeHTML(transaction.category)}
                    </span>
                </td>

                <td class="transaction-date">
                    ${escapeHTML(formatDate(transaction.date))}
                </td>

                <td>
                    <span class="type-badge ${isIncome ? "income" : "expense"}">
                        ${isIncome ? "Income" : "Expense"}
                    </span>
                </td>

                <td class="${isIncome ? "amount-income" : "amount-expense"}">
                    ${isIncome ? "+" : "−"}${formatCurrency(Number(transaction.amount))}
                </td>

                <td>
                    <div class="action-buttons">
                        <button
                            type="button"
                            class="action-btn"
                            data-action="edit"
                            data-id="${escapeHTML(transaction.id)}"
                            aria-label="Edit ${escapeHTML(transaction.description)}"
                            title="Edit transaction"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="action-btn delete"
                            data-action="delete"
                            data-id="${escapeHTML(transaction.id)}"
                            aria-label="Delete ${escapeHTML(transaction.description)}"
                            title="Delete transaction"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    emptyState.hidden = filteredTransactions.length > 0;

    const emptyHeading = emptyState.querySelector("h3");
    const emptyParagraph = emptyState.querySelector("p");

    if (filteredTransactions.length === 0) {
        if (transactions.length === 0) {
            emptyHeading.textContent = "No transactions yet";
            emptyParagraph.textContent =
                "Add your first income or expense to start tracking your money.";
        } else {
            emptyHeading.textContent = "No matching transactions";
            emptyParagraph.textContent =
                "Try changing your search or filter settings.";
        }
    }
}

// ---------- TABLE ACTIONS ----------

transactionList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        editTransaction(id);
    }

    if (action === "delete") {
        deleteTransaction(id);
    }
});

// ---------- SEARCH AND FILTER EVENTS ----------

searchInput.addEventListener("input", renderTransactions);

typeFilter.addEventListener("change", renderTransactions);

categoryFilter.addEventListener("change", renderTransactions);

clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    typeFilter.value = "all";
    categoryFilter.value = "all";

    renderTransactions();
});

// ---------- CLEAR VALIDATION MESSAGES ----------

descriptionInput.addEventListener("input", () => {
    descriptionError.textContent = "";
});

amountInput.addEventListener("input", () => {
    amountError.textContent = "";
});

dateInput.addEventListener("change", () => {
    dateError.textContent = "";
});

// ---------- START APPLICATION ----------

initializeApp();