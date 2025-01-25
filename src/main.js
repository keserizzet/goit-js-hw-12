const API_KEY = "48180440-b38c1b4d4768984d9404c0701";
const BASE_URL = "https://pixabay.com/api/";

const form = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const gallery = document.getElementById("gallery");
const loadMoreButton = document.getElementById("load-more");
const loader = document.getElementById("loader");
const endMessage = document.getElementById("end-message");

let currentQuery = "";
let currentPage = 1;
let totalHits = 0;
let lightbox = null;

const fetchImages = async (query, page = 1) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: 20,
        page: page,
      },
    });

    return response.data;
  } catch (error) {
    iziToast.error({
      title: "Error",
      message: "Failed to fetch images. Please try again later.",
    });
    console.error("API Error:", error);
    return { hits: [], totalHits: 0 };
  }
};

const renderGallery = (images) => {
  const markup = images
    .map(
      (img) => `
      <a href="${img.largeImageURL}" class="gallery-item">
        <img src="${img.webformatURL}" alt="${img.tags}" />
        <div class="info">
          <p><strong>Tags:</strong> ${img.tags}</p>
          <p><strong>Likes:</strong> ${img.likes}</p>
          <p><strong>Views:</strong> ${img.views}</p>
          <p><strong>Comments:</strong> ${img.comments}</p>
          <p><strong>Downloads:</strong> ${img.downloads}</p>
        </div>
      </a>
    `
    )
    .join("");

  gallery.insertAdjacentHTML("beforeend", markup);

  if (!lightbox) {
    lightbox = new SimpleLightbox(".gallery-item", {
      captionsData: "alt",
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  currentQuery = searchInput.value.trim();
  if (!currentQuery) {
    iziToast.error({ title: "Error", message: "Please enter a search term!" });
    return;
  }

  currentPage = 1;
  gallery.innerHTML = "";
  loadMoreButton.classList.add("hidden");
  endMessage.classList.add("hidden");
  loader.classList.remove("hidden");

  const { hits, totalHits: hitsCount } = await fetchImages(currentQuery, currentPage);
  loader.classList.add("hidden");

  totalHits = hitsCount;

  if (hits.length === 0) {
    iziToast.warning({
      title: "No Results",
      message: "No images found. Please try a different query.",
    });
    return;
  }

  renderGallery(hits);

  if (hits.length < totalHits) {
    loadMoreButton.classList.remove("hidden");
  }
});

loadMoreButton.addEventListener("click", async () => {
  currentPage += 1;
  loader.classList.remove("hidden");

  const { hits } = await fetchImages(currentQuery, currentPage);
  loader.classList.add("hidden");

  renderGallery(hits);

  const galleryHeight = document.querySelector(".gallery-item").getBoundingClientRect().height;
  window.scrollBy({ top: galleryHeight * 2, behavior: "smooth" });

  if (currentPage * 40 >= totalHits) {
    loadMoreButton.classList.add("hidden");
    endMessage.classList.remove("hidden");
  }
});
