import assert from 'assert';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5002';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const { headers, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) }
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

async function runSupplierPrivacyTests() {
  console.log('\n======================================================');
  console.log('  PLANTME — SUPPLIER & NURSERY PRIVACY SECURITY SUITE ');
  console.log(`  Target: ${BASE_URL}`);
  console.log('======================================================\n');

  // --- 1. PUBLIC VENDOR ENDPOINTS LOCKDOWN ---
  console.log('--- 1. Testing Supplier & Vendor Endpoint Protection ---');

  // 1.1 Public unauthenticated access to /api/vendors MUST BE 403 FORBIDDEN
  {
    const res = await request('/api/vendors');
    const msg = res.data?.message || res.data?.error || '';
    const isProtected = res.status === 403 && msg.includes('confidential business information');
    record('Public unauthenticated GET /api/vendors is blocked (403)', isProtected, `Status: ${res.status}, Body: ${JSON.stringify(res.data)}`);
  }

  // 1.2 Customer role access to /api/vendors MUST BE 403 FORBIDDEN
  {
    const res = await request('/api/vendors', {
      headers: { 'x-user-role': 'Customer', 'x-user-email': 'customer@plantme.in' }
    });
    record('Customer role GET /api/vendors is blocked (403)', res.status === 403, `Status: ${res.status}`);
  }

  // 1.3 Admin role access to /api/vendors MUST BE 200 OK
  {
    const res = await request('/api/vendors', {
      headers: { 'x-user-role': 'Admin', 'x-admin-email': 'admin@plantme.in' }
    });
    const isAdminAllowed = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    record('Admin role GET /api/vendors preserves internal access (200)', isAdminAllowed, `Status: ${res.status}, Count: ${res.data?.length}`);
  }

  // 1.4 Public access to /api/vendors/pending MUST BE 403 FORBIDDEN
  {
    const res = await request('/api/vendors/pending');
    record('Public GET /api/vendors/pending is blocked (403)', res.status === 403, `Status: ${res.status}`);
  }

  // 1.5 Admin access to /api/vendors/pending MUST BE 200 OK
  {
    const res = await request('/api/vendors/pending', {
      headers: { 'x-user-role': 'Admin', 'x-admin-email': 'admin@plantme.in' }
    });
    record('Admin GET /api/vendors/pending is allowed (200)', res.status === 200, `Status: ${res.status}`);
  }

  // 1.6 Public access to /api/vendors/v1 MUST BE 403 FORBIDDEN
  {
    const res = await request('/api/vendors/v1');
    record('Public GET /api/vendors/:id is blocked (403)', res.status === 403, `Status: ${res.status}`);
  }

  // 1.7 Public POST /api/vendors/:id/reviews MUST BE 403 FORBIDDEN
  {
    const res = await request('/api/vendors/v1/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comment: 'test' })
    });
    record('Public POST /api/vendors/:id/reviews is blocked (403)', res.status === 403, `Status: ${res.status}`);
  }

  // --- 2. PRODUCT CATALOG DATA LEAKAGE PREVENTION ---
  console.log('\n--- 2. Testing Product Catalog Sanitization ---');

  // 2.1 Public GET /api/products returns products WITHOUT supplier credentials
  {
    const res = await request('/api/products');
    const isOk = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;

    let hasVendorIdLeak = false;
    let hasSupplierAddressLeak = false;
    let hasSupplierCostLeak = false;

    if (isOk) {
      for (const prod of res.data) {
        if (prod.vendorId !== undefined) hasVendorIdLeak = true;
        if (prod.supplierAddress !== undefined) hasSupplierAddressLeak = true;
        if (prod.procurementCost !== undefined || prod.supplierCost !== undefined) hasSupplierCostLeak = true;
      }
    }

    record('Public GET /api/products succeeds (200)', isOk, `Status: ${res.status}`);
    record('Products strip vendorId from customer view', !hasVendorIdLeak, 'Found vendorId in response');
    record('Products strip supplierAddress/procurementAddress', !hasSupplierAddressLeak, 'Found supplier address in response');
    record('Products strip procurementCost/supplierCost', !hasSupplierCostLeak, 'Found procurement cost in response');
    record('Products inject PlantMe Express Fulfillment Hub', res.data?.[0]?.fulfillment === 'PlantMe Express Fulfillment Hub', `Fulfillment: ${res.data?.[0]?.fulfillment}`);
  }

  // 2.2 Public GET /api/products/:id sanitization
  {
    const res = await request('/api/products/p1');
    const isSanitized = res.status === 200 &&
      res.data?.vendorId === undefined &&
      res.data?.supplierAddress === undefined &&
      res.data?.procurementCost === undefined;
    record('Public GET /api/products/:id strips supplier info', isSanitized, `Body: ${JSON.stringify(res.data)}`);
  }

  // 2.3 Admin GET /api/products preserves operational vendorId
  {
    const res = await request('/api/products', {
      headers: { 'x-user-role': 'Admin', 'x-admin-email': 'admin@plantme.in' }
    });
    const hasInternalOps = res.status === 200 && res.data?.some(p => p.vendorId !== undefined);
    record('Admin GET /api/products preserves operational vendor links', hasInternalOps, `VendorId present in admin: ${hasInternalOps}`);
  }

  // --- 3. LIVE DELIVERY TRACKING & ORDER PRIVACY ---
  console.log('\n--- 3. Testing Delivery Tracking & Order Privacy ---');

  // 3.1 Live Tracking sanitization: NO nurseryCoords, PlantMe Hub origin
  {
    const res = await request('/api/orders/ORD-7290/live-tracking');
    const isOk = res.status === 200 && res.data?.success;
    const hasNurseryCoords = res.data?.nurseryCoords !== undefined;
    const hasFulfillmentHub = res.data?.fulfillmentHub === 'PlantMe Express Botanical Hub';
    const hasSupportContact = res.data?.supportContact?.phone === '+91 88856 00899';

    record('GET /api/orders/:id/live-tracking succeeds (200)', isOk, `Status: ${res.status}`);
    record('Live tracking does NOT leak nurseryCoords', !hasNurseryCoords, 'nurseryCoords found in response');
    record('Live tracking specifies PlantMe Express Botanical Hub', hasFulfillmentHub, `Hub: ${res.data?.fulfillmentHub}`);
    record('Live tracking includes PlantMe Customer Concierge support contact', hasSupportContact, `Support: ${JSON.stringify(res.data?.supportContact)}`);
  }

  // 3.2 Telemetry sanitization: NO nurseryCoords
  {
    const res = await request('/api/orders/ORD-7290/telemetry');
    const isOk = res.status === 200 && res.data?.success;
    const hasNurseryCoords = res.data?.nurseryCoords !== undefined;
    record('Telemetry does NOT leak nurseryCoords', isOk && !hasNurseryCoords, `Telemetry: ${JSON.stringify(res.data)}`);
  }

  // 3.3 Customer orders sanitization
  {
    const res = await request('/api/orders', {
      headers: { 'x-user-role': 'Customer', 'x-user-email': 'customer@plantme.in' }
    });
    const isOk = res.status === 200 && Array.isArray(res.data);
    let hasPickupPinLeak = false;
    let hasNurseryCoordsLeak = false;

    if (isOk) {
      for (const ord of res.data) {
        if (ord.pickupPin !== undefined) hasPickupPinLeak = true;
        if (ord.nurseryCoords !== undefined) hasNurseryCoordsLeak = true;
      }
    }
    record('Customer GET /api/orders strips pickupPin and nurseryCoords', isOk && !hasPickupPinLeak && !hasNurseryCoordsLeak, `Found leaks`);
  }

  // --- 4. STORIES & DISCOVERY PRIVACY ---
  console.log('\n--- 4. Testing Stories & Unboxing Privacy ---');
  {
    const res = await request('/api/stories');
    const isOk = res.status === 200 && res.data?.success && Array.isArray(res.data.stories);
    let leaksStallOwner = false;
    if (isOk) {
      for (const st of res.data.stories) {
        if (st.vendorPhone || st.ownerPhone || (st.vendorName && st.vendorName.toLowerCase().includes('stall'))) {
          leaksStallOwner = true;
        }
      }
    }
    record('GET /api/stories uses PlantMe Hub branding without private contacts', isOk && !leaksStallOwner, `Stories: ${JSON.stringify(res.data?.stories?.[0])}`);
  }

  // --- 5. SHOPPING EXPERIENCE REGRESSION ---
  console.log('\n--- 5. Testing Customer Shopping & Checkout Regression ---');

  // 5.1 Place a new order as Customer
  {
    const orderPayload = {
      items: [
        { id: 'p1', name: 'Monstera Deliciosa', price: 180, quantity: 1 }
      ],
      total: 210,
      deliveryType: 'Express Doorstep Delivery',
      address: 'Flat 402, Green Heights, Indiranagar, Bengaluru',
      recipientName: 'Arjun Customer',
      phone: '+91 88856 00899',
      paymentMethod: 'wallet',
      userEmail: 'customer@plantme.in'
    };

    const res = await request('/api/orders', {
      method: 'POST',
      headers: { 'x-user-role': 'Customer', 'x-user-email': 'customer@plantme.in' },
      body: JSON.stringify(orderPayload)
    });

    const isOrderPlaced = res.status === 200 && res.data?.success && res.data.order?.deliveryOtp;
    record('Customer can place order via Express Doorstep Delivery (200)', isOrderPlaced, `Order: ${JSON.stringify(res.data)}`);
  }

  // 5.2 Category browsing
  {
    const res = await request('/api/categories');
    record('GET /api/categories functions correctly', res.status === 200 && Array.isArray(res.data), `Count: ${res.data?.length}`);
  }

  // 5.3 Plant doctor / care tips
  {
    const res = await request('/api/weather/care-tip?city=Hyderabad');
    record('AI Botanical Weather & Care Tips function correctly', res.status === 200 && !!res.data?.advisory?.title, `Data: ${JSON.stringify(res.data?.advisory?.title)}`);
  }

  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('======================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runSupplierPrivacyTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
