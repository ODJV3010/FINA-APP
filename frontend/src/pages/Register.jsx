import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserPlus } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");

      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");

      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);

      navigate("/login");
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;

        if (data.username) {
          setError(data.username[0]);
        } else if (data.email) {
          setError(data.email[0]);
        } else if (data.password) {
          setError(data.password[0]);
        } else {
          setError("No fue posible crear la cuenta.");
        }
      } else {
        setError("No fue posible conectar con el servidor.");
      }
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
                <FaUserPlus size={28} />
              </div>
            </div>

            <h1 className="text-3xl font-bold">Crear cuenta</h1>

            <p className="text-base-content/60 mt-2">
              Comienza a organizar tus finanzas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Usuario</span>
              </label>

              <input
                type="text"
                placeholder="Ej: oscar123"
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Correo electrónico</span>
              </label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>

              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Confirmar contraseña</span>
              </label>

              <input
                type="password"
                placeholder="Repite tu contraseña"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="divider">O</div>

          <p className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
