// ==========================================================================
// BASE DE DATOS INICIAL & PERSISTENCIA (LOCALSTORAGE)
// ==========================================================================
const INITIAL_PHOTOS = [
  {
    id: '1',
    title: 'Atardecer en Santorini',
    category: 'playas',
    location: 'Santorini, Grecia',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    likes: 124,
    liked: false,
    filter: 'filter-normal'
  },
  {
    id: '2',
    title: 'Paseo Nocturno en Tokio',
    category: 'ciudades',
    location: 'Shibuya, Japón',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    likes: 89,
    liked: false,
    filter: 'filter-normal'
  },
  {
    id: '3',
    title: 'Selva & Arrozales de Ubud',
    category: 'escapadas',
    location: 'Bali, Indonesia',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    likes: 210,
    liked: false,
    filter: 'filter-normal'
  },
  {
    id: '4',
    title: 'Senderismo en Yosemite',
    category: 'montanas',
    location: 'California, EE. UU.',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    likes: 156,
    liked: false,
    filter: 'filter-normal'
  },
  {
    id: '5',
    title: 'Aguas Cristalinas de Phi Phi',
    category: 'playas',
    location: 'Krabi, Tailandia',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    likes: 178,
    liked: false,
    filter: 'filter-normal'
  },
  {
    id: '6',
    title: 'Calles Románticas de París',
    category: 'ciudades',
    location: 'París, Francia',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    likes: 312,
    liked: false,
    filter: 'filter-normal'
  }
];

// Obtener o inicializar fotos en localStorage
let photos = JSON.parse(localStorage.getItem('viajes_photos')) || INITIAL_PHOTOS;

function savePhotos() {
  localStorage.setItem('viajes_photos', JSON.stringify(photos));
  updateStats();
}

// ESTADO GLOBAL
let currentFilterCategory = 'all';
let currentSearchQuery = '';
let activePhotoId = null;
let currentActiveFilter = 'filter-normal';
let uploadedImageData = null;

// ==========================================================================
// ELEMENTOS DEL DOM
// ==========================================================================
const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');
const statPhotosCount = document.getElementById('statPhotosCount');
const searchInput = document.getElementById('searchInput');

// Modales
const uploadModal = document.getElementById('uploadModal');
const lightboxModal = document.getElementById('lightboxModal');
const openUploadBtn = document.getElementById('openUploadBtn');
const closeUploadModal = document.getElementById('closeUploadModal');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const closeLightbox = document.getElementById('closeLightbox');

// Upload Form & Dropzone
const uploadForm = document.getElementById('uploadForm');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const uploadPreviewContainer = document.getElementById('uploadPreviewContainer');
const uploadPreviewImg = document.getElementById('uploadPreviewImg');
const removePreviewBtn = document.getElementById('removePreviewBtn');

// Lightbox Elements
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxLocation = document.getElementById('lightboxLocation');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const downloadBtn = document.getElementById('downloadBtn');
const deletePhotoBtn = document.getElementById('deletePhotoBtn');

// ==========================================================================
// RENDERIZADO DE GALERÍA
// ==========================================================================
function renderGallery() {
  galleryGrid.innerHTML = '';

  const filtered = photos.filter(photo => {
    const matchesCategory = currentFilterCategory === 'all' || photo.category === currentFilterCategory;
    const matchesSearch = photo.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
                          photo.location.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');

    filtered.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <div class="photo-img-wrapper" onclick="openLightbox('${photo.id}')">
          <img src="${photo.url}" alt="${photo.title}" class="${photo.filter}">
          <span class="photo-badge">${getCategoryName(photo.category)}</span>
        </div>
        <div class="photo-details">
          <h3 class="photo-title">${photo.title}</h3>
          <p class="photo-location"><i class="fa-solid fa-location-dot"></i> ${photo.location}</p>
          <div class="photo-actions">
            <button class="icon-btn" onclick="toggleLike(event, '${photo.id}')" style="${photo.liked ? 'color:#ef4444;' : ''}">
              <i class="${photo.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${photo.likes}
            </button>
            <button class="icon-btn" onclick="openLightbox('${photo.id}')" title="Editar / Ver">
              <i class="fa-solid fa-expand"></i>
            </button>
          </div>
        </div>
      `;
      galleryGrid.appendChild(card);
    });
  }

  updateStats();
}

function getCategoryName(cat) {
  const names = {
    playas: 'Playas',
    montanas: 'Montañas',
    ciudades: 'Ciudades',
    escapadas: 'Escapadas'
  };
  return names[cat] || 'Destino';
}

function updateStats() {
  if (statPhotosCount) {
    statPhotosCount.textContent = photos.length;
  }
}

// ==========================================================================
// FILTROS Y BÚSQUEDA
// ==========================================================================
document.getElementById('filterChips').addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    currentFilterCategory = e.target.dataset.filter;
    renderGallery();
  }
});

// CTA Album Cards Click
document.querySelectorAll('.cta-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.cta-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    currentFilterCategory = card.dataset.category;
    
    // Sync con Chips
    document.querySelectorAll('#filterChips .chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === currentFilterCategory);
    });

    renderGallery();
    document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' });
  });
});

// Búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
  currentSearchQuery = e.target.value;
  renderGallery();
});

// ==========================================================================
// CARRUSEL
// ==========================================================================
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');

let carouselIndex = 0;

if (prevBtn && nextBtn && track) {
  nextBtn.addEventListener('click', () => {
    const cardWidth = track.children[0].offsetWidth + 24;
    const maxIndex = track.children.length - Math.floor(track.parentElement.offsetWidth / cardWidth);
    if (carouselIndex < maxIndex) {
      carouselIndex++;
      track.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
    }
  });

  prevBtn.addEventListener('click', () => {
    const cardWidth = track.children[0].offsetWidth + 24;
    if (carouselIndex > 0) {
      carouselIndex--;
      track.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
    }
  });
}

// ==========================================================================
// SUBIR FOTO (UPLOAD MODAL & DRAG/DROP)
// ==========================================================================
openUploadBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
closeUploadModal.addEventListener('click', resetAndCloseUploadModal);
cancelUploadBtn.addEventListener('click', resetAndCloseUploadModal);

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.style.background = '#fcf0a6';
});

dropzone.addEventListener('dragleave', () => {
  dropzone.style.background = 'var(--primary-light)';
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.style.background = 'var(--primary-light)';
  if (e.dataTransfer.files.length) {
    handleImageFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleImageFile(e.target.files[0]);
  }
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageData = e.target.result;
    uploadPreviewImg.src = uploadedImageData;
    dropzone.classList.add('hidden');
    uploadPreviewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

removePreviewBtn.addEventListener('click', () => {
  uploadedImageData = null;
  fileInput.value = '';
  uploadPreviewContainer.classList.add('hidden');
  dropzone.classList.remove('hidden');
});

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!uploadedImageData) {
    alert('Por favor selecciona o arrastra una imagen.');
    return;
  }

  const newPhoto = {
    id: Date.now().toString(),
    title: document.getElementById('photoTitle').value,
    category: document.getElementById('photoCategory').value,
    location: document.getElementById('photoLocation').value,
    url: uploadedImageData,
    likes: 0,
    liked: false,
    filter: 'filter-normal'
  };

  photos.unshift(newPhoto);
  savePhotos();
  renderGallery();
  resetAndCloseUploadModal();
});

function resetAndCloseUploadModal() {
  uploadForm.reset();
  uploadedImageData = null;
  uploadPreviewContainer.classList.add('hidden');
  dropzone.classList.remove('hidden');
  uploadModal.classList.add('hidden');
}

// ==========================================================================
// LIGHTBOX, FILTROS Y DESCARGA CON CANVAS
// ==========================================================================
function openLightbox(photoId) {
  const photo = photos.find(p => p.id === photoId);
  if (!photo) return;

  activePhotoId = photoId;
  currentActiveFilter = photo.filter || 'filter-normal';

  lightboxImg.src = photo.url;
  lightboxImg.className = currentActiveFilter;
  lightboxTitle.textContent = photo.title;
  lightboxCategory.textContent = getCategoryName(photo.category);
  lightboxLocation.textContent = photo.location;
  likeCount.textContent = photo.likes;

  // Actualizar botones de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cssFilter === currentActiveFilter);
  });

  lightboxModal.classList.remove('hidden');
}

closeLightbox.addEventListener('click', () => {
  lightboxModal.classList.add('hidden');
});

// Selección de Filtros CSS en tiempo real
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentActiveFilter = btn.dataset.cssFilter;
    lightboxImg.className = currentActiveFilter;

    // Guardar el filtro en el objeto
    const photo = photos.find(p => p.id === activePhotoId);
    if (photo) {
      photo.filter = currentActiveFilter;
      savePhotos();
      renderGallery();
    }
  });
});

// Like Button en Lightbox
likeBtn.addEventListener('click', () => {
  const photo = photos.find(p => p.id === activePhotoId);
  if (photo) {
    photo.liked = !photo.liked;
    photo.likes += photo.liked ? 1 : -1;
    likeCount.textContent = photo.likes;
    savePhotos();
    renderGallery();
  }
});

function toggleLike(e, id) {
  e.stopPropagation();
  const photo = photos.find(p => p.id === id);
  if (photo) {
    photo.liked = !photo.liked;
    photo.likes += photo.liked ? 1 : -1;
    savePhotos();
    renderGallery();
  }
}

// Eliminar foto
deletePhotoBtn.addEventListener('click', () => {
  if (confirm('¿Estás seguro de que deseas eliminar esta foto de tu álbum?')) {
    photos = photos.filter(p => p.id !== activePhotoId);
    savePhotos();
    renderGallery();
    lightboxModal.classList.add('hidden');
  }
});

// Descargar Foto procesada mediante Canvas HTML5
downloadBtn.addEventListener('click', () => {
  const photo = photos.find(p => p.id === activePhotoId);
  if (!photo) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Aplicar filtros equivalentes en el Context del Canvas
    ctx.filter = getCanvasFilterString(currentActiveFilter);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = `${photo.title.replace(/\s+/g, '_')}_editado.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = photo.url;
});

function getCanvasFilterString(filterClass) {
  switch (filterClass) {
    case 'filter-vintage':
      return 'sepia(0.3) contrast(1.1) brightness(0.9) saturate(1.2)';
    case 'filter-warm':
      return 'sepia(0.2) saturate(1.4) hue-rotate(-10deg)';
    case 'filter-bw':
      return 'grayscale(1) contrast(1.2)';
    case 'filter-sepia':
      return 'sepia(0.85)';
    case 'filter-sunset':
      return 'sepia(0.4) saturate(1.8) hue-rotate(-20deg) brightness(0.95)';
    case 'filter-bright':
      return 'brightness(1.15) contrast(1.05) saturate(1.1)';
    default:
      return 'none';
  }
}

// Menu Toggle Responsive
document.getElementById('mobileToggle').addEventListener('click', () => {
  const nav = document.getElementById('navbar');
  if (nav.style.display === 'flex') {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '100%';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.background = '#fcfbf7';
    nav.style.padding = '1rem';
    nav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
  }
});

// Inicialización
renderGallery();