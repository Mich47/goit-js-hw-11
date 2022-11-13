import * as debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';

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
    console.log('this.searchForm ', this.searchForm);
    console.log('this.gallery = gallery; ', this.gallery);
    this.getImages();
  }

  getImages() {
    this.fetchImages()
      .then(console.log)
      .catch(error => {
        Notify.failure(error.message);
      });
  }

  fetchImages() {
    return fetch(
      `https://pixabay.com/api/?key=31303071-b4e5345642141d1af1d763c20&q=yellow+flowers&image_type=photo`
    ).then(response => {
      if (!response.ok) {
        console.log('response ', response);
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
