from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user__isnull=True
        )

    def perform_create(self, serializer):
        serializer.save(user=None)

    def update(self, request, *args, **kwargs):
        return Response(
            {
                'detail':
                    'Las categorías generales no se pueden modificar.'
            },
            status=403
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                'detail':
                    'Las categorías generales no se pueden eliminar.'
            },
            status=403
        )


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        transactions = Transaction.objects.filter(
            user=request.user
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
                float(balance) / float(income)
            ) * 100
        else:
            saving_rate = 0

        top_category = (
            transactions
            .filter(type='EXPENSE')
            .values('category__name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
            .first()
        )

        if top_category:
            top_category_name = top_category['category__name']
        else:
            top_category_name = None

        total_transactions = transactions.count()

        return Response({
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'saving_rate': round(saving_rate, 2),
            'top_category': top_category_name,
            'total_transactions': total_transactions
        })


class CategoryExpensesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = (
            Transaction.objects
            .filter(
                user=request.user,
                type='EXPENSE'
            )
            .values('category__name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        result = []

        for item in data:
            result.append({
                'category': item['category__name'],
                'total': item['total']
            })

        return Response(result)


class MonthlySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = (
            Transaction.objects
            .filter(user=request.user)
            .annotate(month=TruncMonth('date'))
            .values('month', 'type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )

        months = {}

        for item in data:

            month = item['month'].strftime('%Y-%m')

            if month not in months:
                months[month] = {
                    'month': month,
                    'income': 0,
                    'expenses': 0
                }

            if item['type'] == 'INCOME':
                months[month]['income'] = item['total']
            else:
                months[month]['expenses'] = item['total']

        return Response(list(months.values()))