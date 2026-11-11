import southAfrica from '@geomelon/south-africa';

export const provinces = southAfrica.regions().sort((first, second) => first.name.localeCompare(second.name));

export const citiesForProvince = (province) => {
  const state = provinces.find((item) => item.name === province);
  if (!state) return [];
  return [...new Set(southAfrica.cities({ regionId: state.id }).map((city) => city.name))]
    .sort((first, second) => first.localeCompare(second));
};

export const validateCheckout = (data) => {
  const errors = {};
  const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
  for (const field of ['firstName', 'lastName']) {
    if (!namePattern.test(data[field].trim())) {
      errors[field] = 'Use letters, spaces, apostrophes or hyphens.';
    }
  }

  if (!/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!/^(?:0\d{9}|27\d{9})$/.test(data.phone)) {
    errors.phone = 'Enter a South African phone number with 10 digits, or 27 followed by 9 digits.';
  }
  const street = data.street.trim();
  if (!/^[\p{L}\p{M}\d\s]+$/u.test(street) || !/\p{L}/u.test(street)) {
    errors.street = 'Enter a street address using letters, numbers and spaces only.';
  }
  if (!provinces.some((province) => province.name === data.province)) {
    errors.province = 'Select a South African province.';
  }
  if (!citiesForProvince(data.province).includes(data.city)) {
    errors.city = 'Select a city in the chosen province.';
  }
  if (!/^\d{4}$/.test(data.zipcode)) {
    errors.zipcode = 'Enter a four-digit South African postal code.';
  }
  if (data.country.trim().toLowerCase() !== 'south africa') {
    errors.country = 'Delivery is currently available only in South Africa.';
  }
  return errors;
};