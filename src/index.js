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
    this.gallerySimple = null;
    this.totalHits = 1;
    this.page = 1;
    this.clickHandler = null;
    this.QUERY - null;

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

  setStartValue(event) {
    this.totalHits = 1;
    this.page = 1;
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

  onGalleryImageClick(event) {
    event.preventDefault();

    // if (!event.target.classList.contains('gallery__image')) {
    //   return;
    // }
  }

  async getImages() {
    if (this.isLoading || !this.shouldLoad) return;
    this.isLoading = true;

    try {
      const imagesArr = await this.fetchImages();

      if (imagesArr.length === 0) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      this.page += 1;
      this.markupGallery(imagesArr);

      this.refreshSimpleLightbox();

      this.isLoading = false;

      this.checkMaxPageLoad();
    } catch (error) {
      Notify.failure(error.message);
    }
  }

  checkMaxPageLoad() {
    if (this.page > this.totalHits) {
      this.removeScrollListeners();
      this.shouldLoad = false;

      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
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
    console.log('URI ', URI);
    try {
      const response = await axios.get(URI);

      this.totalHits = Math.floor(
        response.data.totalHits / this.PER_PAGE_COUNT
      );
      // console.log('this.total ', this.totalHits);
      // console.log('page ', this.page);

      // const dataArr = response.data.hits;
      // console.log('dataArr ->', dataArr);

      // return dataArr;
      return response.data.hits;
    } catch (error) {
      console.error(error);
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

  smoothScroll() {
    console.log(
      'object',
      document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect()
    );

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    console.log('cardHeight ', cardHeight);
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }

  clearGallery() {
    this.gallery.innerHTML = '';
  }

  markupGallery(dataArr) {
    // this.gallery.append(...dataArr.map(this.markupFotoCard.bind(this)));
    this.gallery.insertAdjacentHTML(
      'beforeend',
      dataArr.map(this.markupFotoCard.bind(this)).join('')
    );
  }

  markupFotoCard(imgObj) {
    // const div = document.createElement('div');
    // div.classList.add('gallery-item');

    // const divThumb = document.createElement('div');
    // divThumb.classList.add('gallery-thumb');

    // const img = document.createElement('img');
    // img.classList.add('gallery-img');
    // img.src = imgObj.webformatURL;
    // img.alt = imgObj.tags;

    // const divOverlay = document.createElement('div');
    // divOverlay.classList.add('gallery-img-overlay');

    // divOverlay.append(this.markupInfoList(imgObj));
    // divThumb.append(img, divOverlay);
    // div.append(divThumb);
    // return div;

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
    // const info = [
    //   {
    //     title: 'Likes',
    //     infoSvg: `${svg}#icon-like`,
    //     infoDesc: likes,
    //   },
    //   {
    //     title: 'Views',
    //     infoSvg: `${svg}#icon-view`,
    //     infoDesc: views,
    //   },
    //   {
    //     title: 'Comments',
    //     infoSvg: `${svg}#icon-comment`,
    //     infoDesc: comments,
    //   },
    //   {
    //     title: 'Downloads',
    //     infoSvg: `${svg}#icon-download`,
    //     infoDesc: downloads,
    //   },
    // ];
    // const ul = document.createElement('ul');
    // ul.classList.add('list', 'info-list');

    // const markupInfo = info.map(item => this.markupInfoItem(item));

    // ul.append(...markupInfo);
    // console.log('ul -> ', ul);
    // return ul;

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

  markupInfoItem({ title, infoSvg, infoDesc }) {
    const li = document.createElement('li');
    li.classList.add('info-item');
    li.title = title;

    const svg = document.createElement('svg');
    svg.classList.add('icon');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const use = document.createElement('use');
    use.setAttribute('href', infoSvg);

    const p = document.createElement('p');
    p.classList.add('info-desc');
    p.textContent = infoDesc;

    svg.append(use);
    li.append(svg, p);

    return li;
  }
}

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const APIKey = '31303071-b4e5345642141d1af1d763c20';
const URI = `https://pixabay.com/api/?key=${APIKey}`;

new Gallery(refs, URI).init();

// let gallerySimple = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });
