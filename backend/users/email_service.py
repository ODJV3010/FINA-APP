import resend

from django.conf import settings


def send_verification_email(
    email,
    username,
    verification_token
):

    resend.api_key = settings.RESEND_API_KEY

    verification_url = (
        f"{settings.FRONTEND_URL}/verify-email/"
        f"{verification_token}"
    )

    params = {
        "from": "FINANZAS <onboarding@resend.dev>",

        "to": [email],

        "subject": "Verifica tu cuenta de FINANZAS",

        "html": f"""
        <html>
            <body>

                <h2>Bienvenido a FINANZAS</h2>

                <p>
                    Hola <strong>{username}</strong>,
                </p>

                <p>
                    Para activar tu cuenta,
                    verifica tu correo electrónico.
                </p>

                <p>
                    <a
                        href="{verification_url}"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#2563eb;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Verificar mi correo
                    </a>
                </p>

                <p>
                    Si tú no realizaste este registro,
                    puedes ignorar este mensaje.
                </p>

            </body>
        </html>
        """
    }

    return resend.Emails.send(params)