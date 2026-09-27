from openai import OpenAI
from django.conf import settings
import json


def generate_financial_analysis(financial_data):

    client = OpenAI(
        api_key=settings.OPENAI_API_KEY
    )

    prompt = f"""
Eres un asistente de finanzas personales.

Analiza los datos financieros proporcionados.

IMPORTANTE:

- Responde en español.
- No inventes datos.
- Utiliza únicamente los datos proporcionados.
- No modifiques los valores financieros.
- No recomiendes inversiones específicas.
- No menciones productos financieros.
- Las recomendaciones deben ser prácticas y fáciles de entender.

Datos financieros:

{json.dumps(
    financial_data,
    ensure_ascii=False,
    indent=2
)}

Genera:

1. Un resumen general de la situación financiera.
2. Tres recomendaciones concretas.
3. Las principales alertas financieras que encuentres.
4. Un consejo específico para mejorar el ahorro.

Devuelve únicamente un objeto JSON con esta estructura:

{{
    "summary": "Resumen de la situación financiera",
    "recommendations": [
        "Recomendación 1",
        "Recomendación 2",
        "Recomendación 3"
    ],
    "alerts": [
        "Alerta 1"
    ],
    "saving_advice": "Consejo relacionado con el ahorro"
}}
"""

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )

    text = response.output_text

    try:

        return json.loads(text)

    except json.JSONDecodeError:

        return {
            "summary": text,
            "recommendations": [],
            "alerts": [],
            "saving_advice": ""
        }