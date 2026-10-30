import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, ChevronDown, Menu, X } from "lucide-react";
import { api } from "./services/api";
import type {
  DashboardSummary,
  Transaction,
  TransactionCreate,
} from "./types/transaction";
import { Transactions } from "./pages/Transactions";
import { Sidebar, type NavigationItem } from "./components/Sidebar";
import { TransactionModal } from "./components/TransactionModal";
import type { TransactionFilter } from "./components/TransactionsPanel";
import { Overview } from "./pages/Overview";

import { Analytics } from "./pages/Analytics";
import { Categories } from "./pages/Categories";
import { Settings } from "./pages/Settings";
import {
  buildCategoryData,
  buildMonthlyData,
  buildTopMerchants,
  getCurrentMonthExpenses,
} from "./utils/analytics";
import "./index.css";

function App() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeNav, setActiveNav] = useState<NavigationItem>("Overview");
  const [search, setSearch] = useState("");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [summaryData, transactionData] = await Promise.all([
        api.getSummary("JPY"),
        api.getTransactions(),
      ]);

      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Zero Vault API.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => buildCategoryData(transactions), [transactions]);
  const merchantData = useMemo(() => buildTopMerchants(transactions), [transactions]);
  const currentMonthExpenses = useMemo(
    () => getCurrentMonthExpenses(transactions),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase().trim();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        [transaction.merchant, transaction.category, transaction.payment_method].some(
          (value) => value?.toLowerCase().includes(query),
        );

      const matchesType =
        transactionFilter === "all" ||
        transaction.transaction_type === transactionFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, transactionFilter]);

  async function handleCreateTransaction(payload: TransactionCreate) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.createTransaction(payload);
      setModalOpen(false);
      setSuccess("Transaction added successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save this transaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  function navigate(item: NavigationItem) {
    setActiveNav(item);
    setMobileMenuOpen(false);

    if (item === "Transactions") {
      window.setTimeout(() => {
        document
          .getElementById("transactions-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  const refresh = () => void loadDashboard();
  const openModal = () => setModalOpen(true);

  return (
    <div className="app-shell">
      <Sidebar
        activeNav={activeNav}
        transactionCount={transactions.length}
        open={mobileMenuOpen}
        onNavigate={navigate}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-current">{activeNav}</span>
          </div>

          <div className="topbar-actions">
            <div className="currency-pill">
              <span className="currency-dot" />
              <span>JPY</span>
              <ChevronDown size={14} />
            </div>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} strokeWidth={1.8} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-divider" />

            <div className="date-display">
              <CalendarDays size={16} />
              <span>
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date())}
              </span>
            </div>
          </div>
        </header>

        <div className="page-container">
          {error && (
            <div className="alert alert-error">
              <div>
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
              <button
                className="icon-button"
                aria-label="Dismiss message"
                onClick={() => setSuccess("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {activeNav === "Overview" && (
            <Overview
              summary={summary}
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              monthlyData={monthlyData}
              categoryData={categoryData}
              currentMonthExpenses={currentMonthExpenses}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              filter={transactionFilter}
              onFilterChange={setTransactionFilter}
              onRefresh={refresh}
              onAddTransaction={openModal}
              onViewAll={() => navigate("Transactions")}
            />
          )}

          {activeNav === "Transactions" && (
            <Transactions
            summary={summary}
            transactions={transactions}
            filteredTransactions={filteredTransactions}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            filter={transactionFilter}
            onFilterChange={setTransactionFilter}
           onRefresh={refresh}
           onAddTransaction={openModal}
          />
         )}
         
          {activeNav === "Analytics" && (
            <Analytics
              summary={summary}
              transactions={transactions}
              monthlyData={monthlyData}
              categoryData={categoryData}
              merchantData={merchantData}
              loading={loading}
              onRefresh={refresh}
            />
          )}

          {activeNav === "Categories" && (
            <Categories
              summary={summary}
              transactions={transactions}
              categoryData={categoryData}
              loading={loading}
              onRefresh={refresh}
            />
          )}

          {activeNav === "Settings" && (
            <Settings onBack={() => navigate("Overview")} />
          )}
        </div>
      </main>

      {modalOpen && (
        <TransactionModal
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateTransaction}
        />
      )}
    </div>
  );
}

export default App;
