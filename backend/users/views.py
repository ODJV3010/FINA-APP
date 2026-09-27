from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

from .serializers import (
    RegisterSerializer,
    ProfileSerializer
)

from .models import EmailVerification

from .email_service import send_verification_email


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]


class VerifyEmailView(APIView):

    permission_classes = [
        AllowAny
    ]

    def get(self, request, token):

        try:

            verification = EmailVerification.objects.get(
                token=token
            )

        except EmailVerification.DoesNotExist:

            return Response(
                {
                    'error':
                        'El enlace de verificación no es válido.'
                },
                status=400
            )

        if verification.verified:

            return Response(
                {
                    'message':
                        'Este correo ya fue verificado.'
                }
            )

        user = verification.user

        user.is_active = True
        user.save()

        verification.verified = True
        verification.save()

        return Response(
            {
                'message':
                    'Correo electrónico verificado correctamente.'
            }
        )
class ResendVerificationView(APIView):

    permission_classes = [
        AllowAny
    ]

    def post(self, request):

        email = request.data.get('email', '').strip().lower()

        generic_message = (
            'Si existe una cuenta con este correo '
            'y necesita verificación, recibirás '
            'un nuevo mensaje.'
        )

        if not email:
            return Response({
                'message': generic_message
            })

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response({
                'message': generic_message
            })

        # Si la cuenta ya está activa,
        # no necesitamos enviar otro correo.
        if user.is_active:

            return Response({
                'message': generic_message
            })

        verification = user.email_verification

        # Generar un nuevo token
        verification.token = uuid.uuid4()

        verification.verified = False

        verification.save()

        send_verification_email(
            email=user.email,
            username=user.username,
            verification_token=verification.token
        )

        return Response({
            'message': generic_message
        })

class ProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        serializer = ProfileSerializer(
            request.user
        )

        return Response(
            serializer.data
        )
