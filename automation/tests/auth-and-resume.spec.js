import { test, expect } from '@playwright/test';

const API = 'http://mock-api.test';
const user = { _id: 'u1', name: 'Aditi', email: 'aditi@example.com' };
const json = (route, status, body) =>
  route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: JSON.stringify(body) });

// Handles CORS preflight so mocked responses reach the app
async function mockApi(page, handlers) {
  await page.route(`${API}/**`, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    const key = `${req.method()} ${new URL(req.url()).pathname}`;
    const h = handlers[key];
    return h ? h(route, req) : json(route, 404, { message: `Unmocked: ${key}` });
  });
}

test('AUTO-001 Login with valid credentials opens the dashboard', async ({ page }) => {
  await mockApi(page, {
    'POST /api/users/login': (r) => json(r, 200, { message: 'Login successful', token: 'test-token', user }),
    'GET /api/users/resumes': (r) => json(r, 200, { resumes: [] }),
  });
  await page.goto('/app');
  await page.getByPlaceholder('Email').fill('aditi@example.com');
  await page.getByPlaceholder('Password').fill('Test@1234');
  await page.getByRole('button', { name: /login/i }).last().click();
  await expect(page.getByText('Login successful')).toBeVisible();
  await expect(page.getByText('Create Resume').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('AUTO-002 Login with wrong password shows error and stays signed out', async ({ page }) => {
  await mockApi(page, {
    'POST /api/users/login': (r) => json(r, 400, { message: 'Invalid email or password' }),
  });
  await page.goto('/app');
  await page.getByPlaceholder('Email').fill('aditi@example.com');
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: /login/i }).last().click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
  await expect(page.getByPlaceholder('Password')).toBeVisible();
});

test('AUTO-003 Creating a resume with a title opens the resume builder', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'test-token'));
  await mockApi(page, {
    'GET /api/users/data': (r) => json(r, 200, { user }),
    'GET /api/users/resumes': (r) => json(r, 200, { resumes: [] }),
    'POST /api/resumes/create': (r, req) => {
      const { title } = req.postDataJSON();
      return json(r, 201, { message: 'Resume created successfully', resume: { _id: 'r1', title } });
    },
    'GET /api/resumes/get/r1': (r) => json(r, 200, { resume: { _id: 'r1', title: 'Aditi QA Resume', personal_info: {}, experience: [], education: [], project: [], skills: [], template: 'classic', accent_color: '#3B82F6', public: false } }),
  });
  await page.goto('/app');
  await page.getByRole('button', { name: 'Create Resume' }).first().click();
  await page.getByPlaceholder('Enter resume title').fill('Aditi QA Resume');
  await page.locator('form').getByRole('button', { name: 'Create Resume' }).click();
  await expect(page).toHaveURL(/\/app\/builder\/r1$/);
});
