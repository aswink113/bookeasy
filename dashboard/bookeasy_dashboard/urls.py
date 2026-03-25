from django.contrib import admin
from django.urls import path
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.dashboard, name='dashboard'),
    path('merchants/', views.merchant_list, name='merchants'),
    path('users/', views.user_list, name='users'),
    path('bookings/', views.booking_list, name='bookings'),
    path('revenue/', views.revenue_list, name='revenue'),
    path('toggle-status/<uuid:user_id>/', views.toggle_user_status, name='toggle_status'),
    path('merchants/<uuid:pk>/', views.merchant_detail, name='merchant_detail'),
    path('users/<uuid:pk>/', views.user_detail, name='user_detail'),
]
