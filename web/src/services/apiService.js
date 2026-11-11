const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const apiService = {
  /**
   * Send Email Change OTP to new email address
   */
  async sendEmailChangeOTP(newEmail) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/auth/send-email-change-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ new_email: newEmail.trim().toLowerCase() }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send OTP to new email');
    }
    return data;
  },

  /**
   * Update Profile (Name, and/or Email with OTP)
   */
  async updateProfile({ name, newEmail, emailOtp }) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...(name ? { name: name.trim() } : {}),
        ...(newEmail ? { new_email: newEmail.trim().toLowerCase() } : {}),
        ...(emailOtp ? { email_otp: emailOtp.trim() } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to update profile');
    }

    // Update locally stored user data
    const existing = this.getUser();
    const updated = { ...existing, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Send Email OTP
   */
  async sendOTP(email) {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to send verification email');
    }
    return data;
  },

  /**
   * Verify Email OTP
   */
  async verifyOTP(email, otp) {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid verification OTP');
    }
    return data;
  },

  /**
   * User Signup
   */
  async signup({ name, email, password, role, otp, shopName, address, serviceType, basePrice }) {
    const payload = {
      name,
      email,
      password,
      role,
      otp,
      ...(role === 'merchant'
        ? {
            shop_name: shopName,
            address,
            service_type: serviceType,
            base_price: basePrice ? parseFloat(basePrice) : 0.0,
          }
        : {}),
    };

    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Signup failed');
    }
    return data;
  },

  /**
   * User Login (OAuth2 form-encoded)
   */
  async login(email, password) {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    if (data.user) {
      localStorage.setItem('user_role', data.user.role || '');
      localStorage.setItem('user_id', data.user.id || '');
      localStorage.setItem('user_name', data.user.name || '');
    }
    return data;
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get logged in user info
   */
  getUser() {
    return {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('user_role'),
      id: localStorage.getItem('user_id'),
      name: localStorage.getItem('user_name'),
    };
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
  },

  /**
   * Fetch nearby merchants
   */
  async getMerchants() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/merchants/discovery`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to load merchants');
    }
    return await res.json();
  },

  /**
   * Create a new booking
   */
  async createBooking(merchantId, bookingDate) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Please log in or sign up first to book an appointment.');
    }

    const res = await fetch(`${BASE_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        booking_date: bookingDate || new Date().toISOString(),
      }),
    });

    if (res.status === 401) {
      this.logout();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create booking');
    }
    return await res.json();
  },

  /**
   * Get current customer's bookings
   */
  async getCustomerBookings() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/bookings/customer`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch customer bookings');
    }
    return await res.json();
  },

  /**
   * Cancel a customer booking
   */
  async cancelBooking(bookingId) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to cancel booking');
    }
    return await res.json();
  },

  /**
   * Fetch booked / locked slots for a given merchant and date (YYYY-MM-DD)
   */
  async getBookedSlots(merchantId, dateStr) {
    const res = await fetch(`${BASE_URL}/bookings/booked-slots?merchant_id=${merchantId}&date_str=${dateStr}`);
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({ booked_slots: [] }));
    return data.booked_slots || [];
  },

  /**
   * Get merchant's bookings (Partner Portal)
   */
  async getMerchantBookings() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/bookings/merchant`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch merchant bookings');
    }
    return await res.json();
  },

  /**
   * Update booking status (accept, decline, cancel) by merchant
   */
  async updateBookingStatus(bookingId, newStatus) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update booking status');
    }
    return await res.json();
  },

  /**
   * Fetch Bokivo Direct UPI Plan Info
   */
  async getUPIPlanInfo() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/payments/upi-info`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch subscription info');
    }
    return await res.json();
  },

  /**
   * Get Merchant Subscription Status
   */
  async getSubscriptionStatus() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/payments/status`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch subscription status');
    }
    return await res.json();
  },

  /**
   * Update Merchant Cover Photo
   */
  async updateMerchantPhoto(imageUrl) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/merchants/photo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to update merchant cover photo');
    }
    return data;
  },

  /**
   * Submit 12-digit UPI UTR for Subscription or 14-day Free Trial Activation
   */
  async submitSubscriptionUTR(utrNumber, planCycle, amount, merchantUpiId) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/payments/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        utr_number: utrNumber,
        plan_cycle: planCycle,
        amount: amount,
        ...(merchantUpiId ? { merchant_upi_id: merchantUpiId } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to verify UPI payment UTR');
    }
    return data;
  },
};

