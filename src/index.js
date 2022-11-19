import * as debounce from 'lodash.debounce';
import * as throttle from 'lodash.throttle';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';
import svg from './img/icons.svg';
const axios = require('axios').default;
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

class Gallery {
  DEBOUNCE_DELAY = 300;
  THROTTLE_DELAY = 200;

  constructor({ searchForm, gallery }) {
    this.searchForm = searchForm;
    this.gallery = gallery;
    this.totalHits = 1;
    this.page = 1;
    this.searchValue = null;
    this.clickHandler = null;
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    this.searchForm.addEventListener('submit', this.onSearchForm.bind(this));
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
    this.searchValue = event.target.elements.searchQuery.value;
  }

  onSearchForm(event) {
    event.preventDefault();

    this.clearGallery();
    this.setStartValue(event);
    this.getImages();
    this.addScrollListeners();
  }

  async getImages() {
    let imagesArr = null;
    try {
      imagesArr = await this.fetchImages(this.searchValue, this.page);

      if (!imagesArr) {
        return;
      }

      if (imagesArr.length === 0) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      this.page += 1;
      this.markupGallery(imagesArr);
    } catch (error) {
      Notify.failure(error.message);
    }
  }

  async fetchImages(queryName, page) {
    if (this.page > this.totalHits) {
      this.removeScrollListeners();

      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
      return null;
    }
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=31303071-b4e5345642141d1af1d763c20&orientation=horizontal&safesearch=true&image_type=photo&per_page=40&q=${queryName}&page=${page}`
      );
      console.log('response axios ->', response);

      this.totalHits = Math.ceil(response.data.totalHits / 40);
      console.log('this.total ', this.totalHits);
      console.log('page ', page);

      const dataArr = response.data.hits;
      console.log('dataArr ->', dataArr);

      return dataArr;
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

  clearGallery() {
    this.gallery.innerHTML = '';
  }

  markupGallery(dataArr) {
    this.gallery.append(...dataArr.map(this.markupFotoCard.bind(this)));
    // this.gallery.insertAdjacentHTML(
    //   'beforeend',
    //   dataArr.map(this.markupFotoCard.bind(this)).join('')
    // );
  }

  markupFotoCard(imgObj) {
    const div = document.createElement('div');
    div.classList.add('gallery-item');

    const divThumb = document.createElement('div');
    divThumb.classList.add('gallery-thumb');

    const img = document.createElement('img');
    img.classList.add('gallery-img');
    img.src = imgObj.webformatURL;
    img.alt = imgObj.tags;

    const divOverlay = document.createElement('div');
    divOverlay.classList.add('gallery-img-overlay');

    divOverlay.append(this.markupInfoList(imgObj));
    divThumb.append(img, divOverlay);
    div.append(divThumb);
    return div;

    return `<div class="gallery-item">
      <div class="gallery-thumb">
        <img
          class="gallery-img"
          src="${imgObj.webformatURL}"
          alt="${imgObj.tags}"
        />
        <div class="gallery-img-overlay">
          ${this.markupInfoList(imgObj)}
        </div>
      </div>
    </div>`;
  }

  markupInfoList({ likes, views, comments, downloads }) {
    console.log('infoSvg: ', svg);
    const info = [
      {
        title: 'Likes',
        infoSvg: `${svg}#icon-like`,
        infoDesc: likes,
      },
      {
        title: 'Views',
        infoSvg: `${svg}#icon-view`,
        infoDesc: views,
      },
      {
        title: 'Comments',
        infoSvg: `${svg}#icon-comment`,
        infoDesc: comments,
      },
      {
        title: 'Downloads',
        infoSvg: `${svg}#icon-download`,
        infoDesc: downloads,
      },
    ];
    const ul = document.createElement('ul');
    ul.classList.add('list', 'info-list');

    const markupInfo = info.map(item => this.markupInfoItem(item));

    ul.append(...markupInfo);
    console.log('ul -> ', ul);
    return ul;

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

new Gallery(refs).init();
