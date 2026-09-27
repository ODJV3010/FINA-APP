from django.db import models
from django.contrib.auth.models import User
from finance.models import Category


class Budget(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='budgets'
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category.name} - {self.month}/{self.year}"