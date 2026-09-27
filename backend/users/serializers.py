from django.contrib.auth.models import User
from rest_framework import serializers

from .models import EmailVerification
from .email_service import send_verification_email


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password'
        ]

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                'Ya existe una cuenta con este correo electrónico.'
            )

        return value
    
    def validate_username(self, value):

        value = value.strip()

        if User.objects.filter(
            username__iexact=value
        ).exists():

            raise serializers.ValidationError(
            'Este nombre de usuario ya está registrado.'
            )

        return value

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # El usuario no podrá iniciar sesión
        # hasta verificar su correo.
        user.is_active = False
        user.save()

        verification = EmailVerification.objects.create(
            user=user
        )

        send_verification_email(
            email=user.email,
            username=user.username,
            verification_token=verification.token
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'date_joined'
        ]