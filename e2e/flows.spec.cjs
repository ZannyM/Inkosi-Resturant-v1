const { test, expect } = require('@playwright/test')

const adminBaseURL = process.env.PLAYWRIGHT_ADMIN_URL || 'http://127.0.0.1:5174'
const paystackSecret = process.env.PAYSTACK_E2E_SECRET_KEY
const customerOrderId = '507f1f77bcf86cd799439099'
const customerId = '507f1f77bcf86cd799439098'

const menuFixture = {
  _id: '507f1f77bcf86cd799439001',
  name: 'E2E Garden Salad',
  description: 'Fresh greens for browser tests',
  category: 'Salad',
  price: 85,
  image: 'e2e-garden-salad.png',
  isFeatured: false,
  customization: { addOnsEnabled: false, addOns: [], spiceLevelEnabled: false, notesEnabled: true }
}

const orderFixture = {
  _id: '507f1f77bcf86cd799439002',
  userId: customerId,
  items: [{ name: 'E2E Garden Salad', quantity: 1, addOns: [], spiceLevel: null, notes: '' }],
  amount: 120,
  address: {
    firstName: 'Test',
    lastName: 'Customer',
    street: '123 Market Road',
    city: 'Johannesburg',
    province: 'Gauteng',
    country: 'South Africa',
    zipcode: '2000',
    phone: '0821234567'
  },
  paystackReference: 'e2e-status-reference',
  status: 'Food Processing',
  date: '2026-01-15T10:00:00.000Z'
}

const fulfillJson = (route, data, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })

async function loginAsAdmin(page) {
  await page.goto(`${adminBaseURL}/login`)
  await page.getByLabel('Email').fill('manager@example.test')
  await page.getByLabel('Password').fill('playwright-admin-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Inkosi Admin Panel')).toBeVisible()
}

async function mockAdminApi(page, { foods = [], orders = [] } = {}) {
  const updatedStatuses = []
  await page.route('**/api/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const body = request.postDataJSON?.()

    if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      return fulfillJson(route, {
        success: true,
        token: 'playwright-admin-token',
        role: 'Manager',
        permissions: ['catalog:write', 'orders:read', 'orders:write', 'store:write'],
        mustChangePassword: false,
        expiresIn: 900
      })
    }
    if (url.pathname === '/api/store/status' && request.method() === 'GET') {
      return fulfillJson(route, { success: true, data: { isStoreLive: true } })
    }
    if (url.pathname === '/api/food/list' && request.method() === 'GET') {
      return fulfillJson(route, { success: true, data: foods })
    }
    if (url.pathname === '/api/food/featured' && request.method() === 'GET') {
      return fulfillJson(route, {
        success: true,
        data: foods.filter(item => item.isFeatured).slice(0, 4)
      })
    }
    if (url.pathname === '/api/food/update' && request.method() === 'POST') {
      const food = foods.find(item => item._id === body.id)
      if (!food) return fulfillJson(route, { success: false, message: 'Food item not found' }, 404)
      Object.assign(food, body)
      return fulfillJson(route, { success: true, message: 'Food item updated successfully' })
    }
    if (url.pathname === '/api/order/list' && request.method() === 'GET') {
      const requestedStatus = url.searchParams.get('status') || 'all'
      const visibleOrders = requestedStatus === 'all'
        ? orders
        : orders.filter(order => order.status === requestedStatus)
      return fulfillJson(route, { success: true, data: visibleOrders })
    }
    if (url.pathname === '/api/order/status' && request.method() === 'POST') {
      const order = orders.find(item => item._id === body.orderId)
      if (!order) return fulfillJson(route, { success: false, message: 'Order not found' }, 404)
      order.status = body.status
      updatedStatuses.push(body.status)
      return fulfillJson(route, { success: true, message: 'Status Updated' })
    }

    throw new Error(`Unexpected admin API request: ${request.method()} ${url.pathname}`)
  })
  await page.route('**/images/**', route =>
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('') }))
  return updatedStatuses
}

test('admin edits a menu item', async ({ page }) => {
  const foods = [structuredClone(menuFixture)]
  await mockAdminApi(page, { foods })
  await loginAsAdmin(page)
  await page.getByRole('link', { name: 'List Items' }).click()

  await expect(page.getByText('E2E Garden Salad', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Name').fill('E2E Updated Garden Salad')
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await expect(page.getByText('E2E Updated Garden Salad', { exact: true })).toBeVisible()
  expect(foods[0].name).toBe('E2E Updated Garden Salad')
})

test('admin moves an order through processing, delivery, and delivered statuses', async ({ page }) => {
  const orders = [structuredClone(orderFixture)]
  const updatedStatuses = await mockAdminApi(page, { orders })
  await loginAsAdmin(page)
  await page.getByRole('link', { name: 'Orders' }).click()

  const row = page.locator('.order-item').filter({ hasText: 'E2E Garden Salad' })
  const status = row.getByRole('combobox')
  await expect(status).toHaveValue('Food Processing')
  await status.selectOption('Out for delivery')
  await expect(status).toHaveValue('Out for delivery')
  await status.selectOption('Delivered')
  await expect(status).toHaveValue('Delivered')

  expect(updatedStatuses).toEqual(['Out for delivery', 'Delivered'])
})

test('customer completes checkout with a Paystack test card', async ({ page }) => {
  test.skip(!paystackSecret, 'Set PAYSTACK_E2E_SECRET_KEY to enable the real Paystack test-card flow')
  expect(paystackSecret, 'Checkout E2E only accepts a Paystack test secret key').toMatch(/^sk_test_/)

  const food = {
    ...menuFixture,
    _id: '507f1f77bcf86cd799439003',
    name: 'E2E Checkout Dish',
    price: 120
  }
  const order = {
    ...structuredClone(orderFixture),
    _id: customerOrderId,
    items: [{ ...food, quantity: 1 }],
    amount: 155
  }
  await page.addInitScript(({ token }) => {
    localStorage.clear()
    localStorage.setItem('token', token)
  }, { token: 'playwright-customer-token' })

  await page.route('**/api/**', async route => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/cart/get' && request.method() === 'GET') {
      return fulfillJson(route, {
        success: true,
        cartData: {
          [food._id]: {
            itemId: food._id,
            quantity: 1,
            addOns: [],
            spiceLevel: null,
            notes: '',
            unitPrice: food.price
          }
        },
        savedData: {}
      })
    }
    if (url.pathname === '/api/user/profile' && request.method() === 'GET') {
      return fulfillJson(route, { success: true, user: { _id: customerId, name: 'Test Customer' } })
    }
    if (url.pathname === '/api/food/list' && request.method() === 'GET') {
      return fulfillJson(route, { success: true, data: [food] })
    }
    if (url.pathname === '/api/store/status' && request.method() === 'GET') {
      return fulfillJson(route, {
        success: true,
        data: { isStoreLive: true, isAcceptingOrders: true }
      })
    }
    if (url.pathname === '/api/order/place' && request.method() === 'POST') {
      const orderRequest = request.postDataJSON()
      const reference = `e2e_${customerOrderId}_${Date.now()}`
      const response = await page.request.post('https://api.paystack.co/transaction/initialize', {
        headers: { Authorization: `Bearer ${paystackSecret}` },
        data: {
          email: orderRequest.address.email,
          amount: Math.round(orderRequest.amount * 100),
          reference,
          callback_url: `http://127.0.0.1:5173/verify?success=true&orderId=${customerOrderId}`,
          metadata: { orderId: customerOrderId, userId: customerId }
        }
      })
      const result = await response.json()
      if (!response.ok() || result.status !== true || !result.data?.authorization_url) {
        return fulfillJson(route, {
          success: false,
          message: result.message || 'Paystack test transaction initialization failed'
        }, 502)
      }
      return fulfillJson(route, { success: true, session_url: result.data.authorization_url })
    }
    if (url.pathname === '/api/order/verify' && request.method() === 'POST') {
      return fulfillJson(route, { success: true, message: 'Paid' })
    }
    if (url.pathname === '/api/order/userorders' && request.method() === 'POST') {
      return fulfillJson(route, { success: true, data: [order] })
    }

    throw new Error(`Unexpected customer API request: ${request.method()} ${url.pathname}`)
  })

  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Checkout.' })).toBeVisible()
  await page.getByLabel('First name').fill('Test')
  await page.getByLabel('Last name').fill('Customer')
  await page.getByLabel('Email').fill(`playwright-${Date.now()}@example.test`)
  await page.getByLabel('Phone').fill('0821234567')
  await page.getByLabel('Street Address').fill('123 Market Road')
  await page.getByLabel('Province').selectOption({ label: 'Gauteng' })
  await page.getByLabel('City').selectOption({ label: 'Johannesburg' })
  await page.getByLabel('Postal code').fill('2000')
  const initializationResponse = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/order/place')
  await page.getByRole('button', { name: 'Pay R155.00' }).click()
  const initializedOrder = await initializationResponse
  const initializationBody = await initializedOrder.json()
  expect(initializationBody.success, initializationBody.message).toBe(true)

  await page.waitForURL(/checkout\.paystack\.com/, { timeout: 90_000 })
  await fillPaystackTestCard(page)

  await page.waitForURL(url =>
    url.origin === 'http://127.0.0.1:5173' && url.pathname === '/verify',
  { timeout: 120_000 })
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible()
  await expect(page.getByText('ORD-439099')).toBeVisible()
})

async function fillPaystackTestCard(page) {
  const cardNumber = await visiblePaystackField(
    page,
    'input[autocomplete="cc-number"], input[name*="card" i], input[placeholder*="card number" i]'
  )
  const expiry = await visiblePaystackField(
    page,
    'input[autocomplete="cc-exp"], input[name*="expiry" i], input[placeholder*="MM/YY" i], input[placeholder*="MM / YY" i]'
  )
  const cvv = await visiblePaystackField(
    page,
    'input[autocomplete="cc-csc"], input[name*="cvv" i], input[placeholder*="CVV" i], input[placeholder*="CVC" i]'
  )

  await cardNumber.fill('4084084084084081')
  await expiry.fill('12/30')
  await cvv.fill('408')

  const submitButton = page.getByRole('button', { name: /pay|complete payment|continue/i }).last()
  await submitButton.click()
}

async function visiblePaystackField(page, selector) {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      const field = frame.locator(selector).first()
      if (await field.isVisible().catch(() => false)) return field
    }
    await page.waitForTimeout(250)
  }
  throw new Error(`Paystack checkout field not found: ${selector}`)
}
