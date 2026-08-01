// ========================================
// MAHADEV PHOTOGRAPHY - COMPLETE FIXED
// VERSION: 3.0.5 (AUTO-LOAD DASHBOARD)
// ========================================

const APP_VERSION = '3.0.5';

// ========================================
// FORCE CLEAR ON VERSION CHANGE
// ========================================

(function() {
    console.log('🚀 Mahadev Photography v' + APP_VERSION);

    var storedVersion = localStorage.getItem('mahadev_version');

    if (storedVersion !== APP_VERSION) {
        console.log('🔄 New version detected! Clearing cache...');

        var keepKeys = ['adminAuth'];
        var allKeys = Object.keys(localStorage);

        allKeys.forEach(function(key) {
            if (keepKeys.indexOf(key) === -1) {
                localStorage.removeItem(key);
            }
        });

        localStorage.setItem('mahadev_version', APP_VERSION);
        console.log('✅ Cache cleared!');

        if (performance.navigation.type !== 1) {
            setTimeout(function() {
                window.location.reload(true);
            }, 500);
        }
    }
})();

// ========================================
// DATA STORE - FIXED
// ========================================

const DataStore = {
    get: function(key, defaultVal = []) {
        try {
            var data = localStorage.getItem(key);
            if (!data) return defaultVal;

            var parsed = JSON.parse(data);

            if (parsed && typeof parsed === 'object') {
                if (parsed.hasOwnProperty('value')) {
                    var value = parsed.value;
                    if (value === null || value === undefined) {
                        return defaultVal;
                    }
                    return value;
                }
                if (parsed.hasOwnProperty('_expiry')) {
                    if (Date.now() > parsed._expiry) {
                        localStorage.removeItem(key);
                        return defaultVal;
                    }
                    if (!parsed.hasOwnProperty('value') || parsed.value === undefined) {
                        return defaultVal;
                    }
                    return parsed.value || defaultVal;
                }
            }

            return parsed || defaultVal;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultVal;
        }
    },

    set: function(key, data, expiryHours = 24) {
        try {
            if (data === null || data === undefined) {
                data = [];
            }
            var item = {
                value: data,
                _expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    clear: function() {
        var keepKeys = ['adminAuth', 'mahadev_version'];
        var allKeys = Object.keys(localStorage);

        allKeys.forEach(function(key) {
            if (keepKeys.indexOf(key) === -1) {
                localStorage.removeItem(key);
            }
        });
        console.log('🗑️ All data cleared!');
    }
};

window.DataStore = DataStore;

// ========================================
// VALIDATE AND FIX DATA
// ========================================

function validateAndFixData() {
    console.log('🔧 Validating data...');

    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio) || portfolio.length === 0) {
        console.log('📸 Initializing portfolio...');
        portfolio = [
            { id: 1, title: 'Beautiful Wedding', category: 'wedding', image: 'https://images.unsplash.com/photo-1511798616182-98b7d9a7e2cc?w=600&h=400&fit=crop', description: 'Elegant wedding photography' },
            { id: 2, title: 'Romantic Engagement', category: 'engagement', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop', description: 'Beautiful engagement shoot' },
            { id: 3, title: 'Pre Wedding Shoot', category: 'prewedding', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop', description: 'Pre wedding couple session' },
            { id: 4, title: 'Baby Shower Celebration', category: 'babyshower', image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&h=400&fit=crop', description: 'Baby shower party' }
        ];
        DataStore.set('portfolio', portfolio);
    }

    var packages = DataStore.get('packages');
    if (!Array.isArray(packages) || packages.length === 0) {
        console.log('📦 Initializing packages...');
        packages = [
            { id: 1, name: 'Silver', price: 14999, features: ['4 hours coverage', '100+ edited photos', 'Online gallery'], featured: false },
            { id: 2, name: 'Gold', price: 29999, features: ['8 hours coverage', '300+ edited photos', 'Online gallery', '2 Photographers'], featured: true },
            { id: 3, name: 'Platinum', price: 49999, features: ['12 hours coverage', '500+ edited photos', 'Online gallery', '3 Photographers', 'Album design'], featured: false }
        ];
        DataStore.set('packages', packages);
    }

    var submissions = DataStore.get('submissions');
    if (!Array.isArray(submissions)) {
        console.log('📩 Initializing submissions...');
        submissions = [];
        DataStore.set('submissions', submissions);
    }

    console.log('✅ Data validation complete!');
}

// ========================================
// ADMIN DASHBOARD - FIXED
// ========================================

function initAdminDashboard() {
    console.log('📊 Loading Dashboard...');

    try {
        var portfolio = DataStore.get('portfolio');
        var packages = DataStore.get('packages');
        var submissions = DataStore.get('submissions');

        var portfolioCount = Array.isArray(portfolio) ? portfolio.length : 0;
        var packagesCount = Array.isArray(packages) ? packages.length : 0;
        var submissionsCount = Array.isArray(submissions) ? submissions.length : 0;

        var totalRevenue = 0;
        if (Array.isArray(packages)) {
            packages.forEach(function(pkg) {
                var price = typeof pkg.price === 'number' ? pkg.price : 0;
                totalRevenue += price;
            });
        }

        console.log('📸 Portfolio:', portfolioCount);
        console.log('📦 Packages:', packagesCount);
        console.log('📩 Submissions:', submissionsCount);
        console.log('💰 Revenue:', totalRevenue);

        // Update DOM
        var statPortfolio = document.getElementById('statPortfolio');
        var statPackages = document.getElementById('statPackages');
        var statSubmissions = document.getElementById('statSubmissions');
        var statRevenue = document.getElementById('statRevenue');

        if (statPortfolio) statPortfolio.textContent = portfolioCount;
        if (statPackages) statPackages.textContent = packagesCount;
        if (statSubmissions) statSubmissions.textContent = submissionsCount;
        if (statRevenue) statRevenue.textContent = '₹' + totalRevenue.toLocaleString();

        // Recent Submissions
        var recentTable = document.getElementById('recentSubmissions');
        if (recentTable) {
            var recent = Array.isArray(submissions) ? submissions.slice(-5).reverse() : [];
            if (recent.length === 0) {
                recentTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">No submissions yet.</td></tr>';
            } else {
                var html = '';
                recent.forEach(function(s) {
                    var statusColor = s.status === 'new' ? '#e74c3c' : '#27ae60';
                    html += '<tr>';
                    html += '<td><strong>' + (s.name || 'Unknown') + '</strong></td>';
                    html += '<td>' + (s.email || 'N/A') + '</td>';
                    html += '<td><span style="background:' + statusColor + ';color:white;padding:3px 10px;border-radius:12px;font-size:0.8rem;">' + (s.status || 'new') + '</span></td>';
                    html += '<td>' + (s.date || new Date().toLocaleString()) + '</td>';
                    html += '</tr>';
                });
                recentTable.innerHTML = html;
            }
        }

        console.log('✅ Dashboard Updated!');
    } catch (error) {
        console.error('❌ Dashboard Error:', error);
    }
}

// ========================================
// ADMIN AUTHENTICATION
// ========================================

function isAuthenticated() {
    return localStorage.getItem('adminAuth') === 'true';
}

function loginAdmin(email, password) {
    if (email === 'admin@mahadevphotography.com' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        return true;
    }
    return false;
}

function logoutAdmin() {
    localStorage.removeItem('adminAuth');
    window.location.href = '../index.html';
}

// ========================================
// ADMIN LOGIN
// ========================================

function initAdminLogin() {
    var form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value.trim();

        if (loginAdmin(email, password)) {
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert('Invalid credentials. Use admin@mahadevphotography.com / admin123');
        }
    });
}

// ========================================
// ADMIN PANEL INIT - FIXED WITH AUTO-LOAD
// ========================================

function initAdminPanel() {
    var currentPage = window.location.pathname;

    console.log('🔍 Admin panel initialized on:', currentPage);

    if (currentPage.indexOf('/admin/') !== -1) {
        // Login page
        if (currentPage.indexOf('login.html') !== -1) {
            initAdminLogin();
            return;
        }

        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Validate data first
        validateAndFixData();

        // IMPORTANT FIX: Auto-load dashboard for index page
        if (currentPage.indexOf('admin/index.html') !== -1 || currentPage.endsWith('/admin/') || currentPage === '/admin') {
            console.log('📊 Auto-loading dashboard...');
            // Small delay to ensure DOM is ready
            setTimeout(function() {
                initAdminDashboard();
            }, 100);
        } else if (currentPage.indexOf('admin/packages.html') !== -1) {
            initAdminPackages();
        } else if (currentPage.indexOf('admin/submissions.html') !== -1) {
            initAdminSubmissions();
        } else if (currentPage.indexOf('admin/gallery.html') !== -1) {
            initAdminGallery();
        }

        // Logout button
        var logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutAdmin();
            });
        }
    }
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');

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

    var navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// ========================================
// HERO STATS
// ========================================

function initHeroStats() {
    var statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var target = parseInt(el.dataset.count);
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
    var current = 0;
    var increment = Math.ceil(target / 60);
    var timer = setInterval(function() {
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
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var closeBtn = document.querySelector('.close-lightbox');
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
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightboxImg');
    var cap = document.getElementById('lightboxCaption');
    if (lightbox && img) {
        img.src = src;
        if (cap) cap.textContent = caption || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// CLIENT GALLERY
// ========================================

function loadGalleryPreview() {
    var container = document.getElementById('galleryPreview');
    if (!container) return;

    var items = DataStore.get('portfolio').slice(0, 4);
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#999;">No images in gallery yet.</p>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var imageSrc = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += '<div class="portfolio-item" data-category="' + item.category + '">';
        html += '<img src="' + imageSrc + '" alt="' + item.title + '" loading="lazy">';
        html += '<div class="portfolio-overlay">';
        html += '<h3>' + item.title + '</h3>';
        html += '<p>' + (item.description || '') + '</p>';
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function loadGalleryPage() {
    var container = document.getElementById('galleryMasonry');
    if (!container) return;

    var items = DataStore.get('portfolio');
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="empty-gallery-msg"><i class="fas fa-images"></i><p>No images in gallery yet</p></div>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var imageSrc = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += '<div class="gallery-item" data-id="' + item.id + '">';
        html += '<img src="' + imageSrc + '" alt="' + item.title + '" loading="lazy">';
        html += '<div class="gallery-overlay">';
        html += '<h3>' + item.title + '</h3>';
        html += '<p>' + (item.description || '') + '</p>';
        html += '</div></div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.gallery-item').forEach(function(el) {
        el.addEventListener('click', function() {
            var img = el.querySelector('img');
            openLightbox(img.src, img.alt);
        });
    });
}

// ========================================
// PACKAGES
// ========================================

function loadPackages() {
    var container = document.getElementById('packagesGrid');
    if (!container) return;

    var items = DataStore.get('packages');
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No packages available.</p>';
        return;
    }

    var html = '';
    items.forEach(function(pkg) {
        var featuredClass = pkg.featured ? 'featured' : '';
        var price = typeof pkg.price === 'number' ? pkg.price : 0;
        html += '<div class="package-card ' + featuredClass + '">';
        html += '<div class="package-header">';
        html += '<h3>' + pkg.name + '</h3>';
        html += '<div class="package-price">₹' + price.toLocaleString() + ' <span>/ session</span></div>';
        html += '</div>';
        html += '<div class="package-body">';
        html += '<ul>';
        if (Array.isArray(pkg.features)) {
            pkg.features.forEach(function(f) {
                html += '<li><i class="fas fa-check"></i> ' + f + '</li>';
            });
        }
        html += '</ul>';
        html += '<a href="contact.html" class="btn btn-primary">Book Now</a>';
        html += '</div></div>';
    });
    container.innerHTML = html;
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Form submitted! This is a demo. Connect to Formspree for real submissions.');
    });
}

// ========================================
// PLACEHOLDER ADMIN FUNCTIONS
// ========================================

function initAdminPackages() {
    console.log('📦 Packages admin loaded');
    var table = document.getElementById('packagesTable');
    if (table) {
        var items = DataStore.get('packages');
        if (!items || items.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No packages yet.</td></tr>';
        } else {
            var html = '';
            items.forEach(function(pkg) {
                html += '<tr>';
                html += '<td><strong>' + pkg.name + '</strong></td>';
                html += '<td>₹' + (typeof pkg.price === 'number' ? pkg.price : 0).toLocaleString() + '</td>';
                html += '<td>' + (Array.isArray(pkg.features) ? pkg.features.length : 0) + ' features</td>';
                html += '<td>' + (pkg.featured ? '⭐ Yes' : 'No') + '</td>';
                html += '<td><button class="btn-sm btn-edit">Edit</button> <button class="btn-sm btn-delete">Delete</button></td>';
                html += '</tr>';
            });
            table.innerHTML = html;
        }
    }
}

function initAdminSubmissions() {
    console.log('📩 Submissions admin loaded');
    var table = document.getElementById('submissionsTable');
    if (table) {
        var items = DataStore.get('submissions');
        if (!items || items.length === 0) {
            table.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999;">No submissions yet.</td></tr>';
        } else {
            var html = '';
            items.forEach(function(s, index) {
                html += '<tr>';
                html += '<td>' + (index + 1) + '</td>';
                html += '<td><strong>' + (s.name || 'Unknown') + '</strong></td>';
                html += '<td>' + (s.email || 'N/A') + '</td>';
                html += '<td>' + (s.phone || '-') + '</td>';
                html += '<td>' + (s.service || '-') + '</td>';
                html += '<td><span style="background:' + (s.status === 'new' ? '#e74c3c' : '#27ae60') + ';color:white;padding:3px 10px;border-radius:12px;">' + (s.status || 'new') + '</span></td>';
                html += '<td><button class="btn-sm btn-view">View</button></td>';
                html += '</tr>';
            });
            table.innerHTML = html;
        }
    }
}

function initAdminGallery() {
    console.log('📸 Gallery admin loaded');
}

// ========================================
// MAIN INIT - ORDER MATTERS!
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM fully loaded');

    // 1. Initialize navigation first
    initNavigation();

    // 2. Initialize hero stats
    initHeroStats();

    // 3. Load client-side content
    loadGalleryPreview();
    loadGalleryPage();
    loadPackages();

    // 4. Initialize lightbox
    initLightbox();

    // 5. Initialize contact form
    initContactForm();

    // 6. Initialize admin panel (this will auto-load dashboard)
    initAdminPanel();

    console.log('✅ All systems initialized');
});

// ========================================
// EXPOSE GLOBAL FUNCTIONS
// ========================================

window.DataStore = DataStore;
window.initAdminDashboard = initAdminDashboard;
window.validateAndFixData = validateAndFixData;
window.isAuthenticated = isAuthenticated;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.showToast = function(msg) { alert(msg); };

console.log('📱 Mahadev Photography v' + APP_VERSION + ' loaded!');
console.log('📸 Admin Login: admin@mahadevphotography.com / admin123');