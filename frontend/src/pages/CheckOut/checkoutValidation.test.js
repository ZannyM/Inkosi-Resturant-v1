import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citiesForProvince, validateCheckout } from './checkoutValidation.js';

const valid = {
  firstName: 'Anne-Marie', lastName: "O'Connor", email: 'anne@example.co.za',
  phone: '0821234567', street: '45 Helen Joseph Street', city: 'Johannesburg',
  province: 'Gauteng', zipcode: '2001', country: 'South Africa'
};

test('accepts a plausible South African checkout address', () => {
  assert.deepEqual(validateCheckout(valid), {});
  assert.deepEqual(validateCheckout({ ...valid, firstName: 'Nomsa', phone: '27821234567' }), {});
  assert.deepEqual(validateCheckout({ ...valid, street: 'Helen Joseph Street' }), {});
});

test('rejects invalid names, emails, phone numbers and street characters', () => {
  const errors = validateCheckout({ ...valid, firstName: 'Jane3', lastName: 'Doe!', email: 'a@@gmail.com', phone: '082-1234567', street: '12 Main St!' });
  for (const field of ['firstName', 'lastName', 'email', 'phone', 'street']) assert.ok(errors[field], field);
});

test('checks country, province, city and postcode', () => {
  const errors = validateCheckout({ ...valid, country: 'Botswana', province: 'Western Cape', city: 'Johannesburg', zipcode: 'ABC' });
  for (const field of ['country', 'city', 'zipcode']) assert.ok(errors[field], field);
  assert.ok(citiesForProvince('Gauteng').includes('Soweto'));
  assert.deepEqual(citiesForProvince('Unknown'), []);
});

test('requires a street name and rejects special characters', () => {
  for (const street of ['123', 'Main Street!', '2/45 Main Street', '']) {
    assert.ok(validateCheckout({ ...valid, street }).street, street);
  }
});