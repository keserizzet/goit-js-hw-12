import './css/styles.css';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = '48180440-b38c1b4d4768984d9404c0701';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');

let lightbox;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    iziToast.error({ title: 'Error', message: 'Please enter a search term!' });
    return;
  }


  loader.classList.remove('hidden');
  gallery.innerHTML = '';

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });

    const images = response.data.hits;

    if (images.length === 0) {
      iziToast.warning({
        title: 'No Results',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    const markup = images
      .map(
        (img) => `
       <a href="${img.largeImageURL}" class="gallery-item">
          <img src="${img.webformatURL}" alt="${img.tags}" />
        </a>
        <div class="info">
          <p><strong>Tags:</strong> ${img.tags}</p>
          <p><strong>Likes:</strong> ${img.likes}</p>
          <p><strong>Views:</strong> ${img.views}</p>
          <p><strong>Comments:</strong> ${img.comments}</p>
          <p><strong>Downloads:</strong> ${img.downloads}</p>
        </div>`
      )
      .join('');

    gallery.innerHTML = markup;

    if (!lightbox) {
      lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
    } else {
      lightbox.refresh();
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Something went wrong!' });
  } finally {

    loader.classList.add('hidden');
  }
});
