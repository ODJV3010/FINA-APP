import { useEffect, useState } from "react";
import api from "../services/api";

import { formatNumberWithThousands, cleanNumber } from "../utils/formatMoney";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
} from "react-icons/fa";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [filterType, setFilterType] = useState("ALL");

  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    type: "EXPENSE",
    category: "",
  });

  // ==============================
  // CARGAR DATOS
  // ==============================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionsResponse, categoriesResponse] = await Promise.all([
        api.get("/transactions/"),

        api.get("/categories/"),
      ]);

      setTransactions(transactionsResponse.data);

      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error(error);

      setError("No fue posible cargar los movimientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==============================
  // CAMBIAR FORMULARIO
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setForm((prev) => ({
        ...prev,
        amount: formatNumberWithThousands(value),
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // ABRIR FORMULARIO NUEVO
  // ==============================

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      description: "",
      amount: "",
      date: "",
      type: "EXPENSE",
      category: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==============================
  // ABRIR EDICIÓN
  // ==============================

  const openEditModal = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      description: transaction.description,
      amount: formatNumberWithThousands(Number(transaction.amount)),
      date: transaction.date,
      type: transaction.type,
      category: transaction.category || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==============================
  // GUARDAR
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = {
        description: form.description,
        amount: cleanNumber(form.amount),
        date: form.date,
        type: form.type,
        category: form.category || null,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}/`, data);

        setSuccess("Movimiento actualizado correctamente.");
      } else {
        await api.post("/transactions/", data);

        setSuccess("Movimiento creado correctamente.");
      }

      await loadData();

      setShowModal(false);
    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        const data = error.response.data;

        if (data.description) {
          setError(data.description[0]);
        } else if (data.amount) {
          setError(data.amount[0]);
        } else if (data.date) {
          setError(data.date[0]);
        } else if (data.category) {
          setError(data.category[0]);
        } else {
          setError("No fue posible guardar el movimiento.");
        }
      } else {
        setError("No fue posible conectar con el servidor.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // ELIMINAR
  // ==============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este movimiento?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/transactions/${id}/`);

      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id),
      );

      setSuccess("Movimiento eliminado correctamente.");
    } catch (error) {
      console.error(error);

      setError("No fue posible eliminar el movimiento.");
    }
  };

  // ==============================
  // FILTRAR
  // ==============================

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "ALL") {
      return true;
    }

    return transaction.type === filterType;
  });

  // ==============================
  // FORMATO DINERO
  // ==============================

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  // ==============================
  // FORMATO FECHA
  // ==============================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("es-CO").format(
      new Date(`${date}T00:00:00`),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Movimientos</h1>

          <p className="text-base-content/60 mt-1">
            Administra tus ingresos y gastos
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus />
          Nuevo movimiento
        </button>
      </div>

      {/* MENSAJES */}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>

          <button onClick={() => setSuccess("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* FILTROS */}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="font-semibold">Filtrar:</span>

            <select
              className="select select-bordered"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos</option>

              <option value="INCOME">Ingresos</option>

              <option value="EXPENSE">Gastos</option>
            </select>

            <span className="text-sm text-base-content/60">
              {filteredTransactions.length} movimiento(s)
            </span>
          </div>
        </div>
      </div>

      {/* TABLA */}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>

                  <th>Tipo</th>

                  <th>Categoría</th>

                  <th>Fecha</th>

                  <th className="text-right">Valor</th>

                  <th className="text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="font-semibold">
                          {transaction.description}
                        </div>
                      </td>

                      <td>
                        {transaction.type === "INCOME" ? (
                          <div className="badge badge-success gap-1">
                            <FaArrowUp />
                            Ingreso
                          </div>
                        ) : (
                          <div className="badge badge-error gap-1">
                            <FaArrowDown />
                            Gasto
                          </div>
                        )}
                      </td>

                      <td>
                        {categories.find(
                          (category) => category.id === transaction.category,
                        )?.name || "Sin categoría"}
                      </td>

                      <td>{formatDate(transaction.date)}</td>

                      <td className="text-right font-semibold">
                        <span
                          className={
                            transaction.type === "INCOME"
                              ? "text-success"
                              : "text-error"
                          }
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}

                          {formatMoney(transaction.amount)}
                        </span>
                      </td>

                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => openEditModal(transaction)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => handleDelete(transaction.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <p className="text-base-content/60">
                        No hay movimientos registrados.
                      </p>

                      <button
                        className="btn btn-primary btn-sm mt-4"
                        onClick={openCreateModal}
                      >
                        <FaPlus />
                        Registrar movimiento
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>

            <h3 className="font-bold text-xl mb-5">
              {editingId ? "Editar movimiento" : "Nuevo movimiento"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DESCRIPCIÓN */}

              <div>
                <label className="label">
                  <span className="label-text">Descripción</span>
                </label>

                <input
                  type="text"
                  name="description"
                  className="input input-bordered w-full"
                  placeholder="Ej: Compra de mercado"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* VALOR */}

              <div>
                <label className="label">
                  <span className="label-text">Valor</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  name="amount"
                  className="input input-bordered w-full"
                  placeholder="Ej: 50.000"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* TIPO */}

              <div>
                <label className="label">
                  <span className="label-text">Tipo</span>
                </label>

                <select
                  name="type"
                  className="select select-bordered w-full"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="EXPENSE">Gasto</option>

                  <option value="INCOME">Ingreso</option>
                </select>
              </div>

              {/* CATEGORÍA */}

              <div>
                <label className="label">
                  <span className="label-text">Categoría</span>
                </label>

                <select
                  name="category"
                  className="select select-bordered w-full"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Sin categoría</option>

                  {categories
                    .filter((category) => category.type === form.type)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* FECHA */}

              <div>
                <label className="label">
                  <span className="label-text">Fecha</span>
                </label>

                <input
                  type="date"
                  name="date"
                  className="input input-bordered w-full"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {/* BOTONES */}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar"
                      : "Guardar"}
                </button>
              </div>
            </form>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default Transactions;
