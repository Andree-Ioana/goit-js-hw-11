import axios from 'axios';
import Notiflix from 'notiflix';

const apiKey = "42271734-ccd5724e9f8ad9dee5c32e4fe";
const baseUrl = "https://pixabay.com/api/";

const gallery = document.querySelector(".gallery");
const searchForm = document.getElementById("search-form");
const loadMoreButton = document.querySelector(".load-more");
let currentPage = 1;

// Funcția de căutare a imaginilor
async function searchImages(query, page = 1){
    try {
        const response = await axios.get(baseUrl, {
            params:{
                key: apiKey,
                q: query,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: page, // Adăugăm parametrul pentru pagina curentă
                per_page: 40 // Numărul de imagini pe pagină
            },
        });
        // hits = proprietatea primita de la response.data
        const {hits, totalHits} = response.data;
        if(hits.length === 0){
            window.alert('Sorry, there are no images matching your search query. Please try again.');
            return {images: [], totalHits: 0};
        }
        const images = hits.map(hit => ({
            webformatURL : hit.webformatURL ,
            largeImageURL : hit.largeImageURL ,
            tags: hit.tags,
            likes: hit.likes,
            views: hit.views,
            comments: hit.comments,
            downloads: hit.downloads,
        }));
        return {images, totalHits};
            
    } catch(err){
        console.error('Error fetching images:', error);
        window.alert('An error occurred while fetching images. Please try again later.');
        return {images: [], totalHits: 0};
    }
}

// Funcția de creare a cardului pentru imagine
function createPhotoCard(photoData){
    const card = document.createElement("div");
    card.classList.add("photo-card");

    const image = document.createElement("img");
    image.src = photoData.webformatURL;
    image.alt = photoData.tags;
    image.loading = "lazy";
    card.appendChild(image);

    const info = document.createElement("div");
    info.classList.add("info");

    const infoItems = [
        {label: "Likes", value: photoData.likes},
        {label: "Views", value: photoData.views},
        {label: "Comments", value: photoData.comments},
        {label: "Downloads", value: photoData.downloads}
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

// Funcția de afișare a imaginilor în galerie
async function displayImages(query) {
    gallery.innerHTML = ""; // Curăță galeria pentru a afișa noile rezultate
    currentPage = 1; // Resetează pagina curentă la 1

    const {images, totalHits} = await searchImages(query);

    images.forEach((imageData) => {
        const card = createPhotoCard(imageData);
        gallery.appendChild(card);
    });

    // Verificăm dacă trebuie să afișăm butonul "Load more"
    if (gallery.children.length < totalHits) {
        loadMoreButton.style.display = "block";
    } else {
        loadMoreButton.style.display = "none";
    }

    // Afișăm notificarea cu numărul total de imagini găsite
    window.alert(`Hooray! We found ${totalHits} images.`);
}

// Ascultătorul de eveniment pentru formularul de căutare
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Previne comportamentul implicit de trimitere a formularului

    const searchQuery = event.target.elements.searchQuery.value;

    if (searchQuery.trim() === "") {
        // Verifică dacă căutarea este goală
        window.alert("Please enter a search query.");
        return;
    }

    await displayImages(searchQuery);
});

// Ascultătorul de eveniment pentru butonul "Load more"
loadMoreButton.addEventListener("click", async () => {
    currentPage++;
    const searchQuery = searchForm.elements.searchQuery.value;
    const {images, totalHits} = await searchImages(searchQuery, currentPage);

    images.forEach((imageData) => {
        const card = createPhotoCard(imageData);
        gallery.appendChild(card);
    });

    // Scroll fluent al paginii după adăugarea noilor imagini
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .lastElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });

    // Verificăm dacă utilizatorul a ajuns la sfârșitul rezultatelor
    if (gallery.children.length >= totalHits) {
        loadMoreButton.style.display = "none";
        window.alert("We're sorry, but you've reached the end of search results.");
    }
});

// Inițializarea paginii cu galeria goală și butonul "Load more" ascuns
gallery.innerHTML = "";
loadMoreButton.style.display = "none";
