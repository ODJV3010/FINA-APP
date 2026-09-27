from django.db.models import Sum

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Budget
from .serializers import BudgetSerializer


class BudgetViewSet(viewsets.ModelViewSet):

    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Budget.objects.filter(
            user=self.request.user
        )


class BudgetAnalysisView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        budgets = Budget.objects.filter(
            user=request.user
        ).select_related('category')

        result = []

        for budget in budgets:

            spent = budget.category.transactions.filter(
                user=request.user,
                type='EXPENSE',
                date__month=budget.month,
                date__year=budget.year
            ).aggregate(
                total=Sum('amount')
            )['total'] or 0

            budget_amount = float(
                budget.amount
            )

            spent_amount = float(
                spent
            )

            available = (
                budget_amount -
                spent_amount
            )

            if budget_amount > 0:

                percentage = (
                    spent_amount /
                    budget_amount
                ) * 100

            else:

                percentage = 0


            result.append({

                'id': budget.id,

                'category': budget.category.name,

                'category_id': budget.category.id,

                'amount': budget_amount,

                'spent': spent_amount,

                'available': available,

                'percentage': round(
                    percentage,
                    2
                ),

                'month': budget.month,

                'year': budget.year

            })


        return Response(result)
        