import assert from 'assert';

const BASE_URL = 'http://localhost:5002';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function record(name, passed, details = '') {
  if (passed) {
    results.passed++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    results.failed++;
    console.error(`  ✗ FAIL: ${name} -> ${details}`);
  }
  results.tests.push({ name, passed, details });
}

async function runTests() {
  console.log('\n========================================');
  console.log('  STARTING COMPREHENSIVE QA AUDIT SUITE ');
  console.log('========================================\n');

  // --- 1. AUTHENTICATION & REGISTRATION ---
  console.log('--- 1. Testing Authentication & Roles ---');
  
  // 1.1 Customer demo login
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer@plantme.in', password: 'plantme123' })
    });
    record('Customer Demo Login', res.ok && res.data.success && res.data.user.role === 'Customer', JSON.stringify(res.data));
  }

  // 1.2 Vendor demo login
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'vendor@plantme.in', password: 'vendor123' })
    });
    record('Vendor Demo Login', res.ok && res.data.success && res.data.user.role === 'Vendor', JSON.stringify(res.data));
  }

  // 1.3 Admin demo login
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@plantme.in', password: 'admin123' })
    });
    record('Admin Demo Login', res.ok && res.data.success && res.data.user.role === 'Admin', JSON.stringify(res.data));
  }

  // 1.4 Rider demo login
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'delivery@plantme.in', password: 'delivery123' })
    });
    record('Rider Demo Login', res.ok && res.data.success && res.data.user.role === 'Delivery Partner', JSON.stringify(res.data));
  }

  // 1.5 Invalid credentials login rejection
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer@plantme.in', password: 'WRONG_PASSWORD' })
    });
    record('Invalid Password Rejection', res.status === 401 && res.data.success === false, `Expected 401, got ${res.status}`);
  }

  // 1.6 Non-existent user login rejection
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent_random_user_99@test.com', password: 'password123' })
    });
    record('Non-Existent User Rejection', res.status === 401 && res.data.success === false, `Expected 401, got ${res.status}`);
  }

  // 1.7 Dynamic Customer Registration
  const testCustomerEmail = `testuser_${Date.now()}@example.com`;
  {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Anita Roy',
        email: testCustomerEmail,
        password: 'Password@123',
        phone: '+91 98765 43210'
      })
    });
    record('Dynamic Customer Registration', res.ok && res.data.success, JSON.stringify(res.data));
  }

  // 1.8 Login with newly registered customer
  {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testCustomerEmail, password: 'Password@123' })
    });
    record('Login with Registered Customer', res.ok && res.data.success && res.data.user.email.toLowerCase() === testCustomerEmail.toLowerCase(), JSON.stringify(res.data));
  }

  // 1.9 Duplicate registration rejection
  {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Anita Duplicate',
        email: testCustomerEmail,
        password: 'Password@123',
        phone: '+91 98765 43210'
      })
    });
    record('Duplicate Registration Rejection', res.status === 409 || (res.status === 400 && res.data.success === false), `Expected 400/409 duplicate rejection, got ${res.status}`);
  }

  // --- 2. CATALOG & DISCOVERY ---
  console.log('\n--- 2. Testing Catalog & Discovery ---');
  let productsList = [];
  {
    const res = await request('/api/products');
    productsList = res.data || [];
    record('Fetch Products Catalog', res.ok && Array.isArray(productsList) && productsList.length > 0, `Count: ${productsList.length}`);
  }

  {
    const res = await request('/api/products?category=Indoor Plants');
    record('Filter Products by Category', res.ok && Array.isArray(res.data) && res.data.every(p => p.category.toLowerCase() === 'indoor plants'), `Count: ${res.data?.length}`);
  }

  {
    const res = await request('/api/vendors');
    record('Public Vendors List Blocked (403 Forbidden)', res.status === 403, `Status: ${res.status}`);
  }

  {
    const res = await request('/api/vendors', {
      headers: { 'x-user-role': 'Admin', 'x-admin-email': 'admin@plantme.in' }
    });
    record('Authorized Admin Vendors List (200 OK)', res.ok && Array.isArray(res.data) && res.data.length > 0, `Count: ${res.data?.length}`);
  }

  {
    const res = await request('/api/stories');
    record('Fetch Nursery Stories', res.ok && (Array.isArray(res.data) || Array.isArray(res.data.stories)), JSON.stringify(res.data));
  }

  // --- 3. CART, PRICING & INVENTORY INTEGRITY ---
  console.log('\n--- 3. Testing Cart, Pricing & Stock Validation ---');
  
  // 3.1 Price manipulation check: attempt to order item with manipulated price
  const sampleProduct = productsList.find(p => p.quantity > 0) || productsList[0];
  {
    const res = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: sampleProduct.id, name: sampleProduct.name, price: sampleProduct.price, quantity: 1 }],
        total: 1, // Malicious tampered total
        paymentMethod: 'wallet',
        vendorId: sampleProduct.vendorId || 'v1'
      })
    });
    record('Reject Price Tampering / Underpayment', !res.ok || (res.data && res.data.success === false), `Server accepted total: 1 when real price is ${sampleProduct.price}`);
  }

  // 3.2 Out of stock rejection
  {
    const res = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: sampleProduct.id, name: sampleProduct.name, price: sampleProduct.price, quantity: 999999 }],
        total: sampleProduct.price * 999999 + 60,
        paymentMethod: 'cod',
        vendorId: sampleProduct.vendorId || 'v1'
      })
    });
    record('Reject Exceeding Stock Quantity', !res.ok || (res.data && res.data.success === false), `Server allowed ordering 999999 items of ${sampleProduct.name}`);
  }

  // --- 4. END-TO-END ORDER LIFECYCLE & DUAL-PIN HANDSHAKE ---
  console.log('\n--- 4. Testing End-to-End Order Lifecycle & Handshake ---');

  let testOrder = null;
  const initialStock = sampleProduct.quantity;

  // 4.1 Place Valid Order
  {
    const calculatedTotal = sampleProduct.price * 1 + 60; // price + delivery fee
    const res = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: sampleProduct.id, name: sampleProduct.name, price: sampleProduct.price, quantity: 1 }],
        total: calculatedTotal,
        paymentMethod: 'cod',
        vendorId: sampleProduct.vendorId || 'v1',
        recipientName: 'Anita Roy',
        phone: '+91 98765 43210',
        address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru'
      })
    });
    if (res.ok && res.data.success && res.data.order) {
      testOrder = res.data.order;
      record('Place Valid Order', true, `Order ID: ${testOrder.id}, Status: ${testOrder.status}`);
    } else {
      record('Place Valid Order', false, JSON.stringify(res.data));
    }
  }

  if (testOrder) {
    // 4.2 Stock Deduction Check
    {
      const res = await request(`/api/products/${sampleProduct.id}`);
      const updatedProduct = res.data;
      record('Inventory Stock Decremented', updatedProduct && updatedProduct.quantity === initialStock - 1, `Expected ${initialStock - 1}, got ${updatedProduct?.quantity}`);
    }

    // 4.3 Vendor Accepts Order -> Status 'Preparing'
    {
      const res = await request(`/api/vendor/orders/${testOrder.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ vendorId: testOrder.vendorId })
      });
      record('Vendor Accepts Order -> Preparing', res.ok && res.data.success && res.data.order.status === 'Preparing', JSON.stringify(res.data));
    }

    // 4.4 Vendor Marks Order Ready -> Status 'Ready for Pickup'
    {
      const res = await request(`/api/vendor/orders/${testOrder.id}/ready`, {
        method: 'POST',
        body: JSON.stringify({ vendorId: testOrder.vendorId })
      });
      record('Vendor Marks Ready -> Ready for Pickup', res.ok && res.data.success && res.data.order.status === 'Ready for Pickup', JSON.stringify(res.data));
    }

    // 4.5 Rider Accepts Order
    let riderAssignedPin = null;
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ riderId: 'r_101' })
      });
      riderAssignedPin = res.data?.pickupPin;
      record('Rider Accepts Trip', res.ok && res.data.success && res.data.pickupPin, `Pickup PIN returned: ${res.data?.pickupPin}`);
    }

    // 4.6 Race condition / Double Rider Accept Rejection (Scenario B)
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ riderId: 'r_999_competing_rider' })
      });
      record('Reject Competing Rider Double-Accept', !res.ok || (res.data && res.data.success === false), `Competing rider was able to hijack trip: ${JSON.stringify(res.data)}`);
    }

    // 4.7 Negative Scenario E: Rider attempts delivery BEFORE pickup verification
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/verify-delivery`, {
        method: 'POST',
        body: JSON.stringify({ riderId: 'r_101', deliveryOtp: testOrder.deliveryOtp })
      });
      record('Reject Delivery Attempt Before Pickup', !res.ok || (res.data && res.data.success === false), `Rider delivered before pickup: ${JSON.stringify(res.data)}`);
    }

    // 4.8 Negative Scenario C: Wrong Pickup PIN
    {
      const res = await request(`/api/vendor/orders/${testOrder.id}/verify-pickup`, {
        method: 'POST',
        body: JSON.stringify({ pickupPin: '0000_WRONG' })
      });
      record('Reject Wrong Pickup PIN', !res.ok || (res.data && res.data.success === false), `Nursery accepted wrong PIN: ${JSON.stringify(res.data)}`);
    }

    // 4.9 Correct Pickup PIN Handshake -> Status 'Picked Up'
    {
      const res = await request(`/api/vendor/orders/${testOrder.id}/verify-pickup`, {
        method: 'POST',
        body: JSON.stringify({ pickupPin: riderAssignedPin })
      });
      record('Verify Correct Pickup PIN -> Picked Up', res.ok && res.data.success && res.data.order.status === 'Picked Up', JSON.stringify(res.data));
    }

    // 4.10 GPS Telemetry update during transit
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/location`, {
        method: 'POST',
        body: JSON.stringify({ lat: 12.9750, lng: 77.6410, heading: 90 })
      });
      record('Rider Broadcasts GPS Location', res.ok && res.data.success, JSON.stringify(res.data));
    }

    // 4.11 Negative Scenario D: Wrong Delivery OTP
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/verify-delivery`, {
        method: 'POST',
        body: JSON.stringify({ riderId: 'r_101', deliveryOtp: '9999_WRONG' })
      });
      record('Reject Wrong Delivery OTP', !res.ok || (res.data && res.data.success === false), `Rider delivered with wrong OTP: ${JSON.stringify(res.data)}`);
    }

    // 4.12 Correct Delivery OTP Handshake -> Status 'Delivered'
    {
      const res = await request(`/api/rider/orders/${testOrder.id}/verify-delivery`, {
        method: 'POST',
        body: JSON.stringify({ riderId: 'r_101', deliveryOtp: testOrder.deliveryOtp })
      });
      record('Verify Correct Doorstep OTP -> Delivered', res.ok && res.data.success && res.data.order.status === 'Delivered', JSON.stringify(res.data));
    }

    // 4.13 State Machine Invariant: Delivered order cannot be modified to Placed or Cancelled
    {
      const res = await request(`/api/orders/${testOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Placed' })
      });
      record('Delivered Order Cannot Revert to Placed', !res.ok || (res.data && res.data.status === 'Delivered'), `Order status changed to: ${res.data?.status}`);
    }

    // 4.14 Security: Sensitive PIN/OTP Data Leakage Check
    {
      const res = await request(`/api/orders/${testOrder.id}/live-tracking`);
      record('Customer Tracking Hides Pickup PIN', res.ok && (!res.data.pickupPin || res.data.pickupPin === undefined), `Customer was exposed to rider pickup PIN: ${res.data?.pickupPin}`);
    }
  }

  // --- 5. AI PLANT DOCTOR & CONCIERGE ---
  console.log('\n--- 5. Testing AI Plant Doctor ML & Concierge ---');
  {
    const res = await request('/api/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify({
        plantType: 'Monstera Deliciosa',
        symptoms: 'Yellow leaves with brown mushy roots and damp soil'
      })
    });
    record('AI Doctor Diagnosis Inference', res.ok && res.data.issue && res.data.confidence && Array.isArray(res.data.remedy), JSON.stringify(res.data));
  }

  {
    const res = await request('/api/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message: 'How do I care for my fiddle leaf fig?' })
    });
    record('Customer Concierge AI Chatbot', res.ok && res.data.reply, JSON.stringify(res.data));
  }

  // --- 6. PAYMENTS & GUARANTEE ---
  console.log('\n--- 6. Testing Payments & Guarantee ---');
  {
    const res = await request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 499, customerName: 'Anita Roy' })
    });
    record('NPCI UPI Intent & QR Creation', res.ok && res.data.upiUri && res.data.upiTxnId, JSON.stringify(res.data));
  }

  {
    const res = await request('/api/guarantee/claim', {
      method: 'POST',
      body: JSON.stringify({
        orderId: testOrder?.id || 'ORD-8920',
        plantName: 'Golden Pothos',
        reason: 'Leaves drooped within 7 days',
        resolutionPreference: 'replacement'
      })
    });
    record('30-Day Thrive Guarantee Claim', res.ok && res.data.success && res.data.claimId, JSON.stringify(res.data));
  }

  console.log('\n========================================');
  console.log(`  QA SUITE COMPLETE: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================\n');
}

runTests().catch(console.error);
