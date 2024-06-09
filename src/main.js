import './css/styles.css';
import PixabayApi from './js/pixabay-api';
import { onRenderGallery } from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
  


const refs = {
  searchform: document.querySelector('.form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-btn'),
  loader: document.createElement('div'),
};



refs.loader.className = 'loader';
document.body.appendChild(refs.loader);

refs.loadMoreBtn.style.display = 'none';

const pixabayApi = new PixabayApi();
let totalHits = 0;
let loadedHits = 0;

refs.searchform.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(event) {
  event.preventDefault();

  const query = event.currentTarget.elements.query.value.trim();
  if (!query) {
    return showToast('red', 'Please, fill the main field', 'topRight');
  }

  showLoader();
  refs.galleryContainer.innerHTML = '';
  refs.loadMoreBtn.style.display = 'none';
  pixabayApi.query = query;
  pixabayApi.resetPage();

  fetchAndRenderImages(true);
}

async function onLoadMore() {
  showLoader();
  await fetchAndRenderImages(false);
  smoothScroll();
}

async function fetchAndRenderImages(isNewSearch) {
  try {
    const data = await pixabayApi.fetchPhoto();
    if (data.hits.length === 0) {
      showToast(
        'red',
        'Sorry, there are no images matching your search query. Please try again!',
        'topRight'
      );
    } else {
      onRenderGallery(data.hits, refs.galleryContainer);
      totalHits = isNewSearch ? data.totalHits : totalHits;
      loadedHits = isNewSearch ? data.hits.length : loadedHits + data.hits.length;

      if (loadedHits >= totalHits) {
        refs.loadMoreBtn.style.display = 'none';
        showToast(
          'blue',
          "We're sorry, but you've reached the end of search results.",
          'topRight'
        );
      } else {
        refs.loadMoreBtn.style.display = 'block';
      }
    }
  } catch (error) {
    showToast(
      'red',
      'An error occurred while fetching images. Please try again later.',
      'topRight'
    );
  } finally {
    hideLoader();
  }
}

function showToast(color, message, position = 'topRight') {
  iziToast.show({
    color: color,
    message: message,
    position: position,
  });
}

function showLoader() {
  refs.loader.style.display = 'block';
}

function hideLoader() {
  refs.loader.style.display = 'none';
}

function smoothScroll() {
  const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}