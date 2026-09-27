import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaWallet } from "react-icons/fa";

import api from "../services/api";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);

  const [form, setForm] = useState({
    category: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // ==========================================
  // CARGAR PRESUPUESTOS Y CATEGORÍAS
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetsResponse, categoriesResponse, analysisResponse] =
        await Promise.all([
          api.get("/budgets/"),

          api.get("/categories/"),

          api.get("/budgets/analysis/"),
        ]);

      setBudgets(budgetsResponse.data);

      setCategories(
        categoriesResponse.data.filter(
          (category) => category.type === "EXPENSE",
        ),
      );

      setBudgetAnalysis(analysisResponse.data);
    } catch (err) {
      console.error(err);

      setError("No fue posible cargar los presupuestos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // CAMBIAR FORMULARIO
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // ABRIR MODAL CREAR
  // ==========================================

  const openCreateModal = () => {
    setEditingBudget(null);

    setForm({
      category: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // ABRIR MODAL EDITAR
  // ==========================================

  const openEditModal = (budget) => {
    setEditingBudget(budget);

    setForm({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // CERRAR MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);

    setEditingBudget(null);
  };

  // ==========================================
  // GUARDAR PRESUPUESTO
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const amount = Number(form.amount);
    const month = Number(form.month);
    const year = Number(form.year);

    // Validaciones

    if (!form.category) {
      setError("Debes seleccionar una categoría.");

      return;
    }

    if (amount <= 0) {
      setError("El monto debe ser mayor que 0.");

      return;
    }

    if (month < 1 || month > 12) {
      setError("El mes no es válido.");

      return;
    }

    if (year < 2020) {
      setError("El año no es válido.");

      return;
    }

    try {
      const data = {
        category: Number(form.category),
        amount,
        month,
        year,
      };

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}/`, data);

        setSuccess("Presupuesto actualizado correctamente.");
      } else {
        await api.post("/budgets/", data);

        setSuccess("Presupuesto creado correctamente.");
      }

      await loadData();

      closeModal();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("No fue posible guardar el presupuesto.");
      }
    }
  };

  // ==========================================
  // ELIMINAR
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este presupuesto?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/budgets/${id}/`);

      setBudgets(budgets.filter((budget) => budget.id !== id));

      setSuccess("Presupuesto eliminado correctamente.");
    } catch (err) {
      console.error(err);

      setError("No fue posible eliminar el presupuesto.");
    }
  };

  // ==========================================
  // FORMATEAR DINERO
  // ==========================================

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ==========================================
  // NOMBRE DEL MES
  // ==========================================

  const getMonthName = (month) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return months[month - 1];
  };

  return (
    <div className="p-4 md:p-6">
      {/* ======================================
          ENCABEZADO
      ======================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Presupuestos</h1>

          <p className="text-base-content/60 mt-1">
            Define límites de gasto para tus categorías.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus />
          Nuevo presupuesto
        </button>
      </div>

      {/* ======================================
          MENSAJES
      ======================================= */}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
        </div>
      )}

      {/* ======================================
          CARGANDO
      ======================================= */}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : budgets.length === 0 ? (
        /* ====================================
           SIN PRESUPUESTOS
        ===================================== */

        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-12">
            <FaWallet className="text-5xl opacity-40 mb-3" />

            <h2 className="card-title">No tienes presupuestos</h2>

            <p className="text-base-content/60">
              Crea un presupuesto para controlar tus gastos.
            </p>

            <button className="btn btn-primary mt-3" onClick={openCreateModal}>
              <FaPlus />
              Crear presupuesto
            </button>
          </div>
        </div>
      ) : (
        /* ====================================
           LISTA
        ===================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {budgets.map((budget) => {
            const analysis = budgetAnalysis.find(
              (item) => item.id === budget.id,
            ) || {
              amount: Number(budget.amount),
              spent: 0,
              available: Number(budget.amount),
              percentage: 0,
            };

            return (
              <div key={budget.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  {/* Encabezado */}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <FaWallet className="text-primary text-xl" />
                      </div>

                      <div>
                        <h2 className="font-bold text-lg">
                          {budget.category_name}
                        </h2>

                        <p className="text-sm text-base-content/60">
                          {getMonthName(budget.month)} {budget.year}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}

                    <div className="flex gap-1">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEditModal(budget)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(budget.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Monto */}

                  <div className="mt-5">
                    <p className="text-sm text-base-content/60">
                      Presupuesto mensual
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {formatMoney(budget.amount)}
                    </p>
                  </div>

                  {/* Estado del presupuesto */}

                  <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Gastado</span>

                      <span className="font-semibold">
                        {formatMoney(analysis.spent)}
                      </span>
                    </div>

                    {/* Barra de progreso */}

                    <progress
                      className={`progress w-full ${
                        analysis.percentage >= 100
                          ? "progress-error"
                          : analysis.percentage >= 80
                            ? "progress-warning"
                            : "progress-primary"
                      }`}
                      value={Math.min(analysis.percentage, 100)}
                      max="100"
                    />

                    {/* Información inferior */}

                    <div className="flex justify-between text-xs mt-2">
                      <span>{analysis.percentage}% utilizado</span>

                      <span>
                        {analysis.available >= 0
                          ? `Disponible: ${formatMoney(analysis.available)}`
                          : `Excedido: ${formatMoney(
                              Math.abs(analysis.available),
                            )}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================
          MODAL
      ======================================= */}

      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-5">
              {editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Categoría */}

              <div>
                <label className="label">
                  <span className="label-text">Categoría</span>
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto */}

              <div>
                <label className="label">
                  <span className="label-text">Monto máximo</span>
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Ej: 500000"
                  min="1"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Mes */}

              <div>
                <label className="label">
                  <span className="label-text">Mes</span>
                </label>

                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="1">Enero</option>

                  <option value="2">Febrero</option>

                  <option value="3">Marzo</option>

                  <option value="4">Abril</option>

                  <option value="5">Mayo</option>

                  <option value="6">Junio</option>

                  <option value="7">Julio</option>

                  <option value="8">Agosto</option>

                  <option value="9">Septiembre</option>

                  <option value="10">Octubre</option>

                  <option value="11">Noviembre</option>

                  <option value="12">Diciembre</option>
                </select>
              </div>

              {/* Año */}

              <div>
                <label className="label">
                  <span className="label-text">Año</span>
                </label>

                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  min="2020"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Error */}

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {/* Botones */}

              <div className="modal-action">
                <button type="button" className="btn" onClick={closeModal}>
                  Cancelar
                </button>

                <button type="submit" className="btn btn-primary">
                  {editingBudget ? "Guardar cambios" : "Crear presupuesto"}
                </button>
              </div>
            </form>
          </div>

          <form method="dialog" className="modal-backdrop" onClick={closeModal}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default Budgets;
