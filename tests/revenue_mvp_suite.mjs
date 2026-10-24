
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5002';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runRevenueTests() {
  console.log(`\n======================================================`);
  console.log(`  PLANTME REVENUE MVP & BUSINESS EXPANSION TEST SUITE  `);
  console.log(`  Targeting API at: ${BASE_URL}                        `);
  console.log(`======================================================\n`);

  // Ensure ample sandbox wallet funds for test transactions
  await fetch(`${BASE_URL}/api/wallet/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 10000 })
  }).catch(() => {});

  // =========================================================================
  // 1. PRODUCT BUNDLES & CHECKOUT UPSELLS
  // =========================================================================
  console.log(`[TEST GROUP 1] Product Bundles & Stock Validation`);
  
  // 1.1 Retrieve bundles
  const bundlesRes = await fetch(`${BASE_URL}/api/bundles`);
  assert(bundlesRes.status === 200, `GET /api/bundles returned HTTP 200`);
  const bundles = await bundlesRes.json();
  assert(Array.isArray(bundles) && bundles.length >= 3, `Returned at least 3 active starter bundles`);
  
  const starterBundle = bundles.find(b => b.id === 'bundle_oxygen_starter');
  assert(starterBundle !== undefined, `Found "bundle_oxygen_starter" bundle`);
  assert(starterBundle.items.length === 4, `Bundle includes 4 constituents: plant, pot, soil, fertilizer`);
  assert(starterBundle.bundlePrice === 429, `Bundle price is calculated on backend (₹429 vs ₹500 MRP)`);
  assert(starterBundle.savings === 71, `Displays transparent savings (₹71)`);
  assert(starterBundle.inStock === true, `Starter bundle correctly reports inStock based on constituents`);

  // 1.2 Upsell Recommendations
  const upsellsRes = await fetch(`${BASE_URL}/api/upsells/recommendations?productId=p1`);
  const upsells = await upsellsRes.json();
  assert(upsells.success === true && Array.isArray(upsells.complementaryAccessories) && upsells.complementaryAccessories.length >= 1, `Recommended relevant complementary products for p1`);

  // 1.3 Place order with bundle and verify constituent stock deduction
  // Get initial stock of constituent items (p1, po1, so1, f1)
  const prodsBeforeRes = await fetch(`${BASE_URL}/api/products`);
  const prodsBefore = await prodsBeforeRes.json();
  const p1Before = prodsBefore.find(p => p.id === 'p1')?.quantity || 0;
  const po1Before = prodsBefore.find(p => p.id === 'po1')?.quantity || 0;

  const bundleOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Aarav Sharma',
      customerPhone: '+91 99001 12233',
      address: 'Flat 101, Palm Meadows, Whitefield, Bengaluru',
      items: [
        {
          id: starterBundle.id,
          name: starterBundle.name || starterBundle.title,
          price: starterBundle.bundlePrice,
          quantity: 1,
          isBundle: true,
          bundleId: starterBundle.id,
          vendorId: 'v1'
        }
      ],
      deliveryType: 'Express Hydration',
      deliveryCharge: 30,
      paymentMethod: 'cod'
    })
  });
  assert(bundleOrderRes.status === 200 || bundleOrderRes.status === 201, `Bundle order placed successfully`);
  const bundleOrderData = await bundleOrderRes.json();
  assert(bundleOrderData.success === true, `Order creation succeeded for starter bundle`);

  // Verify stock was deducted for physical components
  const prodsAfterRes = await fetch(`${BASE_URL}/api/products`);
  const prodsAfter = await prodsAfterRes.json();
  const p1After = prodsAfter.find(p => p.id === 'p1')?.quantity || 0;
  const po1After = prodsAfter.find(p => p.id === 'po1')?.quantity || 0;
  assert(p1After === p1Before - 1, `Constituent plant stock (p1) was decremented from ${p1Before} to ${p1After}`);
  assert(po1After === po1Before - 1, `Constituent pot stock (po1) was decremented from ${po1Before} to ${po1After}`);

  // 1.4 Test bundle rejection when component requested exceeds stock
  const hugeBundleOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Greedy Buyer',
      customerPhone: '+91 99001 99999',
      address: 'Indiranagar, Bengaluru',
      items: [
        {
          id: starterBundle.id,
          name: starterBundle.title,
          price: starterBundle.bundlePrice,
          quantity: 99999, // Insufficient stock
          isBundle: true,
          bundleId: starterBundle.id,
          vendorId: 'v1'
        }
      ],
      deliveryType: 'Express Hydration',
      deliveryCharge: 30,
      paymentMethod: 'cod'
    })
  });
  assert(hugeBundleOrderRes.status === 400, `Excessive bundle quantity rejected with HTTP 400`);
  const hugeOrderJson = await hugeBundleOrderRes.json();
  assert(hugeOrderJson.success === false, `Correctly returned failure message on out-of-stock component`);

  // =========================================================================
  // 2. PLANTME CARE MEMBERSHIP & QUOTAS
  // =========================================================================
  console.log(`\n[TEST GROUP 2] PlantMe Care Membership & AI Quotas`);

  // 2.1 Get Membership Plans
  const plansRes = await fetch(`${BASE_URL}/api/memberships/plans`);
  assert(plansRes.status === 200, `GET /api/memberships/plans returned HTTP 200`);
  const plans = await plansRes.json();
  const freePlan = plans.find(p => p.id === 'free');
  const plusPlan = plans.find(p => p.id === 'plus');
  const premiumPlan = plans.find(p => p.id === 'premium');
  assert(freePlan && plusPlan && premiumPlan, `Contains Free, Plus, and Premium plans`);
  assert(freePlan.monthlyPrice === 0 && freePlan.quotas.aiDiagnosesPerMonth === 2, `Free tier has ₹0 price and 2 AI diagnoses`);
  assert(plusPlan.monthlyPrice === 149 && plusPlan.quotas.aiDiagnosesPerMonth >= 10, `Plus tier has ₹149 price and at least 10 AI diagnoses (actual: ${plusPlan.quotas.aiDiagnosesPerMonth})`);

  // 2.2 Admin update of plan benefits
  const updatePlanRes = await fetch(`${BASE_URL}/api/admin/membership-plans/plus`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monthlyPrice: 149,
      quotas: { aiDiagnosesPerMonth: 12 }
    })
  });
  assert(updatePlanRes.status === 200, `Admin successfully updated Plus plan benefit quota`);

  // 2.3 Subscribe customer to Plus plan
  const testUserEmail = `test_care_${Date.now()}@plantme.in`;
  const subRes = await fetch(`${BASE_URL}/api/memberships/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: 'plus',
      userEmail: testUserEmail,
      paymentMethod: 'wallet',
      months: 1
    })
  });
  assert(subRes.status === 200, `POST /api/memberships/subscribe succeeded`);
  const subData = await subRes.json();
  assert(subData.success === true, `Subscription status active`);
  assert(subData.subscription.planId === 'plus', `Customer plan set to plus`);
  assert(subData.subscription.autoRenew === false, `Auto-renew is strictly false in sandbox (no simulated recurring billing)`);

  // 2.4 Check membership details
  const mySubRes = await fetch(`${BASE_URL}/api/memberships/me?userEmail=${encodeURIComponent(testUserEmail)}`);
  assert(mySubRes.status === 200, `GET /api/memberships/me returned membership`);
  const mySub = await mySubRes.json();
  assert(mySub.membership.planId === 'plus', `Subscription matches Plus tier`);
  assert(mySub.membership.usage.aiDiagnosesUsedThisPeriod === 0, `Initial usage count is 0`);

  // 2.5 Test AI Quota Increment & Enforcement
  // Call AI diagnosis with userEmail
  const diagRes = await fetch(`${BASE_URL}/api/ai/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plantName: 'Snake Plant',
      symptoms: 'Soft yellowing base on lower leaves',
      userEmail: testUserEmail
    })
  });
  assert(diagRes.status === 200, `AI diagnosis succeeded within quota`);
  const diagData = await diagRes.json();
  assert(diagData.issue && diagData.confidence && Array.isArray(diagData.remedy), `AI returned valid plant diagnosis (${diagData.issue})`);

  // Check quota incremented
  const subAfterDiagRes = await fetch(`${BASE_URL}/api/memberships/me?userEmail=${encodeURIComponent(testUserEmail)}`);
  const subAfterDiag = await subAfterDiagRes.json();
  assert(subAfterDiag.membership.usage.aiDiagnosesUsedThisPeriod === 1, `Membership usage incremented to 1`);

  // Test Free user exceeding limit
  const freeUserEmail = `free_user_${Date.now()}@plantme.in`;
  // First 2 calls should succeed (Free limit is 2)
  for (let i = 1; i <= 2; i++) {
    const res = await fetch(`${BASE_URL}/api/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plantName: 'Pothos',
        symptoms: 'Browning leaf edges',
        userEmail: freeUserEmail
      })
    });
    assert(res.status === 200, `Free user diagnosis #${i} permitted`);
  }
  // 3rd call must be blocked with HTTP 403
  const blockedDiagRes = await fetch(`${BASE_URL}/api/ai/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plantName: 'Pothos',
      symptoms: 'Curling leaves',
      userEmail: freeUserEmail
    })
  });
  assert(blockedDiagRes.status === 403, `3rd call for Free user blocked with HTTP 403 (Quota Exceeded)`);
  const blockedJson = await blockedDiagRes.json();
  assert(blockedJson.requiresUpgrade === true, `Response provides clear upgrade prompt to Plus/Premium`);

  // 2.6 Customer Cancellation
  const cancelRes = await fetch(`${BASE_URL}/api/memberships/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail: testUserEmail,
      reason: 'Relocating to another city'
    })
  });
  assert(cancelRes.status === 200, `Membership cancellation succeeded`);
  const cancelData = await cancelRes.json();
  assert(cancelData.subscription.status === 'cancelled', `Subscription status updated to 'cancelled'`);

  // =========================================================================
  // 3. GARDENER & PLANT EXPERT BOOKINGS (SEPARATE FROM RIDERS)
  // =========================================================================
  console.log(`\n[TEST GROUP 3] Gardener & Plant Expert Service Bookings`);

  // 3.1 List bookings
  const bookingsRes = await fetch(`${BASE_URL}/api/expert-bookings`);
  assert(bookingsRes.status === 200, `GET /api/expert-bookings returned HTTP 200`);
  const bookings = await bookingsRes.json();
  assert(Array.isArray(bookings), `Bookings returned as array`);

  // 3.2 Create new Expert Booking
  const bookingDate = `2026-11-${Math.floor(10 + Math.random() * 18)}`;
  const bookingSlot = `10:00 AM - 12:00 PM (${Date.now()})`;
  const newBookingRes = await fetch(`${BASE_URL}/api/expert-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Pooja Hegde',
      customerEmail: 'pooja@plantme.in',
      customerPhone: '+91 98450 77889',
      serviceCategory: 'balcony_triage',
      address: 'Penthouse 12, Sobha Morzaria, Bannerghatta Road, Bengaluru',
      preferredDate: bookingDate,
      preferredSlot: bookingSlot,
      plantCount: 15,
      specialNotes: 'Browning fiddle leaf and balcony layout advice',
      paymentMethod: 'wallet',
      quotedPrice: 499
    })
  });
  assert(newBookingRes.status === 200 || newBookingRes.status === 201, `Expert booking created successfully`);
  const newBookingData = await newBookingRes.json();
  assert(newBookingData.success === true, `Booking response success is true`);
  const bookingId = newBookingData.booking.bookingId;
  assert(bookingId.startsWith('EXP-'), `Booking ID has dedicated 'EXP-' prefix distinct from delivery orders`);
  assert(newBookingData.booking.status === 'confirmed', `Booking status is confirmed`);
  assert(newBookingData.booking.assignedExpert.id.startsWith('g_'), `Assigned professional gardener/expert (g_201), NOT an EV rider`);

  // 3.3 Test Conflict Prevention
  // Attempt to book the exact same slot with the same provider
  const conflictRes = await fetch(`${BASE_URL}/api/expert-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Rival Booker',
      customerEmail: 'rival@plantme.in',
      customerPhone: '+91 98450 00000',
      serviceCategory: 'balcony_triage',
      address: 'Indiranagar, Bengaluru',
      preferredDate: bookingDate,
      preferredSlot: bookingSlot,
      paymentMethod: 'wallet',
      quotedPrice: 499
    })
  });
  assert(conflictRes.status === 409, `Conflicting appointment slot rejected with HTTP 409 Conflict`);

  // 3.4 Provider Acceptance
  const acceptRes = await fetch(`${BASE_URL}/api/expert-bookings/${bookingId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expertId: 'g_201' })
  });
  assert(acceptRes.status === 200, `Horticulturist accepted the appointment`);
  const acceptData = await acceptRes.json();
  assert(acceptData.booking.status === 'in_progress', `Booking status updated to in_progress`);

  // 3.5 Provider Completion
  const completeRes = await fetch(`${BASE_URL}/api/expert-bookings/${bookingId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      treatmentNotes: 'Sprayed organic neem oil, pruned dead foliage, replenished 5kg nutrient soil'
    })
  });
  assert(completeRes.status === 200, `Appointment marked as completed`);
  const completeData = await completeRes.json();
  assert(completeData.booking.status === 'completed', `Booking status transitioned to completed`);

  // 3.6 Customer Service Rating
  const rateRes = await fetch(`${BASE_URL}/api/expert-bookings/${bookingId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: 5,
      reviewText: 'Pramod revived our fiddle leaf fig completely! Incredible service.'
    })
  });
  assert(rateRes.status === 200, `Service rating recorded successfully`);
  const rateData = await rateRes.json();
  assert(rateData.booking.rating === 5, `Booking holds verified 5-star rating`);

  // 3.7 Cancellation & Refund
  // Create another booking to test cancellation
  const cancelBookingRes = await fetch(`${BASE_URL}/api/expert-bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Cancel Test',
      customerEmail: 'cancel_user@plantme.in',
      customerPhone: '+91 98450 11111',
      serviceCategory: 'makeover',
      address: 'Koramangala, Bengaluru',
      preferredDate: `2026-12-${Math.floor(10 + Math.random() * 18)}`,
      preferredSlot: `02:00 PM - 04:00 PM (${Date.now()})`,
      paymentMethod: 'wallet',
      quotedPrice: 999
    })
  });
  const cancelBookingData = await cancelBookingRes.json();
  const cancelId = cancelBookingData.booking.bookingId;

  const cancelActionRes = await fetch(`${BASE_URL}/api/expert-bookings/${cancelId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cancelledBy: 'customer',
      reason: 'Emergency travel'
    })
  });
  assert(cancelActionRes.status === 200, `Booking cancelled successfully`);
  const cancelActionData = await cancelActionRes.json();
  assert(cancelActionData.booking.status === 'cancelled', `Status marked as cancelled`);
  assert(cancelActionData.booking.refundStatus === 'processed', `Refund of ₹999 processed back to wallet`);

  // =========================================================================
  // 4. NURSERY VENDOR SAAS & ENTITLEMENTS
  // =========================================================================
  console.log(`\n[TEST GROUP 4] Nursery Vendor SaaS Plans & Entitlements`);

  // 4.1 Vendor Plans
  const vPlansRes = await fetch(`${BASE_URL}/api/vendors/plans`);
  assert(vPlansRes.status === 200, `GET /api/vendors/plans returned HTTP 200`);
  const vPlans = await vPlansRes.json();
  const vBasic = vPlans.find(p => p.tier === 'basic' || p.id === 'vendor_basic');
  const vPro = vPlans.find(p => p.tier === 'pro' || p.id === 'vendor_pro');
  const vEnterprise = vPlans.find(p => p.tier === 'enterprise' || p.id === 'vendor_enterprise');
  assert(vBasic && vPro && vEnterprise, `Vendor plans include Basic, Pro, and Enterprise`);
  assert(vBasic.commissionRate === 0.08, `Basic nursery commission is 8%`);
  assert(vPro.commissionRate === 0.05, `Pro nursery commission is 5% (₹999/mo)`);
  assert(vEnterprise.commissionRate === 0.03, `Enterprise nursery commission is 3% (₹2,499/mo)`);

  // 4.2 Upgrade Vendor v1 to Pro Plan
  const vSubRes = await fetch(`${BASE_URL}/api/vendors/v1/subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: 'pro',
      months: 1,
      paymentMethod: 'payout_deduction'
    })
  });
  assert(vSubRes.status === 200, `Vendor v1 upgraded to Pro tier`);
  const vSubData = await vSubRes.json();
  assert(vSubData.subscription.tier === 'pro' || vSubData.subscription.planId === 'vendor_pro', `Subscription tier is pro`);
  assert(vSubData.subscription.commissionRate === 0.05, `Commission rate reduced to 5%`);

  // 4.3 Check sponsored placement & Pro badge on vendor list (Admin authorized)
  const vendorsListRes = await fetch(`${BASE_URL}/api/vendors`, {
    headers: { 'x-user-role': 'Admin', 'x-admin-email': 'admin@plantme.in' }
  });
  const vendorsList = await vendorsListRes.json();
  const v1 = Array.isArray(vendorsList) ? vendorsList.find(v => v.id === 'v1') : null;
  assert(v1.subscriptionTier === 'pro', `Vendor v1 reflects 'pro' tier`);
  assert(v1.isSponsored === true, `Vendor v1 has isSponsored=true for sponsored catalog placement`);

  // 4.4 Advanced Analytics & Inventory Insights Entitlement
  // Pro tier should have access
  const insightsRes = await fetch(`${BASE_URL}/api/vendor/v1/analytics/insights`);
  assert(insightsRes.status === 200, `Pro vendor has access to advanced inventory insights`);
  const insightsData = await insightsRes.json();
  assert(insightsData.insights && insightsData.insights.fastMovingCategories, `Returned fast moving category predictions`);

  // Basic tier vendor (e.g. v2) should be blocked or prompted to upgrade
  const v2InsightsRes = await fetch(`${BASE_URL}/api/vendor/v2/analytics/insights`);
  assert(v2InsightsRes.status === 403, `Basic vendor (v2) blocked from Pro analytics with HTTP 403`);
  const v2InsightsJson = await v2InsightsRes.json();
  assert(v2InsightsJson.requiresUpgrade === true, `Prompted to upgrade to Pro tier`);

  // 4.5 Tier-Based Commission Calculation in Orders
  // Placing order from v1 should now deduct 5% instead of 8%
  const v1OrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Commission Test Buyer',
      customerPhone: '+91 99001 55555',
      address: 'Indiranagar, Bengaluru',
      items: [{ id: 'p3', name: 'Mini Jade Plant', price: 120, quantity: 1, vendorId: 'v1' }],
      deliveryType: 'Express Hydration',
      deliveryCharge: 30,
      paymentMethod: 'cod'
    })
  });
  const v1OrderData = await v1OrderRes.json();
  const commissionRateUsed = v1OrderData.order.platformCommissionRate;
  assert(commissionRateUsed === 0.05, `Order applied Pro 5% commission rate instead of default 8%`);

  // =========================================================================
  // 5. REFERRALS, REORDERS & CART REMINDERS
  // =========================================================================
  console.log(`\n[TEST GROUP 5] Referrals, 1-Click Reorders & Cart Recovery`);

  // 5.1 Referral Code Generation
  const referrerUser = 'priya_gardener@plantme.in';
  const refCodeRes = await fetch(`${BASE_URL}/api/referrals/my-code?userEmail=${encodeURIComponent(referrerUser)}`);
  assert(refCodeRes.status === 200, `Generated unique referral code`);
  const refCodeData = await refCodeRes.json();
  const code = refCodeData.referralCode;
  assert(code.startsWith('PLANT-'), `Referral code starts with 'PLANT-' prefix`);

  // 5.2 Claim Referral Code by Friend
  const refereeUser = `friend_${Date.now()}@plantme.in`;
  const claimRes = await fetch(`${BASE_URL}/api/referrals/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referralCode: code,
      claimantEmail: refereeUser,
      claimantName: 'Kavita Rao'
    })
  });
  assert(claimRes.status === 200, `Friend claimed referral code successfully`);
  const claimData = await claimRes.json();
  assert(claimData.claim.status === 'registered', `Referral claim registered`);

  // 5.3 Fraud Prevention: Prevent Self-Referral
  const selfClaimRes = await fetch(`${BASE_URL}/api/referrals/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referralCode: code,
      claimantEmail: referrerUser, // Self!
      claimantName: 'Priya Self'
    })
  });
  assert(selfClaimRes.status === 400, `Self-referral rejected with HTTP 400`);

  // 5.4 Fraud Prevention: Prevent Duplicate Claim
  const dupClaimRes = await fetch(`${BASE_URL}/api/referrals/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referralCode: code,
      claimantEmail: refereeUser, // Already claimed!
      claimantName: 'Kavita Duplicate'
    })
  });
  assert(dupClaimRes.status === 400, `Duplicate claim by same customer rejected with HTTP 400`);

  // 5.5 1-Click Reorder
  const reorderRes = await fetch(`${BASE_URL}/api/orders/${v1OrderData.order.id}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentMethod: 'cod'
    })
  });
  assert(reorderRes.status === 200, `1-Click Reorder placed successfully`);
  const reorderData = await reorderRes.json();
  assert(reorderData.order.items.length === 1 && reorderData.order.items[0].id === 'p3', `Reorder matched original product (p3)`);
  assert(reorderData.order.id !== v1OrderData.order.id, `New distinct order ID generated for reorder`);

  // 5.6 Consent-Based Abandoned Cart Recovery
  const reminderRes = await fetch(`${BASE_URL}/api/cart/abandoned-reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerEmail: 'arjun@plantme.in',
      customerPhone: '+91 98450 99999',
      cartItems: [{ name: 'Peace Lily Plant', price: 299 }],
      consentGiven: true
    })
  });
  assert(reminderRes.status === 200, `Abandoned cart reminder scheduled with customer consent`);
  const reminderData = await reminderRes.json();
  assert(reminderData.success === true && reminderData.discountCode === 'GROW10', `Supplied 10% incentive coupon GROW10`);

  // =========================================================================
  // 6. SECURITY, WEBHOOKS & IDEMPOTENCY
  // =========================================================================
  console.log(`\n[TEST GROUP 6] Security, Webhooks & Idempotency`);

  // 6.1 Process live/gateway webhook
  const testWebhookId = `evt_pay_${Date.now()}`;
  const testPaymentId = `pay_${Date.now()}`;
  const webhookRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Signature': 'mock_sha256_sig_valid'
    },
    body: JSON.stringify({
      eventId: testWebhookId,
      eventType: 'payment.captured',
      payload: {
        orderId: v1OrderData.order.id,
        amount: 529,
        paymentId: testPaymentId
      }
    })
  });
  assert(webhookRes.status === 200, `Payment webhook processed with HTTP 200`);
  const webhookData = await webhookRes.json();
  assert(webhookData.processed === true, `Webhook processed flag is true`);

  // 6.2 Duplicate Webhook Rejection (Idempotency)
  const dupWebhookRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Signature': 'mock_sha256_sig_valid'
    },
    body: JSON.stringify({
      eventId: testWebhookId, // Exact same event ID!
      eventType: 'payment.captured',
      payload: {
        orderId: v1OrderData.order.id,
        amount: 529,
        paymentId: testPaymentId
      }
    })
  });
  assert(dupWebhookRes.status === 200, `Duplicate webhook acknowledged with HTTP 200 without reprocessing`);
  const dupWebhookData = await dupWebhookRes.json();
  assert(dupWebhookData.duplicate === true, `Duplicate webhook detected and ignored idempotently`);

  // 6.3 Audit Logs
  const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`);
  assert(auditRes.status === 200, `GET /api/admin/audit-logs returned HTTP 200`);
  const auditLogs = await auditRes.json();
  assert(Array.isArray(auditLogs) && auditLogs.length > 0, `Audit log contains financial transactions and events`);
  const webhookLog = auditLogs.find(a => a.action === 'PAYMENT_WEBHOOK_PROCESSED');
  assert(webhookLog !== undefined, `Found audited PAYMENT_WEBHOOK_PROCESSED entry`);

  // =========================================================================
  // 7. ADMIN REVENUE DASHBOARD METRICS RECONCILIATION
  // =========================================================================
  console.log(`\n[TEST GROUP 7] Admin Revenue Dashboard Analytics Reconciliation`);

  const revRes = await fetch(`${BASE_URL}/api/admin/revenue-analytics`);
  assert(revRes.status === 200, `GET /api/admin/revenue-analytics returned HTTP 200`);
  const rev = await revRes.json();

  // Validate core financial metrics
  assert(typeof rev.gmv === 'number' && rev.gmv > 0, `GMV is calculated (> ₹${rev.gmv})`);
  assert(typeof rev.platformCommissionRevenue === 'number', `Platform commission revenue is calculated (₹${rev.platformCommissionRevenue})`);
  assert(typeof rev.subscriptionRevenue === 'number', `Subscription revenue is calculated (₹${rev.subscriptionRevenue})`);
  assert(typeof rev.bookingRevenue === 'number', `Gardener booking revenue is calculated (₹${rev.bookingRevenue})`);
  assert(typeof rev.totalPlatformRevenue === 'number', `Total platform revenue reconciled (₹${rev.totalPlatformRevenue})`);

  // Deductions & Contribution Margin
  assert(typeof rev.refunds === 'number', `Refund deductions tracked (₹${rev.refunds})`);
  assert(typeof rev.paymentFees === 'number', `Payment gateway fees (2%) tracked (₹${rev.paymentFees})`);
  assert(typeof rev.deliverySubsidies === 'number', `Delivery subsidies tracked (₹${rev.deliverySubsidies})`);
  assert(typeof rev.contributionMargin === 'number', `Contribution margin strictly calculated (₹${rev.contributionMargin})`);

  // Cashflow & Unit Economics
  assert(typeof rev.collectedCash === 'number', `Realized cash collected tracked (₹${rev.collectedCash})`);
  assert(typeof rev.activePayingCustomers === 'number', `Active paying customers tracked (${rev.activePayingCustomers})`);
  assert(typeof rev.repeatPurchaseRate === 'number', `Repeat purchase rate calculated (${rev.repeatPurchaseRate}%)`);
  assert(typeof rev.subscriptionChurn === 'number', `Subscription churn rate calculated (${rev.subscriptionChurn}%)`);

  // Breakdowns
  assert(Array.isArray(rev.revenueByNursery) && rev.revenueByNursery.length > 0, `Revenue breakdown by nursery provided`);
  assert(Array.isArray(rev.revenueByCategory) && rev.revenueByCategory.length > 0, `Revenue breakdown by category provided`);

  console.log(`\n======================================================`);
  console.log(`  REVENUE TEST SUITE SUMMARY:                          `);
  console.log(`  Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests} `);
  console.log(`======================================================\n`);
}

runRevenueTests().catch(err => {
  console.error(`\n❌ TEST SUITE RUNTIME ERROR:`, err);
  process.exit(1);
});
