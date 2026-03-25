from django.shortcuts import render, redirect, get_object_or_404
from .models import User, Merchant, Booking
from django.db.models import Sum, Q
from django.core.paginator import Paginator

def dashboard(request):
    stats = {
        'users': User.objects.count(),
        'merchants': Merchant.objects.count(),
        'bookings': Booking.objects.count(),
        'revenue': Merchant.objects.filter(is_subscribed=True).count() * 999
    }
    
    top_merchants = Merchant.objects.order_by('-rating')[:5]
    recent_bookings = Booking.objects.select_related('customer', 'merchant').order_by('-created_at')[:5]
    
    context = {
        'stats': stats,
        'top_merchants': top_merchants,
        'recent_bookings': recent_bookings,
        'active_page': 'overview'
    }
    return render(request, 'core/dashboard.html', context)

def merchant_list(request):
    search_query = request.GET.get('search', '')
    service_filter = request.GET.get('service_type', '')
    merchants = Merchant.objects.all().order_by('-created_at')
    
    unique_services = Merchant.objects.values_list('service_type', flat=True).distinct()
    
    if search_query:
        merchants = merchants.filter(
            Q(shop_name__icontains=search_query) | 
            Q(service_type__icontains=search_query) |
            Q(user__name__icontains=search_query)
        )
    
    if service_filter:
        merchants = merchants.filter(service_type=service_filter)
    
    paginator = Paginator(merchants, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'merchants': page_obj,
        'search_query': search_query,
        'service_filter': service_filter,
        'unique_services': unique_services,
        'active_page': 'merchants'
    }
    return render(request, 'core/merchant_list.html', context)

def user_list(request):
    search_query = request.GET.get('search', '')
    users = User.objects.all().order_by('-created_at')
    
    if search_query:
        users = users.filter(
            Q(name__icontains=search_query) | 
            Q(email__icontains=search_query)
        )
    
    paginator = Paginator(users, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'users': page_obj,
        'search_query': search_query,
        'active_page': 'users'
    }
    return render(request, 'core/user_list.html', context)

def booking_list(request):
    search_query = request.GET.get('search', '')
    bookings = Booking.objects.select_related('customer', 'merchant').order_by('-created_at')
    
    if search_query:
        bookings = bookings.filter(
            Q(customer__name__icontains=search_query) | 
            Q(merchant__shop_name__icontains=search_query) |
            Q(status__icontains=search_query)
        )
    
    paginator = Paginator(bookings, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'bookings': page_obj,
        'search_query': search_query,
        'active_page': 'bookings'
    }
    return render(request, 'core/booking_list.html', context)

def revenue_list(request):
    search_query = request.GET.get('search', '')
    service_filter = request.GET.get('service_type', '')
    merchants = Merchant.objects.filter(is_subscribed=True).order_by('-subscription_end')
    
    unique_services = Merchant.objects.filter(is_subscribed=True).values_list('service_type', flat=True).distinct()
    
    if search_query:
        merchants = merchants.filter(
            Q(shop_name__icontains=search_query) | 
            Q(service_type__icontains=search_query)
        )
    
    if service_filter:
        merchants = merchants.filter(service_type=service_filter)
    
    total_revenue = merchants.count() * 999
    
    paginator = Paginator(merchants, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'merchants': page_obj,
        'total_revenue': total_revenue,
        'search_query': search_query,
        'service_filter': service_filter,
        'unique_services': unique_services,
        'active_page': 'revenue'
    }
    return render(request, 'core/revenue_list.html', context)

def toggle_user_status(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    
    # Redirect back to the referrer or a default page
    referer = request.META.get('HTTP_REFERER', 'dashboard')
    return redirect(referer)

def merchant_detail(request, pk):
    merchant = get_object_or_404(Merchant, pk=pk)
    recent_bookings = merchant.bookings.all().order_by('-created_at')[:10]
    context = {
        'merchant': merchant,
        'recent_bookings': recent_bookings,
        'active_page': 'merchants'
    }
    return render(request, 'core/merchant_detail.html', context)

def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    # If the user is a merchant, we might want to link to their merchant profile instead or show it here
    merchant_profile = getattr(user, 'merchant', None)
    recent_bookings = user.bookings.all().order_by('-created_at')[:10]
    context = {
        'user': user,
        'merchant_profile': merchant_profile,
        'recent_bookings': recent_bookings,
        'active_page': 'users'
    }
    return render(request, 'core/user_detail.html', context)
