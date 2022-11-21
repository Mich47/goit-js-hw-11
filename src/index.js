import * as throttle from 'lodash.throttle';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';
import svg from './img/icons.svg';
const axios = require('axios').default;
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

class Gallery {
  THROTTLE_DELAY = 200;
  PER_PAGE_COUNT = 40;
  ORIENTATION = '&orientation=horizontal';
  SAFE_SEARCH = '&safesearch=true';
  IMAGE_TYPE = '&image_type=photo';

  constructor({ searchForm, gallery }, URI) {
    this.searchForm = searchForm;
    this.gallery = gallery;
    this.URI = URI;
    this.QUERY - null;
    this.gallerySimple = null;
    this.totalHits = 1;
    this.page = 1;
    this.clickHandler = null;

    // Если отправили запрос, но ещё не получили ответ,
    // не нужно отправлять ещё один запрос:
    this.isLoading = false;

    // Если контент закончился, вообще больше не нужно
    // отправлять никаких запросов:
    this.shouldLoad = true;
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    this.searchForm.addEventListener('submit', this.onSearchForm.bind(this));
    this.gallery.addEventListener('click', this.onGalleryImageClick.bind(this));
  }

  addScrollListeners() {
    this.clickHandler = throttle(
      this.checkScrollPosition.bind(this),
      this.THROTTLE_DELAY
    );

    window.addEventListener('scroll', this.clickHandler);
  }

  removeScrollListeners() {
    window.removeEventListener('scroll', this.clickHandler);
  }

  onGalleryImageClick(event) {
    event.preventDefault();
  }

  async onSearchForm(event) {
    event.preventDefault();
    this.QUERY = `&q=${event.target.elements.searchQuery.value}`;
    this.removeScrollListeners();

    this.shouldLoad = true;

    await this.clearGallery();
    await this.setStartValue(event);
    await this.getImages();
    await this.addScrollListeners();

    this.createSimpleLightbox();
    this.refreshSimpleLightbox();
  }

  async getImages() {
    if (this.isLoading || !this.shouldLoad) return;

    this.isLoading = true;

    try {
      const imagesArr = await this.fetchImages();

      this.isLoading = false;

      if (imagesArr.length === 0) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      this.page += 1;
      this.markupGallery(imagesArr);

      this.refreshSimpleLightbox();

      this.checkMaxPageLoad();
    } catch (error) {
      Notify.failure(error.message);
    }
  }

  async fetchImages() {
    const PER_PAGE = `&per_page=${this.PER_PAGE_COUNT}`;
    const PAGE = `&page=${this.page}`;
    const URI =
      this.URI +
      this.ORIENTATION +
      this.SAFE_SEARCH +
      this.IMAGE_TYPE +
      this.QUERY +
      PER_PAGE +
      PAGE;

    try {
      const response = await axios.get(URI);

      this.totalHits = Math.ceil(response.data.totalHits / this.PER_PAGE_COUNT);

      if (this.page === 1 && this.totalHits) {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
      }

      return response.data.hits;
    } catch (error) {
      console.error(error);
    }
  }

  checkMaxPageLoad() {
    if (this.totalHits === 1) {
      this.removeScrollListeners();
      this.shouldLoad = false;
      return;
    }

    if (this.page > this.totalHits) {
      this.removeScrollListeners();
      this.shouldLoad = false;

      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }

  setStartValue(event) {
    this.totalHits = 1;
    this.page = 1;
  }

  createSimpleLightbox() {
    if (!this.gallerySimple) {
      this.gallerySimple = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
        scrollZoom: false,
      });
    }
  }

  refreshSimpleLightbox() {
    if (this.gallerySimple) {
      this.gallerySimple.refresh();
    }
  }

  checkScrollPosition() {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    // console.log(scrollHeight); // Висота всього документа в пікселях
    // console.log(scrollTop); // Скрол від верху в пікселях
    // console.log(clientHeight); // Висота вьюпорта

    // Обозначим порог, по приближении к которому
    // будем вызывать какое-то действие.
    // В нашем случае — половина экрана до конца страницы:
    const threshold = scrollHeight - clientHeight / 2;
    // Отслеживаем, где находится низ экрана относительно страницы:
    const position = scrollTop + clientHeight;

    if (position >= threshold) {
      this.getImages();
    }
  }

  clearGallery() {
    this.gallery.innerHTML = '';
  }

  markupGallery(dataArr) {
    this.gallery.insertAdjacentHTML(
      'beforeend',
      dataArr.map(this.markupFotoCard.bind(this)).join('')
    );
  }

  markupFotoCard(imgObj) {
    return `<div class="gallery__item">
      <div class="gallery__thumb">
        <a class="gallery__link" href="${imgObj.largeImageURL}">
          <img
            class="gallery__image"
            src="${imgObj.webformatURL}"
            alt="${imgObj.tags}"
          />
        </a>
        <div class="gallery__image-overlay">
          ${this.markupInfoList(imgObj)}
        </div>
      </div>
    </div>`;
  }

  markupInfoList({ likes, views, comments, downloads }) {
    return `<ul class="list info-list">
      <li class="info-item" title="Likes">
        <svg class="icon" width="16" height="16">
          <use href="${svg}#icon-like"></use>
        </svg>
        <p class="info-desc">${likes}</p>
      </li>
      <li class="info-item" title="Views">
        <svg class="icon" width="16" height="16">
          <use href="${svg}#icon-view"></use>
        </svg>
        <p class="info-desc">${views}</p>
      </li>
      <li class="info-item" title="Comments">
        <svg class="icon" width="16" height="16">
          <use href="${svg}#icon-comment"></use>
        </svg>
        <p class="info-desc">${comments}</p>
      </li>
      <li class="info-item" title="Downloads">
        <svg class="icon" width="16" height="16">
          <use href="${svg}#icon-download"></use>
        </svg>
        <p class="info-desc">${downloads}</p>
      </li>
    </ul>`;
  }
}

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const APIKey = '31303071-b4e5345642141d1af1d763c20';
const URI = `https://pixabay.com/api/?key=${APIKey}`;

new Gallery(refs, URI).init();
