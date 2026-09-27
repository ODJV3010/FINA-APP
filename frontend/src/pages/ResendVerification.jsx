import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/resend-verification/", {
        email: email.trim(),
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error(error);

      setError("No fue posible procesar la solicitud. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center">
            Reenviar verificación
          </h1>

          <p className="text-center text-base-content/60 mt-2">
            Ingresa tu correo electrónico para recibir nuevamente el enlace de
            verificación.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Correo electrónico</span>
              </label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {message && (
              <div className="alert alert-success mt-4">
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enviando...
                </>
              ) : (
                "Reenviar correo"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="link link-primary">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResendVerification;
