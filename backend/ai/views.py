from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from finance.models import Transaction
from goals.models import Goal
from budgets.models import Budget

from .services import generate_financial_analysis


class AIAnalysisView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # ==============================
        # TRANSACCIONES
        # ==============================

        transactions = Transaction.objects.filter(
            user=user
        )

        income = transactions.filter(
            type='INCOME'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0

        expenses = transactions.filter(
            type='EXPENSE'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0

        balance = income - expenses

        if income > 0:

            saving_rate = (
                float(balance) /
                float(income)
            ) * 100

        else:

            saving_rate = 0


        # ==============================
        # GASTOS POR CATEGORÍA
        # ==============================

        category_data = (
            transactions
            .filter(type='EXPENSE')
            .values('category__name')
            .annotate(
                total=Sum('amount')
            )
            .order_by('-total')
        )

        categories = []

        for item in category_data:

            categories.append({

                'category':
                    item['category__name'],

                'total':
                    float(item['total'])

            })


        # ==============================
        # PRESUPUESTOS
        # ==============================

        budgets = Budget.objects.filter(
            user=user
        ).select_related('category')

        budget_data = []

        for budget in budgets:

            spent = budget.category.transactions.filter(
                user=user,
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

            if budget_amount > 0:

                percentage = (
                    spent_amount /
                    budget_amount
                ) * 100

            else:

                percentage = 0


            budget_data.append({

                'category':
                    budget.category.name,

                'budget':
                    budget_amount,

                'spent':
                    spent_amount,

                'percentage':
                    round(
                        percentage,
                        2
                    )

            })


        # ==============================
        # METAS
        # ==============================

        goals = Goal.objects.filter(
            user=user
        )

        goal_data = []

        for goal in goals:

            if goal.target_amount > 0:

                progress = (
                    float(goal.current_amount) /
                    float(goal.target_amount)
                ) * 100

            else:

                progress = 0


            goal_data.append({

                'name':
                    goal.name,

                'target':
                    float(
                        goal.target_amount
                    ),

                'current':
                    float(
                        goal.current_amount
                    ),

                'progress':
                    round(
                        min(progress, 100),
                        2
                    ),

                'deadline':
                    str(
                        goal.deadline
                    )

            })


        # ==============================
        # DATOS PARA LA IA
        # ==============================

        financial_data = {

            'income':
                float(income),

            'expenses':
                float(expenses),

            'balance':
                float(balance),

            'saving_rate':
                round(
                    saving_rate,
                    2
                ),

            'categories':
                categories,

            'budgets':
                budget_data,

            'goals':
                goal_data

        }


        # ==============================
        # LLAMAR A LA IA
        # ==============================

        try:

            analysis = generate_financial_analysis(
                financial_data
            )

            return Response({

                'financial_data':
                    financial_data,

                'analysis':
                    analysis

            })

        except Exception as e:
            import traceback
            traceback.print_exc()

            return Response({

                'error': str(e)

            }, status=500)