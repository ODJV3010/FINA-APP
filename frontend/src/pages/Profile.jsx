import { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaExchangeAlt,
  FaSignOutAlt,
} from "react-icons/fa";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [profileResponse, dashboardResponse] = await Promise.all([
          api.get("/auth/profile/"),

          api.get("/dashboard/"),
        ]);

        setProfile(profileResponse.data);

        setDashboard(dashboardResponse.data);
      } catch (error) {
        console.error("Error cargando información del perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}

      <div>
        <h1 className="text-3xl font-bold">Mi perfil</h1>

        <p className="text-base-content/60 mt-1">
          Información de tu cuenta y resumen financiero
        </p>
      </div>

      {/* Información del usuario */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FaUser className="text-primary text-2xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {profile?.username || user || "Usuario"}
              </h2>

              <p className="text-base-content/60">Usuario de Finanzas</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-base-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-primary" />

                <div>
                  <p className="text-sm text-base-content/60">
                    Nombre de usuario
                  </p>

                  <p className="font-semibold">
                    {profile?.username || user || "No disponible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-base-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-primary" />

                <div>
                  <p className="text-sm text-base-content/60">
                    Correo electrónico
                  </p>

                  <p className="font-semibold">
                    {profile?.email || "No registrado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-primary" />

          <div>
            <p className="text-sm text-base-content/60">Fecha de registro</p>

            <p className="font-semibold">
              {profile?.date_joined
                ? new Date(profile.date_joined).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen financiero */}

      <div>
        <h2 className="text-xl font-bold mb-4">Resumen financiero</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Ingresos */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-sm text-base-content/60">
                Ingresos registrados
              </p>

              <p className="text-2xl font-bold text-success">
                {formatMoney(dashboard?.income)}
              </p>
            </div>
          </div>

          {/* Gastos */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Gastos registrados</p>

              <p className="text-2xl font-bold text-error">
                {formatMoney(dashboard?.expenses)}
              </p>
            </div>
          </div>

          {/* Balance */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Balance</p>

              <p className="text-2xl font-bold">
                {formatMoney(dashboard?.balance)}
              </p>
            </div>
          </div>

          {/* Movimientos */}

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Movimientos</p>

              <p className="text-2xl font-bold">
                {dashboard?.total_transactions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FaExchangeAlt className="text-primary text-xl" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Información de la cuenta</h2>

              <p className="text-sm text-base-content/60">
                Estadísticas generales de tu actividad financiera
              </p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/60">
                Categoría con mayor gasto
              </p>

              <p className="font-bold text-lg mt-1">
                {dashboard?.top_category || "Sin información"}
              </p>
            </div>

            <div>
              <p className="text-sm text-base-content/60">Tasa de ahorro</p>

              <p className="font-bold text-lg mt-1">
                {Number(dashboard?.saving_rate || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cerrar sesión */}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="text-lg font-bold">Sesión</h2>

          <p className="text-sm text-base-content/60 mb-4">
            Puedes cerrar tu sesión actual desde aquí.
          </p>

          <button
            className="btn btn-error btn-outline w-fit"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
