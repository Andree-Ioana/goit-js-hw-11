import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

const apiKey = "42271734-ccd5724e9f8ad9dee5c32e4fe";
const baseUrl = "https://pixabay.com/api/";
const perPage = 40;

const gallery = document.querySelector(".gallery");
const searchForm = document.getElementById("search-form");
const loadMoreButton = document.querySelector(".load-more");

let currentPage = 1;
let currentQuery = '';
let isFirstSearch = true;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  history: false,
});

function displayImages(images) {
  gallery.innerHTML = "";

  images.forEach(imageData => {
    const card = createPhotoCard(imageData);
    gallery.appendChild(card);
  });

  lightbox.refresh();

  if (images.length === perPage) {
    loadMoreButton.style.display = "block";
  } else {
    loadMoreButton.style.display = "none";
  }

  if (isFirstSearch) {
    window.alert(`Hooray! Am găsit ${images.length} imagini.`);
    isFirstSearch = false;
  }
}

function createPhotoCard(photoData) {
  const card = document.createElement("div");
  card.classList.add("photo-card");

  const imageLink = document.createElement("a");
  imageLink.href = photoData.largeImageURL;
  imageLink.dataset.lightbox = "gallery";

  const image = document.createElement("img");
  image.src = photoData.webformatURL;
  image.alt = photoData.tags;
  image.loading = "lazy";
  imageLink.appendChild(image);

  card.appendChild(imageLink);

  const info = document.createElement("div");
  info.classList.add("info");

  const infoItems = [
    { label: "Aprecieri", value: photoData.likes },
    { label: "Vizualizări", value: photoData.views },
    { label: "Comentarii", value: photoData.comments },
    { label: "Descărcări", value: photoData.downloads }
  ];

  infoItems.forEach(item => {
    const itemElement = document.createElement("p");
    itemElement.classList.add("info-item");
    itemElement.innerHTML = `<b>${item.label}</b>: ${item.value}`;
    info.appendChild(itemElement);
  });

  card.appendChild(info);

  return card;
}

async function fetchImages(query, page = 1) {
  try {
    const response = await axios.get(baseUrl, {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage
      },
    });

    return response.data.hits;
  } catch (error) {
    console.error('Eroare la preluarea imaginilor:', error);
    window.alert('A apărut o eroare la preluarea imaginilor. Te rugăm să încerci din nou mai târziu.');
    return [];
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    window.alert('Te rugăm să introduci un termen de căutare.');
    return;
  }

  currentPage = 1;
  currentQuery = searchQuery;
  isFirstSearch = true;
  const images = await fetchImages(searchQuery);
  if (images.length > 0) {
    displayImages(images);
  } else {
    window.alert('Ne pare rău, nu am găsit imagini care să corespundă căutării tale. Te rugăm să încerci din nou.');
  }
});

loadMoreButton.addEventListener("click", async () => {
  currentPage++;
  const images = await fetchImages(currentQuery, currentPage);
  if (images.length > 0) {
    const currentScrollPos = window.scrollY;
    displayImages(images);
    window.scrollTo(0, currentScrollPos);
  } else {
    window.alert("Ne pare rău, ai ajuns la sfârșitul rezultatelor de căutare.");
  }
});

// Funcția preloader
const preloader = document.querySelector('.preloader');

const fadeEffect = () => {
  setInterval(() => {
    if (!preloader.style.opacity) {
      preloader.style.opacity = 1;
    }
    if (preloader.style.opacity > 0) {
      preloader.style.opacity -= 0.1;
    } else {
      clearInterval(fadeEffect);
      preloader.remove();
    }
  }, 200);
};

fadeEffect();

