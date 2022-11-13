import * as debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';
import { fetchCountries } from './fetchCountries';

class CountrysInfo {
  DEBOUNCE_DELAY = 300;

  constructor({ input, countryList, countryInfo }) {
    this.input = input;
    this.countryList = countryList;
    this.countryInfo = countryInfo;
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    this.input.addEventListener(
      'input',
      debounce(this.onInput.bind(this), this.DEBOUNCE_DELAY)
    );
    this.input.addEventListener('keydown', this.onInputEnter.bind(this));
    this.countryList.addEventListener('click', this.onClick.bind(this));
  }

  onInput(event) {
    const inputValue = event.target.value.trim();
    if (!inputValue) {
      this.clearCountry(); //Clear
      return;
    }

    this.getCountries(inputValue);
  }

  onInputEnter(event) {
    if (event.code != 'Enter' && event.code != 'NumpadEnter') {
      return;
    }
    this.onInput(event);
  }

  onClick(event) {
    if (event.target.nodeName === 'UL') {
      return;
    }

    if (event.target.nodeName === 'IMG') {
      this.getCountries(event.target.parentNode.innerText);
      return;
    }

    this.getCountries(event.target.innerText);
  }

  getCountries(inputValue) {
    fetchCountries(inputValue)
      .then(this.getCountriesData.bind(this))
      .catch(error => {
        this.clearCountry(); //Clear
        Notify.failure(error.message);
      });
  }

  getCountriesData(data) {
    // console.log('data ', data);
    if (data.length > 10) {
      this.clearCountry(); //Clear
      Notify.info('Too many matches found. Please enter a more specific name.');
      return null;
    }
    if (data.length === 1) {
      this.addCountryList(data);
      this.addCountryInfo(data);
      return null;
    }

    this.clearCountry(); //Clear
    this.addCountryList(data);
  }

  getCountryListMarkup(data) {
    return data
      .map(({ flags: { svg }, name: { official } }) => {
        return `
        <li class="country-item">
          <img src="${svg}" width="60">
          <div>
          <p>${official}</p>
          </div>
        </li>`;
      })
      .join('');
  }

  getCountryInfoMarkup(data) {
    return data
      .map(({ name: { common }, capital, population, languages }) => {
        return `
        <div>
          <p>Common Name: <span>${common}</span></p>
          <p>Capital: <span>${capital}</span></p>
          <p>Population: <span>${population}</span></p>
          <p>Languages: <span>${Object.values(languages).join(', ')}</span></p>
        </div>`;
      })
      .join('');
  }

  addCountryList(data) {
    this.countryList.innerHTML = this.getCountryListMarkup(data);
  }

  addCountryInfo(data) {
    this.countryInfo.innerHTML = this.getCountryInfoMarkup(data);
  }

  clearCountry() {
    this.countryList.innerHTML = '';
    this.countryInfo.innerHTML = '';
  }
}

const refs = {
  input: document.querySelector('[id="search-box"]'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

new CountrysInfo(refs).init();
