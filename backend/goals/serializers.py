from rest_framework import serializers

from .models import Goal


class GoalSerializer(serializers.ModelSerializer):

    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal

        fields = [
            'id',
            'name',
            'target_amount',
            'current_amount',
            'deadline',
            'progress',
            'created_at'
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'El nombre de la meta no puede estar vacío.'
            )

        return value

    def validate_target_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                'El monto objetivo debe ser mayor que cero.'
            )

        return value

    def validate_current_amount(self, value):

        if value < 0:
            raise serializers.ValidationError(
                'El monto actual no puede ser negativo.'
            )

        return value
    
    
    
    def validate_deadline(self, value):

        from django.utils import timezone

        if value < timezone.localdate():

            raise serializers.ValidationError(
            'La fecha límite no puede estar en el pasado.'
            )

        return value
    

    def validate(self, data):

        target_amount = data.get(
            'target_amount',
            getattr(self.instance, 'target_amount', None)
        )

        current_amount = data.get(
            'current_amount',
            getattr(self.instance, 'current_amount', None)
        )

        if (
            target_amount is not None
            and current_amount is not None
            and current_amount > target_amount
        ):

            raise serializers.ValidationError({
                'current_amount':
                    'El monto actual no puede superar el monto objetivo.'
            })

        return data

    def get_progress(self, obj):

        if obj.target_amount == 0:
            return 0

        progress = (
            float(obj.current_amount)
            / float(obj.target_amount)
        ) * 100

        return round(
            min(progress, 100),
            2
        )

    def create(self, validated_data):

        validated_data['user'] = self.context[
            'request'
        ].user

        return super().create(
            validated_data
        )