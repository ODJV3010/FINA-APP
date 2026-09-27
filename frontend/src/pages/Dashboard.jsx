import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaPiggyBank,
  FaExchangeAlt,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [categories, setCategories] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const expensePercentage =
    dashboard?.income > 0
      ? (Number(dashboard.expenses) / Number(dashboard.income)) * 100
      : 0;

  const availableMoney =
    Number(dashboard?.income || 0) - Number(dashboard?.expenses || 0);

  const savingRate = Number(dashboard?.saving_rate || 0);

  const financialStatus =
    availableMoney > 0
      ? "Saldo positivo"
      : availableMoney < 0
        ? "Saldo negativo"
        : "Saldo equilibrado";

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        categoriesResponse,
        monthlyResponse,
        goalsResponse,
        transactionsResponse,
      ] = await Promise.all([
        api.get("/dashboard/"),

        api.get("/dashboard/categories/"),

        api.get("/dashboard/monthly/"),

        api.get("/goals/"),

        api.get("/transactions/"),
      ]);

      setDashboard(dashboardResponse.data);

      setCategories(categoriesResponse.data);

      setMonthly(monthlyResponse.data);

      setGoals(goalsResponse.data);

      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error(error);

      setError("No fue posible cargar la información financiera.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-base-content/60 mt-1">
          Resumen general de tus finanzas
        </p>
      </div>

      {/* Tarjetas */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {/* Ingresos */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/60">Ingresos</p>

                <h2 className="text-2xl font-bold mt-1">
                  {formatMoney(dashboard.income)}
                </h2>
              </div>

              <div className="bg-success/20 text-success p-3 rounded-full">
                <FaArrowUp size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Gastos */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/60">Gastos</p>

                <h2 className="text-2xl font-bold mt-1">
                  {formatMoney(dashboard.expenses)}
                </h2>
              </div>

              <div className="bg-error/20 text-error p-3 rounded-full">
                <FaArrowDown size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Saldo */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/60">Saldo</p>

                <h2 className="text-2xl font-bold mt-1">
                  {formatMoney(dashboard.balance)}
                </h2>
              </div>

              <div className="bg-info/20 text-info p-3 rounded-full">
                <FaWallet size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">
                  Dinero disponible
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  {formatMoney(availableMoney)}
                </h2>
              </div>

              <div className="p-3 rounded-xl bg-primary/10">
                <FaWallet className="text-primary text-xl" />
              </div>
            </div>

            <p className="text-xs text-base-content/60 mt-2">
              Ingresos menos gastos
            </p>
          </div>
        </div>

        {/* Ahorro */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-base-content/60">Tasa de ahorro</p>

                <h2 className="text-2xl font-bold mt-1">
                  {dashboard.saving_rate}%
                </h2>
              </div>

              <div className="bg-warning/20 text-warning p-3 rounded-full">
                <FaPiggyBank size={20} />
              </div>
            </div>
            {/* 👇 AQUÍ empieza el bloque nuevo */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Capacidad de ahorro</span>

                <span className="font-semibold">{savingRate.toFixed(2)}%</span>
              </div>

              <progress
                className="progress progress-success w-full"
                value={Math.max(0, Math.min(savingRate, 100))}
                max="100"
              />
            </div>
            {/* 👆 AQUÍ termina el bloque nuevo */}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md mt-6">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FaChartLine className="text-primary text-xl" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Estado financiero</h2>

              <p className="text-sm text-base-content/60">
                Resumen de tu situación actual
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-200 rounded-xl p-4">
              <p className="text-sm text-base-content/60">Estado</p>

              <p className="text-xl font-bold mt-1">{financialStatus}</p>
            </div>

            <div className="bg-base-200 rounded-xl p-4">
              <p className="text-sm text-base-content/60">
                Gastos sobre ingresos
              </p>

              <p className="text-xl font-bold mt-1">
                {expensePercentage.toFixed(2)}%
              </p>
            </div>

            <div className="bg-base-200 rounded-xl p-4">
              <p className="text-sm text-base-content/60">Tasa de ahorro</p>

              <p className="text-xl font-bold mt-1">{savingRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {expensePercentage > 100 && (
        <div className="alert alert-error mt-6 shadow-md">
          <FaExclamationTriangle />

          <div>
            <h3 className="font-bold">Atención con tus gastos</h3>

            <p className="text-sm">
              Tus gastos superan el total de tus ingresos registrados.
            </p>
          </div>
        </div>
      )}

      {/* Información adicional */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <FaExchangeAlt className="text-primary" />

              <div>
                <p className="text-sm text-base-content/60">
                  Movimientos registrados
                </p>

                <p className="text-xl font-bold">
                  {dashboard.total_transactions}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div>
              <p className="text-sm text-base-content/60">
                Categoría con mayor gasto
              </p>

              <p className="text-xl font-bold mt-1">
                {dashboard.top_category || "Sin datos"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica mensual */}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Ingresos vs. gastos</h2>

          <p className="text-sm text-base-content/60">
            Comportamiento financiero por mes
          </p>

          <div className="w-full h-80 mt-4">
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip formatter={(value) => formatMoney(value)} />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Ingresos"
                    fill="var(--color-success)"
                  />

                  <Bar
                    dataKey="expenses"
                    name="Gastos"
                    fill="var(--color-error)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-base-content/60">
                  Todavía no hay movimientos suficientes para mostrar la
                  gráfica.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categorías + Metas */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gastos por categoría */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Gastos por categoría</h2>

            <p className="text-sm text-base-content/60">
              Distribución de tus gastos
            </p>

            <div className="w-full h-80">
              {categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value) => formatMoney(value)} />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-base-content/60">
                    No hay gastos registrados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metas */}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="card-title">Metas de ahorro</h2>

                <p className="text-sm text-base-content/60">
                  Progreso de tus objetivos
                </p>
              </div>
            </div>

            <div className="space-y-5 mt-4">
              {goals.length > 0 ? (
                goals.slice(0, 5).map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{goal.name}</span>

                      <span className="text-sm">{goal.progress}%</span>
                    </div>

                    <progress
                      className="progress progress-primary w-full"
                      value={goal.progress}
                      max="100"
                    />

                    <div className="flex justify-between mt-1 text-xs text-base-content/60">
                      <span>{formatMoney(goal.current_amount)}</span>

                      <span>{formatMoney(goal.target_amount)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <FaPiggyBank
                    className="mx-auto text-base-content/30"
                    size={40}
                  />

                  <p className="mt-3 text-base-content/60">
                    Todavía no tienes metas de ahorro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md mt-6">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FaExchangeAlt className="text-primary text-xl" />
              </div>

              <div>
                <h2 className="text-lg font-bold">Últimos movimientos</h2>

                <p className="text-sm text-base-content/60">
                  Tus movimientos financieros más recientes
                </p>
              </div>
            </div>

            <Link to="/transactions" className="btn btn-sm btn-ghost">
              Ver todos
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            {latestTransactions.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <FaExchangeAlt className="mx-auto text-3xl mb-3" />

                <p>Todavía no tienes movimientos registrados.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th className="text-right">Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {latestTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              transaction.type === "INCOME"
                                ? "bg-success/10"
                                : "bg-error/10"
                            }`}
                          >
                            {transaction.type === "INCOME" ? (
                              <FaArrowUp className="text-success" />
                            ) : (
                              <FaArrowDown className="text-error" />
                            )}
                          </div>

                          <span className="font-medium">
                            {transaction.description}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            transaction.type === "INCOME"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>

                      <td>{transaction.category_name || "Sin categoría"}</td>

                      <td>{transaction.date}</td>

                      <td
                        className={`text-right font-bold ${
                          transaction.type === "INCOME"
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}

                        {formatMoney(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
