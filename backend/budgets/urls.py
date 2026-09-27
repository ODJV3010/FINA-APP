from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BudgetViewSet,
    BudgetAnalysisView
)


router = DefaultRouter()

router.register(
    r'budgets',
    BudgetViewSet,
    basename='budget'
)


urlpatterns = [

    path(
        'budgets/analysis/',
        BudgetAnalysisView.as_view(),
        name='budget-analysis'
    ),

]

urlpatterns += router.urls

