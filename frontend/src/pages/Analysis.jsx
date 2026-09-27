import { useEffect, useState } from "react";
import {
  FaRobot,
  FaChartLine,
  FaLightbulb,
  FaExclamationTriangle,
  FaPiggyBank,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import api from "../services/api";

function formatMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Analysis() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/ai/analysis/");

      setData(response.data);
    } catch (err) {
      console.error(err);

      setError("No fue posible generar el análisis financiero.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>

        <p className="mt-4 text-base-content/60">Analizando tus finanzas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <FaExclamationTriangle />

        <span>{error}</span>

        <button className="btn btn-sm" onClick={loadAnalysis}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const financial = data.financial_data || {};

  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* ENCABEZADO */}
      {/* ========================= */}

      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FaRobot className="text-primary text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Análisis con IA</h1>

            <p className="text-base-content/60">
              Analiza tu comportamiento financiero y recibe recomendaciones
              personalizadas.
            </p>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* RESUMEN FINANCIERO */}
      {/* ========================= */}

      <div>
        <h2 className="text-lg font-bold mb-4">Resumen financiero</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* INGRESOS */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <FaArrowUp className="text-success text-xl" />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">Ingresos</p>

                  <p className="text-xl font-bold">
                    {formatMoney(financial.income)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GASTOS */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-error/10">
                  <FaArrowDown className="text-error text-xl" />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">Gastos</p>

                  <p className="text-xl font-bold">
                    {formatMoney(financial.expenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BALANCE */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-info/10">
                  <FaWallet className="text-info text-xl" />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">Balance</p>

                  <p className="text-xl font-bold">
                    {formatMoney(financial.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AHORRO */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <FaPiggyBank className="text-warning text-xl" />
                </div>

                <div>
                  <p className="text-sm text-base-content/60">Tasa de ahorro</p>

                  <p className="text-xl font-bold">
                    {financial.saving_rate || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* ANÁLISIS DE IA */}
      {/* ========================= */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <FaRobot className="text-primary text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold">Análisis de tu situación</h2>

              <p className="text-sm text-base-content/60">
                Interpretación de tus datos financieros
              </p>
            </div>
          </div>

          {/* RESUMEN */}

          <div className="bg-base-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine className="text-primary" />

              <h3 className="font-bold">Resumen</h3>
            </div>

            <p className="leading-7">
              {data.analysis?.summary || "No hay resumen disponible."}
            </p>
          </div>

          {/* RECOMENDACIONES */}

          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <FaLightbulb className="text-warning" />

              <h3 className="font-bold">Recomendaciones</h3>
            </div>

            <div className="space-y-3">
              {data.analysis?.recommendations?.length > 0 ? (
                data.analysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-xl bg-warning/10"
                  >
                    <div className="font-bold text-warning">{index + 1}</div>

                    <p>{recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-base-content/60">
                  No hay recomendaciones disponibles.
                </p>
              )}
            </div>
          </div>

          {/* ALERTAS */}

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaExclamationTriangle className="text-error" />

              <h3 className="font-bold">Alertas financieras</h3>
            </div>

            {data.analysis?.alerts?.length > 0 ? (
              <div className="space-y-3">
                {data.analysis.alerts.map((alert, index) => (
                  <div key={index} className="alert alert-warning">
                    <FaExclamationTriangle />

                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-success">
                <span>No se detectaron alertas financieras importantes.</span>
              </div>
            )}
          </div>

          {/* CONSEJO DE AHORRO */}

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaPiggyBank className="text-success" />

              <h3 className="font-bold">Consejo de ahorro</h3>
            </div>

            <div className="bg-success/10 rounded-xl p-5">
              <p className="leading-7">
                {data.analysis?.saving_advice ||
                  "No hay consejo de ahorro disponible."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* GASTOS POR CATEGORÍA */}
      {/* ========================= */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <FaChartLine className="text-secondary text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold">Gastos por categoría</h2>

              <p className="text-sm text-base-content/60">
                Distribución de tus gastos registrados
              </p>
            </div>
          </div>

          {financial.categories?.length > 0 ? (
            <div className="space-y-4">
              {financial.categories.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">
                      {item.category || "Sin categoría"}
                    </span>

                    <span className="font-semibold">
                      {formatMoney(item.total)}
                    </span>
                  </div>

                  <progress
                    className="progress progress-primary w-full"
                    value={
                      financial.expenses > 0
                        ? (Number(item.total) / Number(financial.expenses)) *
                          100
                        : 0
                    }
                    max="100"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">
              Todavía no hay gastos registrados.
            </p>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* PRESUPUESTOS */}
      {/* ========================= */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <FaChartLine className="text-warning text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold">Estado de presupuestos</h2>

              <p className="text-sm text-base-content/60">
                Seguimiento del gasto frente al presupuesto
              </p>
            </div>
          </div>

          {financial.budgets?.length > 0 ? (
            <div className="space-y-4">
              {financial.budgets.map((budget) => (
                <div
                  key={budget.category}
                  className="border border-base-300 rounded-xl p-4"
                >
                  <div className="flex justify-between">
                    <span className="font-bold">{budget.category}</span>

                    <span>{budget.percentage}%</span>
                  </div>

                  <div className="flex justify-between text-sm mt-2">
                    <span>Gastado: {formatMoney(budget.spent)}</span>

                    <span>Presupuesto: {formatMoney(budget.budget)}</span>
                  </div>

                  <progress
                    className={`progress w-full mt-3 ${
                      budget.percentage >= 100
                        ? "progress-error"
                        : budget.percentage >= 80
                          ? "progress-warning"
                          : "progress-success"
                    }`}
                    value={Math.min(budget.percentage, 100)}
                    max="100"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">
              No tienes presupuestos registrados.
            </p>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* METAS */}
      {/* ========================= */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-success/10">
              <FaPiggyBank className="text-success text-xl" />
            </div>

            <div>
              <h2 className="text-xl font-bold">Metas de ahorro</h2>

              <p className="text-sm text-base-content/60">
                Estado actual de tus objetivos
              </p>
            </div>
          </div>

          {financial.goals?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financial.goals.map((goal) => (
                <div
                  key={goal.name}
                  className="border border-base-300 rounded-xl p-4"
                >
                  <div className="flex justify-between">
                    <span className="font-bold">{goal.name}</span>

                    <span className="font-semibold">{goal.progress}%</span>
                  </div>

                  <progress
                    className="progress progress-success w-full mt-3"
                    value={goal.progress}
                    max="100"
                  />

                  <div className="flex justify-between text-sm mt-2">
                    <span>{formatMoney(goal.current)}</span>

                    <span>{formatMoney(goal.target)}</span>
                  </div>

                  <p className="text-xs text-base-content/60 mt-2">
                    Fecha límite: {goal.deadline}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/60">
              No tienes metas de ahorro registradas.
            </p>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* ACTUALIZAR */}
      {/* ========================= */}

      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={loadAnalysis}>
          <FaRobot />
          Generar nuevo análisis
        </button>
      </div>
    </div>
  );
}

export default Analysis;
