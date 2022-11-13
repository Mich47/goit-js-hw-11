export function fetchCountries(name) {
  return fetch(`https://restcountries.com/v3.1/name/${name}`).then(response => {
    if (!response.ok) {
      throw new Error('Oops, there is no country with that name');
    }

    return response.json();
  });
}
