from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    TransactionViewSet,
    DashboardView,
    CategoryExpensesView,
    MonthlySummaryView
)


router = DefaultRouter()

router.register(
    r'categories',
    CategoryViewSet,
    basename='category'
)

router.register(
    r'transactions',
    TransactionViewSet,
    basename='transaction'
)


urlpatterns = [
    path(
        'dashboard/',
        DashboardView.as_view(),
        name='dashboard'
    ),

    path(
        'dashboard/categories/',
        CategoryExpensesView.as_view(),
        name='dashboard-categories'
    ),

    path(
        'dashboard/monthly/',
        MonthlySummaryView.as_view(),
        name='dashboard-monthly'
    ),
]

urlpatterns += router.urls