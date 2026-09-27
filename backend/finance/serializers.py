from rest_framework import serializers
from .models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'type',
            'created_at'
        ]

    def validate_name(self, value):

        request = self.context.get('request')

        if request:

            exists = Category.objects.filter(
                user=request.user,
                name__iexact=value
            ).exists()

            if exists:
                raise serializers.ValidationError(
                    'Ya tienes una categoría con ese nombre.'
                )

        return value



class TransactionSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id',
            'description',
            'amount',
            'date',
            'type',
            'category',
            'category_name',
            'created_at'
        ]

    def validate(self, data):

        request = self.context.get('request')

        category = data.get('category')
        transaction_type = data.get('type')

        if category:

            if request and category.user is not None and request.user != request.user:
                raise serializers.ValidationError({
                    'category':
                        'La categoría seleccionada no pertenece a tu usuario.'
                })

            if category.type != transaction_type:
                raise serializers.ValidationError({
                    'category':
                        'La categoría no corresponde al tipo de movimiento.'
                })

        return data

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                'El monto debe ser mayor que cero.'
            )

        return value

    def create(self, validated_data):

        validated_data['user'] = self.context[
            'request'
        ].user

        return super().create(
            validated_data
        )