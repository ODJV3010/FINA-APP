import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBullseye,
  FaCalendarAlt,
} from "react-icons/fa";

import api from "../services/api";

import { formatNumberWithThousands, cleanNumber } from "../utils/formatMoney";

function Goals() {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
  });

  // ==========================================
  // CARGAR METAS
  // ==========================================

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/goals/");

      setGoals(response.data);
    } catch (err) {
      console.error(err);

      setError("No fue posible cargar las metas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // ==========================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "target_amount" || name === "current_amount") {
      setForm({
        ...form,
        [name]: formatNumberWithThousands(value),
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  // ==========================================
  // ABRIR MODAL PARA CREAR
  // ==========================================

  const openCreateModal = () => {
    setEditingGoal(null);

    setForm({
      name: "",
      target_amount: "",
      current_amount: "",
      deadline: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // ABRIR MODAL PARA EDITAR
  // ==========================================

  const openEditModal = (goal) => {
    setEditingGoal(goal);

    setForm({
      name: goal.name,
      target_amount: formatNumberWithThousands(Number(goal.target_amount)),
      current_amount: formatNumberWithThousands(Number(goal.current_amount)),
      deadline: goal.deadline,
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

    setEditingGoal(null);
  };

  // ==========================================
  // GUARDAR META
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const target = Number(cleanNumber(form.target_amount));

    const current = Number(cleanNumber(form.current_amount));

    // Validaciones

    if (!form.name.trim()) {
      setError("Debes ingresar un nombre para la meta.");

      return;
    }

    if (target <= 0) {
      setError("El monto objetivo debe ser mayor que 0.");

      return;
    }

    if (current < 0) {
      setError("El monto actual no puede ser negativo.");

      return;
    }

    if (current > target) {
      setError("El monto actual no puede ser mayor que el objetivo.");

      return;
    }

    try {
      const data = {
        name: form.name,
        target_amount: target,
        current_amount: current,
        deadline: form.deadline,
      };

      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}/`, data);

        setSuccess("Meta actualizada correctamente.");
      } else {
        await api.post("/goals/", data);

        setSuccess("Meta creada correctamente.");
      }

      await loadGoals();

      closeModal();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("No fue posible guardar la meta.");
      }
    }
  };

  // ==========================================
  // ELIMINAR META
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta meta?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/goals/${id}/`);

      setGoals(goals.filter((goal) => goal.id !== id));

      setSuccess("Meta eliminada correctamente.");
    } catch (err) {
      console.error(err);

      setError("No fue posible eliminar la meta.");
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
  // CALCULAR DÍAS RESTANTES
  // ==========================================

  const getDaysRemaining = (deadline) => {
    const today = new Date();

    const end = new Date(`${deadline}T23:59:59`);

    const difference = end.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 md:p-6">
      {/* ======================================
          ENCABEZADO
      ======================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Metas de ahorro</h1>

          <p className="text-base-content/60 mt-1">
            Define objetivos y controla tu progreso financiero.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <FaPlus />
          Nueva meta
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
      ) : goals.length === 0 ? (
        /* ====================================
           SIN METAS
        ===================================== */

        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-12">
            <FaBullseye className="text-5xl opacity-40 mb-3" />

            <h2 className="card-title">No tienes metas todavía</h2>

            <p className="text-base-content/60">
              Crea tu primera meta de ahorro para comenzar.
            </p>

            <button className="btn btn-primary mt-3" onClick={openCreateModal}>
              <FaPlus />
              Crear primera meta
            </button>
          </div>
        </div>
      ) : (
        /* ====================================
           LISTA DE METAS
        ===================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const progress = Number(goal.progress || 0);

            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <div key={goal.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  {/* Nombre */}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <FaBullseye className="text-primary text-xl" />
                      </div>

                      <div>
                        <h2 className="font-bold text-lg">{goal.name}</h2>

                        <p className="text-sm text-base-content/60">
                          Meta de ahorro
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}

                    <div className="flex gap-1">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEditModal(goal)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(goal.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Dinero */}

                  <div className="mt-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-base-content/60">
                        Ahorrado
                      </span>

                      <span className="font-bold">
                        {formatMoney(goal.current_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-base-content/60">
                        Objetivo
                      </span>

                      <span className="font-semibold">
                        {formatMoney(goal.target_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso</span>

                      <span className="font-bold">{progress}%</span>
                    </div>

                    <progress
                      className="progress progress-primary w-full"
                      value={progress}
                      max="100"
                    />
                  </div>

                  {/* Fecha */}

                  <div className="flex items-center gap-2 mt-5 text-sm">
                    <FaCalendarAlt />

                    <span>Fecha límite: {goal.deadline}</span>
                  </div>

                  {/* Días restantes */}

                  <div className="mt-2">
                    {progress >= 100 ? (
                      <div className="badge badge-success">Meta alcanzada</div>
                    ) : daysRemaining < 0 ? (
                      <div className="badge badge-error">Fecha vencida</div>
                    ) : (
                      <div className="badge badge-info">
                        {daysRemaining === 1
                          ? "1 día restante"
                          : `${daysRemaining} días restantes`}
                      </div>
                    )}
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
              {editingGoal ? "Editar meta" : "Nueva meta"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}

              <div>
                <label className="label">
                  <span className="label-text">Nombre de la meta</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Comprar computador"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Objetivo */}

              <div>
                <label className="label">
                  <span className="label-text">Monto objetivo</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  name="target_amount"
                  value={form.target_amount}
                  onChange={handleChange}
                  placeholder="Ej: 5.000.000"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Actual */}

              <div>
                <label className="label">
                  <span className="label-text">Monto ahorrado actualmente</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  name="current_amount"
                  value={form.current_amount}
                  onChange={handleChange}
                  placeholder="Ej: 1.000.000"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Fecha */}

              <div>
                <label className="label">
                  <span className="label-text">Fecha límite</span>
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* Error dentro del formulario */}

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
                  {editingGoal ? "Guardar cambios" : "Crear meta"}
                </button>
              </div>
            </form>
          </div>

          {/* Cerrar haciendo clic fuera */}

          <form method="dialog" className="modal-backdrop" onClick={closeModal}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default Goals;
