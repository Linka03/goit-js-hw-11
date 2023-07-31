import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";

const API_KEY = '38570317-b94636c34292c085865999cc0';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 40;

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;

async function searchImages(query) {
  try {
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`);
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

function renderImageCards(images) {
  images.forEach(image => {
    const card = createImageCard(image);
    galleryContainer.appendChild(card);
  });
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  currentPage = 1;
  galleryContainer.innerHTML = '';

  try {
    const images = await searchImages(searchQuery);
    const totalHits = images.length;

    if (totalHits === 0) {
      Notiflix.Notify.warning('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderImageCards(images);

    if (totalHits < ITEMS_PER_PAGE) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("You've reached the end of search results.");
    } else {
      loadMoreBtn.style.display = 'block';
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
  }
}

async function handleLoadMore() {
  currentPage++;
  const searchQuery = searchForm.elements.searchQuery.value.trim();

  try {
    const images = await searchImages(searchQuery);
    const totalHits = images.length;

    if (totalHits === 0) {
      Notiflix.Notify.warning('No more images to load.');
      loadMoreBtn.style.display = 'none';
      return;
    }

    renderImageCards(images);

    if (totalHits < ITEMS_PER_PAGE) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("You've reached the end of search results.");
    }
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
  }
}

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);
