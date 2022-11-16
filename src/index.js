import * as debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';
const axios = require('axios').default;

class Gallery {
  DEBOUNCE_DELAY = 300;

  constructor({ searchForm, gallery }) {
    this.searchForm = searchForm;
    this.gallery = gallery;
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    // console.log('this.searchForm ', this.searchForm);
    // console.log('this.gallery = gallery; ', this.gallery);
    this.getImages();
  }

  getImages() {
    this.fetchImages()
      .then(console.log)
      .catch(error => {
        Notify.failure(error.message);
      });

    this.fetchImagesA()
      .then(console.log)
      .catch(error => {
        Notify.failure(error.message);
      });
  }

  async fetchImagesA() {
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=31303071-b4e5345642141d1af1d763c20&q=yellow+flowers&image_type=photo`
      );
      console.log('response axios ->', response);

      const data = await response.data;
      console.log('data ->', data);

      const dataArr = await data.hits;
      console.log('dataArr ->', dataArr);

      return dataArr;
    } catch (error) {
      console.error(error);
    }
  }

  fetchImages() {
    return fetch(
      `https://pixabay.com/api/?key=31303071-b4e5345642141d1af1d763c20&q=yellow+flowers&image_type=photo`
    ).then(response => {
      console.log('response ', response);
      if (!response.ok) {
        throw new Error('Oops, there is no country with that name');
      }

      return response.json();
    });
  }
}

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

new Gallery(refs).init();
