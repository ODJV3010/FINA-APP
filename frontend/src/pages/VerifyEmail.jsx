import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}/`);

        setMessage(response.data.message);

        setStatus("success");
      } catch (error) {
        console.error(error);

        setMessage(
          error.response?.data?.error || "No fue posible verificar el correo.",
        );

        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage("El enlace de verificación no es válido.");

      setStatus("error");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          {status === "loading" && (
            <>
              <span className="loading loading-spinner loading-lg mx-auto"></span>

              <h2 className="text-2xl font-bold mt-4">Verificando correo</h2>

              <p className="text-base-content/60">
                Estamos verificando tu cuenta...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-6xl">✓</div>

              <h2 className="text-2xl font-bold mt-4">Correo verificado</h2>

              <p className="text-base-content/70 mt-2">{message}</p>

              <button
                className="btn btn-primary mt-6"
                onClick={() => navigate("/login")}
              >
                Ir al inicio de sesión
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-6xl">!</div>

              <h2 className="text-2xl font-bold mt-4">No se pudo verificar</h2>

              <p className="text-error mt-2">{message}</p>

              <button
                className="btn btn-primary mt-6"
                onClick={() => navigate("/login")}
              >
                Ir al inicio de sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
