// ========================================
// MAHADEV PHOTOGRAPHY - COMPLETE JS
// VERSION: 7.0.0 (Python Backend)
// ========================================

const APP_VERSION = '7.0.0';
const API_BASE = '/api';

// ========================================
// API FUNCTIONS
// ========================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = localStorage.getItem('adminToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// AUTH API
// ========================================

async function adminLogin(email, password) {
    const result = await apiRequest('auth.py', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (result.success) {
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        localStorage.setItem('adminAuth', 'true');
    }
    return result;
}

function isAuthenticated() {
    return !!localStorage.getItem('adminToken');
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAuth');
    window.location.href = '/index.html';
}

// ========================================
// GALLERY API
// ========================================

async function fetchGallery() {
    const result = await apiRequest('gallery.py');
    return result.success ? result.data : [];
}

async function addGalleryImage(data) {
    return await apiRequest('gallery.py', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateGalleryImage(id, data) {
    return await apiRequest('gallery.py', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data })
    });
}

async function deleteGalleryImage(id) {
    return await apiRequest(`gallery.py?id=${id}`, {
        method: 'DELETE'
    });
}

// ========================================
// PACKAGES API
// ========================================

async function fetchPackages() {
    const result = await apiRequest('packages.py');
    return result.success ? result.data : [];
}

async function addPackage(data) {
    return await apiRequest('packages.py', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updatePackage(id, data) {
    return await apiRequest('packages.py', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data })
    });
}

async function deletePackage(id) {
    return await apiRequest(`packages.py?id=${id}`, {
        method: 'DELETE'
    });
}

// ========================================
// SUBMISSIONS API
// ========================================

async function submitContactForm(data) {
    return await apiRequest('submissions.py', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function fetchSubmissions() {
    const result = await apiRequest('submissions.py');
    return result.success ? result.data : [];
}

async function updateSubmissionStatus(id, status) {
    return await apiRequest('submissions.py', {
        method: 'PUT',
        body: JSON.stringify({ id, status })
    });
}

async function deleteSubmission(id) {
    return await apiRequest(`submissions.py?id=${id}`, {
        method: 'DELETE'
    });
}

// ========================================
// DASHBOARD API
// ========================================

async function fetchDashboard() {
    const result = await apiRequest('dashboard.py');
    return result.success ? result.data : null;
}

// ========================================
// TOAST NOTIFICATION
// ========================================

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
}

// ========================================
// HERO STATS ANIMATION
// ========================================

function initHeroStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(function(el) {
        observer.observe(el);
    });
}

function animateCounter(el, target) {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(function() {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = current;
    }, 25);
}

// ========================================
// LIGHTBOX
// ========================================

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const closeBtn = document.querySelector('.close-lightbox');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');

    if (lightbox && img) {
        img.src = src;
        if (cap) cap.textContent = caption || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// LOAD GALLERY PREVIEW (Index Page)
// ========================================

async function loadGalleryPreview() {
    const container = document.getElementById('galleryPreview');
    if (!container) return;

    const items = await fetchGallery();
    const previewItems = items.slice(0, 4);

    if (previewItems.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">
                <i class="fas fa-images" style="font-size:3rem;display:block;margin-bottom:15px;color:#444;"></i>
                <p>No images in gallery yet. Check back soon!</p>
            </div>
        `;
        return;
    }

    let html = '';
    previewItems.forEach(function(item) {
        const imageSrc = item.image_url || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += `
            <div class="gallery-item-preview" onclick="openLightbox('${imageSrc}', '${item.title}')">
                <img src="${imageSrc}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/eee/999?text=Image+Not+Found'">
                <div class="preview-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description || ''}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========================================
// LOAD GALLERY PAGE
// ========================================

async function loadGalleryPage() {
    const container = document.getElementById('galleryMasonry');
    if (!container) return;

    const items = await fetchGallery();

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-gallery-msg" style="text-align:center;padding:60px;color:#999;grid-column:1/-1;">
                <i class="fas fa-images" style="font-size:4rem;display:block;margin-bottom:15px;color:#444;"></i>
                <p style="font-size:1.2rem;margin-bottom:10px;color:#666;">No images in gallery yet</p>
                <p style="color:#555;">Check back soon for amazing photos!</p>
            </div>
        `;
        return;
    }

    let html = '';
    items.forEach(function(item) {
        const imageSrc = item.image_url || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += `
            <div class="gallery-item" data-category="${item.category}">
                <img src="${imageSrc}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/eee/999?text=Image+Not+Found'">
                <div class="gallery-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description || ''}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    container.querySelectorAll('.gallery-item').forEach(function(el) {
        el.addEventListener('click', function() {
            const img = el.querySelector('img');
            openLightbox(img.src, img.alt);
        });
    });
}

// ========================================
// LOAD PACKAGES
// ========================================

async function loadPackages() {
    const container = document.getElementById('packagesGrid');
    if (!container) return;

    const items = await fetchPackages();

    if (items.length === 0) {
        container.innerHTML = `
            <p style="text-align:center;grid-column:1/-1;padding:40px;color:#999;">No packages available.</p>
        `;
        return;
    }

    let html = '';
    items.forEach(function(pkg) {
                const featuredClass = pkg.featured ? 'featured' : '';
                const features = Array.isArray(pkg.features) ? pkg.features : [];

                html += `
            <div class="package-card ${featuredClass}">
                <div class="package-header">
                    <h3>${pkg.name}</h3>
                    <div class="package-price">₹${Number(pkg.price).toLocaleString()} <span>/ session</span></div>
                </div>
                <div class="package-body">
                    <ul>
                        ${features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                    </ul>
                    <a href="/contact.html" class="btn btn-primary">Book Now</a>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const statusDiv = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (statusDiv) {
            statusDiv.className = 'form-status loading';
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending your message...';
        }
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !service || !message) {
            if (statusDiv) {
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
            }
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
            return;
        }
        
        const result = await submitContactForm({ name, email, phone, service, message });
        
        if (result.success) {
            if (statusDiv) {
                statusDiv.className = 'form-status success';
                statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
            }
            form.reset();
            
            setTimeout(() => {
                if (statusDiv) {
                    statusDiv.style.display = 'none';
                    statusDiv.className = 'form-status';
                    statusDiv.innerHTML = '';
                }
            }, 10000);
        } else {
            if (statusDiv) {
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.error || 'Something went wrong. Please try again.'}`;
            }
        }
        
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// ADMIN FUNCTIONS
// ========================================

function initAdminPanel() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('/admin/')) {
        if (currentPage.includes('login.html')) {
            initAdminLogin();
            return;
        }
        
        if (!requireAuth()) return;
        
        if (currentPage.includes('index.html') || currentPage.endsWith('/admin/')) {
            initAdminDashboard();
        } else if (currentPage.includes('gallery.html')) {
            initAdminGallery();
        } else if (currentPage.includes('packages.html')) {
            initAdminPackages();
        } else if (currentPage.includes('submissions.html')) {
            initAdminSubmissions();
        }
        
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }
}

// ========================================
// ADMIN LOGIN
// ========================================

function initAdminLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!email || !password) {
            showToast('Please enter email and password.', 'error');
            return;
        }
        
        const result = await adminLogin(email, password);
        
        if (result.success) {
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(result.error || 'Invalid credentials', 'error');
        }
    });
}

// ========================================
// ADMIN DASHBOARD
// ========================================

async function initAdminDashboard() {
    console.log('📊 Loading Dashboard...');
    
    const data = await fetchDashboard();
    
    if (!data) {
        showToast('Error loading dashboard data.', 'error');
        return;
    }
    
    document.getElementById('statPortfolio').textContent = data.total_images || 0;
    document.getElementById('statPackages').textContent = data.total_packages || 0;
    document.getElementById('statSubmissions').textContent = data.total_submissions || 0;
    document.getElementById('statRevenue').textContent = '₹' + (data.total_revenue || 0).toLocaleString('en-IN');
    
    const recentTable = document.getElementById('recentSubmissions');
    if (recentTable) {
        const recent = data.recent_submissions || [];
        
        if (recent.length === 0) {
            recentTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;padding:30px;">No submissions yet.</td></tr>';
        } else {
            let html = '';
            recent.forEach(function(s) {
                const statusClass = s.status === 'new' ? 'badge-new' : 'badge-read';
                const dateText = s.created_at ? new Date(s.created_at).toLocaleString() : '';
                html += `
                    <tr>
                        <td><strong>${s.name || 'Unknown'}</strong></td>
                        <td>${s.email || 'N/A'}</td>
                        <td><span class="badge ${statusClass}">${s.status || 'new'}</span></td>
                        <td style="color:#888;">${dateText}</td>
                    </tr>
                `;
            });
            recentTable.innerHTML = html;
        }
    }
    
    console.log('✅ Dashboard Updated!');
}

// ========================================
// ADMIN GALLERY
// ========================================

async function initAdminGallery() {
    console.log('📸 Loading Admin Gallery...');
    await renderAdminGallery();
}

async function renderAdminGallery() {
    const container = document.getElementById('adminGalleryGrid');
    if (!container) return;
    
    const items = await fetchGallery();
    
    updateGalleryStats(items);
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-gallery-state">
                <i class="fas fa-images"></i>
                <h3>No Images in Gallery</h3>
                <p>Add your first image using the form above.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    items.forEach(function(item) {
        const imageSrc = item.image_url || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += `
            <div class="gallery-card">
                <div class="image-wrapper">
                    <img src="${imageSrc}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-error\\'><i class=\\'fas fa-image\\'></i><p>Image not found</p><small>${imageSrc}</small></div>'">
                    <div class="image-overlay">
                        <button class="btn-view" onclick="viewImage(${item.id})"><i class="fas fa-eye"></i> View</button>
                        <button class="btn-edit" onclick="editImage(${item.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-delete" onclick="deleteImage(${item.id})"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>
                    <span class="card-category">${item.category || 'custom'}</span>
                    <p class="card-description">${item.description || ''}</p>
                </div>
                <div class="card-footer">
                    <span class="image-id">ID: ${item.id}</span>
                    <div class="card-actions">
                        <button class="btn-edit-sm" onclick="editImage(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete-sm" onclick="deleteImage(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateGalleryStats(items) {
    const count = items.length;
    document.getElementById('totalImages').textContent = count;
    
    let wedding = 0, prewedding = 0, engagement = 0, maternity = 0;
    items.forEach(function(item) {
        if (item.category === 'wedding') wedding++;
        else if (item.category === 'prewedding') prewedding++;
        else if (item.category === 'engagement') engagement++;
        else if (item.category === 'maternity') maternity++;
    });
    
    document.getElementById('weddingCount').textContent = wedding;
    document.getElementById('preweddingCount').textContent = prewedding;
    document.getElementById('engagementCount').textContent = engagement;
    document.getElementById('maternityCount').textContent = maternity;
}

// ========================================
// ADMIN GALLERY - CRUD OPERATIONS
// ========================================

async function addImage() {
    const url = document.getElementById('quickImageUrl').value.trim();
    const title = document.getElementById('quickImageTitle').value.trim();
    const category = document.getElementById('quickCategory').value;
    const description = document.getElementById('quickDescription').value.trim();
    
    if (!url) {
        showToast('Please enter an image URL.', 'error');
        return;
    }
    if (!title) {
        showToast('Please enter a title.', 'error');
        return;
    }
    
    const result = await addGalleryImage({
        title,
        category,
        image_url: url,
        description,
        featured: false
    });
    
    if (result.success) {
        showToast('✅ Image added successfully!', 'success');
        document.getElementById('quickImageUrl').value = '';
        document.getElementById('quickImageTitle').value = '';
        document.getElementById('quickDescription').value = '';
        document.getElementById('quickPreview').innerHTML = `
            <div class="placeholder">
                <i class="fas fa-image"></i>
                <p>Image preview will appear here</p>
                <small>Enter a URL above</small>
            </div>
        `;
        await renderAdminGallery();
    } else {
        showToast(result.error || 'Error adding image', 'error');
    }
}

async function bulkAddImages() {
    const urlInput = document.getElementById('urlInput');
    const urls = urlInput.value.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    
    if (urls.length === 0) {
        showToast('Please paste at least one image URL.', 'error');
        return;
    }
    
    let added = 0, failed = 0;
    
    for (const url of urls) {
        const result = await addGalleryImage({
            title: 'Image ' + (added + 1),
            category: 'custom',
            image_url: url,
            description: '',
            featured: false
        });
        
        if (result.success) added++;
        else failed++;
    }
    
    showToast(`✅ ${added} images added, ${failed} failed`, 'success');
    urlInput.value = '';
    await renderAdminGallery();
}

async function deleteImage(id) {
    if (!confirm('Delete this image?')) return;
    
    const result = await deleteGalleryImage(id);
    if (result.success) {
        showToast('Image deleted successfully!', 'success');
        await renderAdminGallery();
    } else {
        showToast(result.error || 'Error deleting image', 'error');
    }
}

async function viewImage(id) {
    const items = await fetchGallery();
    const item = items.find(i => i.id === id);
    if (!item) {
        showToast('Image not found.', 'error');
        return;
    }
    
    document.getElementById('viewImage').src = item.image_url || '';
    document.getElementById('viewTitleText').textContent = item.title || 'Untitled';
    document.getElementById('viewCategory').textContent = item.category || 'custom';
    document.getElementById('viewDescription').textContent = item.description || '';
    document.getElementById('viewId').textContent = item.id;
    document.getElementById('viewPath').textContent = item.image_url || '';
    document.getElementById('viewModal').classList.add('active');
}

async function editImage(id) {
    const items = await fetchGallery();
    const item = items.find(i => i.id === id);
    if (!item) {
        showToast('Image not found.', 'error');
        return;
    }
    
    document.getElementById('portfolioId').value = item.id;
    document.getElementById('portTitle').value = item.title || '';
    document.getElementById('portCategory').value = item.category || 'custom';
    document.getElementById('portImage').value = item.image_url || '';
    document.getElementById('portDescription').value = item.description || '';
    document.getElementById('modalTitle').textContent = '✏️ Edit Image';
    
    const preview = document.getElementById('modalPreview');
    if (item.image_url) {
        preview.innerHTML = `<img src="${item.image_url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'no-preview\\'><i class=\\'fas fa-image\\'></i> Image not found</div>'">`;
    } else {
        preview.innerHTML = '<div class="no-preview"><i class="fas fa-image"></i> No image preview</div>';
    }
    
    document.getElementById('portfolioModal').classList.add('active');
}

async function saveImage(event) {
    event.preventDefault();
    
    const id = document.getElementById('portfolioId').value;
    const title = document.getElementById('portTitle').value.trim();
    const category = document.getElementById('portCategory').value;
    const image = document.getElementById('portImage').value.trim();
    const description = document.getElementById('portDescription').value.trim();
    
    if (!title || !category || !image) {
        showToast('Please fill in all fields.', 'error');
        return;
    }
    
    const result = await updateGalleryImage(id, {
        title,
        category,
        image_url: image,
        description,
        featured: false
    });
    
    if (result.success) {
        showToast('✅ Image updated successfully!', 'success');
        document.getElementById('portfolioModal').classList.remove('active');
        await renderAdminGallery();
    } else {
        showToast(result.error || 'Error updating image', 'error');
    }
}

async function clearAllImages() {
    if (!confirm('⚠️ Delete ALL images? This cannot be undone!')) return;
    
    const items = await fetchGallery();
    let deleted = 0;
    
    for (const item of items) {
        const result = await deleteGalleryImage(item.id);
        if (result.success) deleted++;
    }
    
    showToast(`✅ ${deleted} images cleared!`, 'success');
    await renderAdminGallery();
}

// ========================================
// ADMIN PACKAGES
// ========================================

async function initAdminPackages() {
    console.log('📦 Loading Admin Packages...');
    await renderPackagesTable();
}

async function renderPackagesTable() {
    const table = document.getElementById('packagesTable');
    if (!table) return;
    
    const items = await fetchPackages();
    
    if (items.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:40px;">No packages added yet.</td></tr>';
        return;
    }
    
    let html = '';
    items.forEach(function(pkg) {
        const features = Array.isArray(pkg.features) ? pkg.features : [];
        const featuredBadge = pkg.featured ? '<span style="background:#D4AF37;color:#0A0A0A;padding:2px 10px;border-radius:12px;font-size:0.7rem;font-weight:600;"><i class="fas fa-star"></i> Featured</span>' : 'No';
        html += `
            <tr>
                <td><strong>${pkg.name}</strong></td>
                <td>₹${Number(pkg.price).toLocaleString()}</td>
                <td>${features.length} features</td>
                <td>${featuredBadge}</td>
                <td>
                    <div class="actions">
                        <button class="btn-sm btn-edit" onclick="editPackage(${pkg.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-sm btn-delete" onclick="deletePackage(${pkg.id})"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
    table.innerHTML = html;
}

function openPackageModal(pkg = null) {
    if (pkg) {
        editPackage(pkg.id);
    } else {
        document.getElementById('packageId').value = '';
        document.getElementById('pkgName').value = '';
        document.getElementById('pkgPrice').value = '';
        document.getElementById('pkgFeatures').value = '';
        document.getElementById('pkgFeatured').checked = false;
        document.getElementById('modalTitle').textContent = 'Add New Package';
        document.getElementById('packageModal').classList.add('active');
    }
}

async function savePackage(event) {
    event.preventDefault();
    
    const id = document.getElementById('packageId').value;
    const name = document.getElementById('pkgName').value.trim();
    const price = parseFloat(document.getElementById('pkgPrice').value);
    const featuresText = document.getElementById('pkgFeatures').value;
    const featured = document.getElementById('pkgFeatured').checked;
    
    if (!name || !price || isNaN(price) || price <= 0) {
        showToast('Please fill in all fields correctly.', 'error');
        return;
    }
    
    const features = featuresText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    if (features.length === 0) {
        showToast('Please enter at least one feature.', 'error');
        return;
    }
    
    let result;
    if (id) {
        result = await updatePackage(id, { name, price, features, featured });
    } else {
        result = await addPackage({ name, price, features, featured });
    }
    
    if (result.success) {
        showToast(id ? 'Package updated successfully!' : 'Package added successfully!', 'success');
        document.getElementById('packageModal').classList.remove('active');
        await renderPackagesTable();
    } else {
        showToast(result.error || 'Error saving package', 'error');
    }
}

async function editPackage(id) {
    const items = await fetchPackages();
    const pkg = items.find(p => p.id === id);
    if (!pkg) {
        showToast('Package not found.', 'error');
        return;
    }
    
    document.getElementById('packageId').value = pkg.id;
    document.getElementById('pkgName').value = pkg.name || '';
    document.getElementById('pkgPrice').value = pkg.price || '';
    document.getElementById('pkgFeatures').value = Array.isArray(pkg.features) ? pkg.features.join('\n') : '';
    document.getElementById('pkgFeatured').checked = pkg.featured || false;
    document.getElementById('modalTitle').textContent = '✏️ Edit Package';
    
    document.getElementById('packageModal').classList.add('active');
}

async function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    const result = await deletePackage(id);
    if (result.success) {
        showToast('Package deleted successfully!', 'success');
        await renderPackagesTable();
    } else {
        showToast(result.error || 'Error deleting package', 'error');
    }
}

// ========================================
// ADMIN SUBMISSIONS
// ========================================

async function initAdminSubmissions() {
    console.log('📩 Loading Admin Submissions...');
    await renderSubmissionsTable();
}

async function renderSubmissionsTable() {
    const table = document.getElementById('submissionsTable');
    if (!table) return;
    
    const items = await fetchSubmissions();
    const filtered = currentFilter === 'all' ? items : items.filter(s => s.status === currentFilter);
    
    document.getElementById('submissionCount').textContent = `${filtered.length} submissions`;
    
    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:60px;color:#666;">
                    <i class="fas fa-inbox" style="font-size:3rem;display:block;margin-bottom:15px;color:#444;"></i>
                    <p style="font-size:1.1rem;">No submissions found</p>
                    <p style="font-size:0.9rem;color:#555;">Submissions from your contact form will appear here</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach(function(s, index) {
        const statusClass = s.status === 'new' ? 'badge-new' : s.status === 'replied' ? 'badge-replied' : 'badge-read';
        const rowClass = s.status === 'new' ? 'submission-new' : '';
        const dateText = s.created_at ? new Date(s.created_at).toLocaleString() : '';
        
        html += `
            <tr class="${rowClass}">
                <td>${index + 1}</td>
                <td><strong>${s.name || 'Unknown'}</strong></td>
                <td><a href="mailto:${s.email || ''}" style="color:#D4AF37;text-decoration:none;">${s.email || 'N/A'}</a></td>
                <td>${s.phone || '-'}</td>
                <td>${s.service || '-'}</td>
                <td><span class="${statusClass}">${s.status || 'new'}</span></td>
                <td style="font-size:0.85rem;color:#888;">${dateText}</td>
                <td>
                    <div class="actions">
                        <button class="btn-sm btn-view" onclick="viewSubmission(${s.id})"><i class="fas fa-eye"></i></button>
                        ${s.status === 'new' ? `<button class="btn-sm btn-edit" onclick="markSubmissionRead(${s.id})"><i class="fas fa-check"></i></button>` : ''}
                        ${s.status !== 'replied' ? `<button class="btn-sm btn-success" onclick="markSubmissionReplied(${s.id})"><i class="fas fa-reply"></i></button>` : ''}
                        <button class="btn-sm btn-delete" onclick="deleteSubmission(${s.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    table.innerHTML = html;
}

let currentFilter = 'all';

function filterSubmissions(filter, button) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn === button);
    });
    renderSubmissionsTable();
}

async function viewSubmission(id) {
    const items = await fetchSubmissions();
    const sub = items.find(s => s.id === id);
    if (!sub) {
        showToast('Submission not found.', 'error');
        return;
    }
    
    let message = `📩 Message from ${sub.name}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━━\n';
    message += `📧 Email: ${sub.email}\n`;
    message += `📱 Phone: ${sub.phone || 'N/A'}\n`;
    message += `📂 Service: ${sub.service || 'N/A'}\n`;
    message += `📅 Date: ${sub.created_at ? new Date(sub.created_at).toLocaleString() : 'N/A'}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━━\n';
    message += `💬 Message:\n${sub.message || 'No message'}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━━━\n';
    message += `📊 Status: ${sub.status || 'new'}`;
    
    alert(message);
    
    if (sub.status === 'new') {
        await updateSubmissionStatus(id, 'read');
        await renderSubmissionsTable();
        showToast('✅ Marked as read', 'success');
    }
}

async function markSubmissionRead(id) {
    const result = await updateSubmissionStatus(id, 'read');
    if (result.success) {
        showToast('✅ Marked as read', 'success');
        await renderSubmissionsTable();
    }
}

async function markSubmissionReplied(id) {
    const result = await updateSubmissionStatus(id, 'replied');
    if (result.success) {
        showToast('✅ Marked as replied', 'success');
        await renderSubmissionsTable();
    }
}

async function deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    const result = await deleteSubmission(id);
    if (result.success) {
        showToast('🗑️ Submission deleted', 'success');
        await renderSubmissionsTable();
    }
}

async function markAllRead() {
    const items = await fetchSubmissions();
    const newItems = items.filter(s => s.status === 'new');
    
    if (newItems.length === 0) {
        showToast('No new submissions to mark', 'info');
        return;
    }
    
    for (const s of newItems) {
        await updateSubmissionStatus(s.id, 'read');
    }
    
    showToast(`✅ ${newItems.length} submissions marked as read`, 'success');
    await renderSubmissionsTable();
}

// ========================================
// MODAL HELPERS
// ========================================

function closeModal() {
    document.querySelectorAll('.modal.active').forEach(function(m) {
        m.classList.remove('active');
    });
}

function closeViewModal() {
    document.getElementById('viewModal')?.classList.remove('active');
}

// ========================================
// PREVIEW FUNCTIONS
// ========================================

function previewImage(url) {
    const preview = document.getElementById('quickPreview');
    if (!preview) return;
    
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div style=\'color:#e74c3c;padding:20px;\'><i class=\'fas fa-exclamation-triangle\' style=\'font-size:2rem;display:block;margin-bottom:10px;\'></i><p>Cannot preview image</p><small>${url}</small></div>'">`;
    } else {
        preview.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-image"></i>
                <p>Image preview will appear here</p>
                <small>Enter a URL above</small>
            </div>
        `;
    }
}

function previewModalImage(url) {
    const preview = document.getElementById('modalPreview');
    if (!preview) return;
    
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'no-preview\\'><i class=\\'fas fa-image\\'></i> Image not found</div>'">`;
    } else {
        preview.innerHTML = '<div class="no-preview"><i class="fas fa-image"></i> No image preview</div>';
    }
}

// ========================================
// PARTICLE BACKGROUND
// ========================================

(function() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 80;
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(212, 175, 55, ${0.05 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawLines();
        requestAnimationFrame(animate);
    }
    
    animate();
})();

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 Mahadev Photography v${APP_VERSION} loaded!`);
    
    initNavigation();
    initHeroStats();
    initLightbox();
    initContactForm();
    
    if (document.getElementById('galleryPreview')) {
        loadGalleryPreview();
    }
    
    if (document.getElementById('galleryMasonry')) {
        loadGalleryPage();
    }
    
    if (document.getElementById('packagesGrid')) {
        loadPackages();
    }
    
    initAdminPanel();
    
    console.log('✅ All systems initialized');
});

// ========================================
// GLOBAL EXPORTS
// ========================================

window.showToast = showToast;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.closeModal = closeModal;
window.closeViewModal = closeViewModal;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;

// Admin gallery
window.addImage = addImage;
window.bulkAddImages = bulkAddImages;
window.deleteImage = deleteImage;
window.editImage = editImage;
window.viewImage = viewImage;
window.saveImage = saveImage;
window.clearAllImages = clearAllImages;
window.renderAdminGallery = renderAdminGallery;
window.previewImage = previewImage;
window.previewModalImage = previewModalImage;

// Admin packages
window.openPackageModal = openPackageModal;
window.savePackage = savePackage;
window.editPackage = editPackage;
window.deletePackage = deletePackage;

// Admin submissions
window.viewSubmission = viewSubmission;
window.markSubmissionRead = markSubmissionRead;
window.markSubmissionReplied = markSubmissionReplied;
window.deleteSubmission = deleteSubmission;
window.markAllRead = markAllRead;
window.filterSubmissions = filterSubmissions;

console.log('📸 Admin Login: admin@mahadevphotography.com / admin123');
console.log('📞 Contact: +91 94264 24213, +91 81608 42941');