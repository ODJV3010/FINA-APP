import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaExchangeAlt,
  FaBullseye,
  FaChartPie,
  FaRobot,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Movimientos",
      path: "/transactions",
      icon: <FaExchangeAlt />,
    },
    {
      name: "Metas",
      path: "/goals",
      icon: <FaBullseye />,
    },
    {
      name: "Presupuestos",
      path: "/budgets",
      icon: <FaChartPie />,
    },
    {
      name: "Análisis IA",
      path: "/analysis",
      icon: <FaRobot />,
    },
    {
      name: "Perfil",
      path: "/profile",
      icon: <FaUser />,
    },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}

      <div className="navbar bg-base-100 shadow-sm px-4 lg:px-6">
        <div className="flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xl font-bold"
          >
            Finanzas
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-semibold">{user}</p>

            <p className="text-xs text-base-content/60">Mi cuenta</p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline btn-error btn-sm"
          >
            <FaSignOutAlt />
            Salir
          </button>
        </div>
      </div>

      <div className="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content">
          {/* Botón móvil */}

          <div className="p-4 lg:hidden">
            <label
              htmlFor="main-drawer"
              className="btn btn-primary drawer-button"
            >
              Menú
            </label>
          </div>

          {/* Contenido de cada página */}

          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>

        {/* Sidebar */}

        <div className="drawer-side z-40">
          <label
            htmlFor="main-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          />

          <aside className="bg-base-100 min-h-full w-64">
            <div className="p-6">
              <h2 className="text-2xl font-bold">Finanzas</h2>

              <p className="text-sm text-base-content/60">Control financiero</p>
            </div>

            <ul className="menu px-4 gap-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? "active font-semibold" : ""
                    }
                  >
                    {item.icon}

                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Layout;
