import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaWallet } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(username, password);

      navigate("/dashboard");
    } catch (error) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-primary text-primary-content p-4 rounded-full">
                <FaWallet size={28} />
              </div>
            </div>

            <h1 className="text-3xl font-bold">Finanzas</h1>

            <p className="text-base-content/60 mt-2">
              Gestiona tus finanzas de forma inteligente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Usuario</span>
              </label>

              <input
                type="text"
                placeholder="Ingresa tu usuario"
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="divider">O</div>

          <p className="text-center">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="link link-primary font-semibold">
              Crear cuenta
            </Link>
          </p>

          <p className="text-center mt-3">
            <Link to="/resend-verification" className="link link-primary">
              ¿No recibiste el correo de verificación?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
