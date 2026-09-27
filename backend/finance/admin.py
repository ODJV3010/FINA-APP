from django.contrib import admin

from .models import Category, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'type',
        'user',
        'created_at'
    )

    list_filter = (
        'type',
    )

    search_fields = (
        'name',
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'description',
        'amount',
        'type',
        'category',
        'date',
        'user'
    )

    list_filter = (
        'type',
        'date'
    )

    search_fields = (
        'description',
    )
