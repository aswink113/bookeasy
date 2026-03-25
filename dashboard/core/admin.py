from django.contrib import admin
from .models import User, Merchant, Booking

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role')
    search_fields = ('name', 'email')
    list_filter = ('role',)

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'service_type', 'rating', 'is_subscribed')
    search_fields = ('shop_name', 'service_type')
    list_filter = ('is_subscribed', 'service_type')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'merchant', 'status', 'booking_date')
    list_filter = ('status', 'booking_date')
    search_fields = ('customer__name', 'merchant__shop_name')
