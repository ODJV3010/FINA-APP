from rest_framework import serializers

from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_name',
            'amount',
            'month',
            'year',
            'created_at'
        ]

    def validate(self, data):

        request = self.context.get('request')

        category = data.get('category')
        amount = data.get('amount')
        month = data.get('month')
        year = data.get('year')

        if category:

            if request and category.user is not None and category.user != request.user:

                raise serializers.ValidationError({
                    'category':
                        'La categoría no pertenece a tu usuario.'
                })

            if category.type != 'EXPENSE':

                raise serializers.ValidationError({
                    'category':
                        'Un presupuesto solamente puede utilizar categorías de gastos.'
                })

        if amount is not None and amount <= 0:

            raise serializers.ValidationError({
                'amount':
                    'El presupuesto debe ser mayor que cero.'
            })

        if month is not None:

            if month < 1 or month > 12:

                raise serializers.ValidationError({
                    'month':
                        'El mes debe estar entre 1 y 12.'
                })

        if year is not None:

            if year < 2000 or year > 2100:

                raise serializers.ValidationError({
                    'year':
                        'El año no es válido.'
                })

        return data

    def create(self, validated_data):

        validated_data['user'] = self.context[
            'request'
        ].user

        return super().create(
            validated_data
        )