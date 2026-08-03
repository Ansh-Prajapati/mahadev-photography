// ========================================
// MAHADEV PHOTOGRAPHY - COMPLETE
// VERSION: 3.0.3 (FIXED NaN - PROPER DATA UNWRAPPING)
// ========================================

const APP_VERSION = '3.0.3';

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
// DATA STORE WITH EXPIRY - FIXED
// ========================================

const DataStore = {
    get: function(key, defaultVal = []) {
        try {
            var data = localStorage.getItem(key);
            if (!data) return defaultVal;

            var parsed = JSON.parse(data);

            // CRITICAL FIX: Check if data is wrapped with value/expiry
            if (parsed && typeof parsed === 'object') {
                // If it has a 'value' property, use that
                if (parsed.hasOwnProperty('value')) {
                    var value = parsed.value;
                    // If value is null or undefined, return default
                    if (value === null || value === undefined) {
                        return defaultVal;
                    }
                    return value;
                }
                // If it has _expiry but no value, handle gracefully
                if (parsed.hasOwnProperty('_expiry')) {
                    if (Date.now() > parsed._expiry) {
                        localStorage.removeItem(key);
                        return defaultVal;
                    }
                    // If we have _expiry but value is missing, return default
                    if (!parsed.hasOwnProperty('value') || parsed.value === undefined) {
                        return defaultVal;
                    }
                    return parsed.value || defaultVal;
                }
            }

            // If it's a direct array or object, return it
            return parsed || defaultVal;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultVal;
        }
    },

    set: function(key, data, expiryHours = 24) {
        try {
            // Ensure data is valid before storing
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
    console.log('🔧 Validating data for NaN fixes...');

    // Fix Portfolio
    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio) || portfolio.length === 0) {
        console.log('📸 Initializing portfolio with sample data...');
        portfolio = [{
                id: 1,
                title: 'Beautiful Wedding',
                category: 'wedding',
                image: 'https://images.unsplash.com/photo-1511798616182-98b7d9a7e2cc?w=600&h=400&fit=crop',
                description: 'Elegant wedding photography'
            },
            {
                id: 2,
                title: 'Romantic Engagement',
                category: 'engagement',
                image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop',
                description: 'Beautiful engagement shoot'
            },
            {
                id: 3,
                title: 'Pre Wedding Shoot',
                category: 'prewedding',
                image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop',
                description: 'Pre wedding couple session'
            },
            {
                id: 4,
                title: 'Baby Shower Celebration',
                category: 'babyshower',
                image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&h=400&fit=crop',
                description: 'Baby shower party'
            }
        ];
        DataStore.set('portfolio', portfolio);
    }

    // Fix Packages
    var packages = DataStore.get('packages');
    if (!Array.isArray(packages) || packages.length === 0) {
        console.log('📦 Initializing packages with sample data...');
        packages = [{
                id: 1,
                name: 'Silver',
                price: 14999,
                features: ['4 hours coverage', '100+ edited photos', 'Online gallery', 'Digital delivery'],
                featured: false
            },
            {
                id: 2,
                name: 'Gold',
                price: 29999,
                features: ['8 hours coverage', '300+ edited photos', 'Online gallery', 'Digital delivery', '2 Photographers', 'Pre-wedding shoot'],
                featured: true
            },
            {
                id: 3,
                name: 'Platinum',
                price: 49999,
                features: ['12 hours coverage', '500+ edited photos', 'Online gallery', 'Digital delivery', '3 Photographers', 'Pre-wedding & Post-wedding', 'Album design'],
                featured: false
            }
        ];
        DataStore.set('packages', packages);
    } else {
        // Validate each package has a valid price
        var needsUpdate = false;
        packages.forEach(function(pkg, index) {
            if (typeof pkg.price !== 'number' || isNaN(pkg.price) || pkg.price === undefined) {
                console.warn('⚠️ Fixing invalid price for package:', pkg.name);
                packages[index].price = 0;
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            DataStore.set('packages', packages);
        }
    }

    // Fix Submissions
    var submissions = DataStore.get('submissions');
    if (!Array.isArray(submissions)) {
        console.log('📩 Initializing submissions...');
        submissions = [];
        DataStore.set('submissions', submissions);
    }

    console.log('✅ Data validation complete!');
    console.log('📸 Portfolio:', Array.isArray(portfolio) ? portfolio.length : 0, 'items');
    console.log('📦 Packages:', Array.isArray(packages) ? packages.length : 0, 'items');
    console.log('📩 Submissions:', Array.isArray(submissions) ? submissions.length : 0, 'items');
}

// ========================================
// INITIAL DATA
// ========================================

function initializeData() {
    validateAndFixData();
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
// TOAST NOTIFICATION
// ========================================

function showToast(message, type) {
    if (type === undefined) {
        type = 'info';
    }
    var existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icon = '';
    if (type === 'success') {
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
    } else {
        icon = 'fa-info-circle';
    }
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(function() {
            toast.remove();
        }, 500);
    }, 4000);
}

window.showToast = showToast;

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
    if (!statNumbers.length) {
        return;
    }

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
// LIGHTBOX WITH ZOOM
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

    var img = document.getElementById('lightboxImg');
    if (img) {
        var scale = 1;
        img.addEventListener('wheel', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.deltaY < 0) {
                scale += 0.1;
            } else {
                scale -= 0.1;
            }
            if (scale < 0.5) scale = 0.5;
            if (scale > 3) scale = 3;
            this.style.transform = 'scale(' + scale + ')';
            this.style.transition = 'transform 0.2s ease';
        });

        var originalClose = closeLightbox;
        closeLightbox = function() {
            scale = 1;
            if (img) {
                img.style.transform = 'scale(1)';
            }
            originalClose();
        };

        img.addEventListener('dblclick', function() {
            scale = 1;
            this.style.transform = 'scale(1)';
        });

        var isDragging = false;
        var startX, startY, translateX = 0,
            translateY = 0;

        img.addEventListener('mousedown', function(e) {
            if (scale > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                this.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                img.style.transform = 'scale(' + scale + ') translate(' + (translateX / scale) + 'px, ' + (translateY / scale) + 'px)';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            if (img) {
                img.style.cursor = scale > 1 ? 'grab' : 'default';
            }
        });
    }
}

function openLightbox(src, caption) {
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightboxImg');
    var cap = document.getElementById('lightboxCaption');
    if (lightbox && img) {
        img.src = src;
        img.style.transform = 'scale(1)';
        img.style.transition = 'transform 0.2s ease';
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
        var img = document.getElementById('lightboxImg');
        if (img) {
            img.style.transform = 'scale(1)';
        }
    }
}

// ========================================
// CLIENT SIDE GALLERY
// ========================================

function loadGalleryPreview() {
    var container = document.getElementById('galleryPreview');
    if (!container) return;

    var items = DataStore.get('portfolio').slice(0, 4);
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#999;">No images in gallery yet. Add some in the admin panel!</p>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var imageSrc = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += '<div class="portfolio-item" data-category="' + item.category + '">';
        html += '<img src="' + imageSrc + '" alt="' + item.title + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/400x300/eee/999?text=Image+Not+Found\';">';
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
        container.innerHTML = '<div class="empty-gallery-msg" style="text-align:center;padding:60px;color:#999;grid-column:1/-1;"><i class="fas fa-images" style="font-size:4rem;display:block;margin-bottom:15px;color:#ddd;"></i><p style="font-size:1.2rem;margin-bottom:10px;color:#666;">No images in gallery yet</p><p style="color:#bbb;">Check back soon for amazing photos!</p></div>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var imageSrc = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        html += '<div class="gallery-item" data-id="' + item.id + '">';
        html += '<img src="' + imageSrc + '" alt="' + item.title + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/400x300/eee/999?text=Image+Not+Found\';">';
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
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#999;">No packages available.</p>';
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

    var statusDiv = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (statusDiv) {
            statusDiv.className = 'form-status loading';
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending your message...';
        }
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var service = document.getElementById('service').value;
        var message = document.getElementById('message').value.trim();

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

        var formData = new FormData(form);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://formspree.io/f/mkodknzq', true);
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = function() {
            if (xhr.status === 200) {
                if (statusDiv) {
                    statusDiv.className = 'form-status success';
                    statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
                }
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
                form.reset();

                var submissions = DataStore.get('submissions');
                if (!Array.isArray(submissions)) submissions = [];
                submissions.push({
                    id: Date.now(),
                    name: name,
                    email: email,
                    phone: phone || 'N/A',
                    service: service,
                    message: message,
                    date: new Date().toLocaleString(),
                    status: 'new'
                });
                DataStore.set('submissions', submissions);

                setTimeout(function() {
                    if (statusDiv) {
                        statusDiv.style.display = 'none';
                        statusDiv.className = 'form-status';
                        statusDiv.innerHTML = '';
                    }
                }, 10000);
            } else {
                if (statusDiv) {
                    statusDiv.className = 'form-status error';
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Oops! Something went wrong. Please try again.';
                }
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
        };

        xhr.onerror = function() {
            if (statusDiv) {
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error. Please check your connection.';
            }
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        };

        xhr.send(formData);
    });
}

// ========================================
// ADMIN PANEL INIT
// ========================================

function initAdminPanel() {
    var currentPage = window.location.pathname;

    if (currentPage.indexOf('/admin/') !== -1) {
        if (currentPage.indexOf('login.html') !== -1) {
            initAdminLogin();
            return;
        }

        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Validate data before loading admin pages
        validateAndFixData();

        if (currentPage.indexOf('admin/index.html') !== -1 || currentPage.endsWith('/admin/')) {
            initAdminDashboard();
        } else if (currentPage.indexOf('admin/packages.html') !== -1) {
            initAdminPackages();
        } else if (currentPage.indexOf('admin/submissions.html') !== -1) {
            initAdminSubmissions();
        } else if (currentPage.indexOf('admin/gallery.html') !== -1) {
            initAdminGallery();
        }

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
// DATA STORE - FIXED
// ========================================

const DataStore = {
    get: function(key, defaultVal = []) {
        try {
            var data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
            return defaultVal;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultVal;
        }
    },
    set: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }
};

// Make it global
window.DataStore = DataStore;
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
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 500);
        } else {
            showToast('Invalid email or password. Please try again.', 'error');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
}

// ========================================
// ADMIN DASHBOARD - FIXED
// ========================================

function initAdminDashboard() {
    console.log('📊 Loading Dashboard...');

    try {
        // Get data using DataStore
        var portfolio = DataStore.get('portfolio');
        var packages = DataStore.get('packages');
        var submissions = DataStore.get('submissions');

        // Ensure we have valid arrays
        var portfolioCount = Array.isArray(portfolio) ? portfolio.length : 0;
        var packagesCount = Array.isArray(packages) ? packages.length : 0;
        var submissionsCount = Array.isArray(submissions) ? submissions.length : 0;

        // Calculate total revenue safely
        var totalRevenue = 0;
        if (Array.isArray(packages)) {
            packages.forEach(function(pkg) {
                var price = typeof pkg.price === 'number' ? pkg.price : parseFloat(pkg.price) || 0;
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
                    var statusText = s.status || 'new';
                    var dateText = s.date || new Date().toLocaleString();

                    html += '<tr>';
                    html += '<td><strong>' + (s.name || 'Unknown') + '</strong></td>';
                    html += '<td>' + (s.email || 'N/A') + '</td>';
                    html += '<td><span style="background:' + statusColor + ';color:white;padding:3px 10px;border-radius:12px;font-size:0.8rem;">' + statusText + '</span></td>';
                    html += '<td>' + dateText + '</td>';
                    html += '</tr>';
                });
                recentTable.innerHTML = html;
            }
        }

        console.log('✅ Dashboard Updated!');
    } catch (error) {
        console.error('❌ Dashboard Error:', error);
        showToast('Error loading dashboard data.', 'error');
    }
}

// ========================================
// ADMIN PACKAGES (CRUD)
// ========================================

function initAdminPackages() {
    var table = document.getElementById('packagesTable');
    if (!table) return;

    renderPackagesTable(table);

    var addBtn = document.getElementById('addPackageBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            openPackageModal(null);
        });
    }

    var modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    var modal = document.getElementById('packageModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });
    }

    var form = document.getElementById('packageForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            savePackage(this);
        });
    }
}

function renderPackagesTable(table) {
    var items = DataStore.get('packages');
    if (!items || items.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">No packages added yet.</td></tr>';
        return;
    }

    var html = '';
    items.forEach(function(pkg) {
        var price = typeof pkg.price === 'number' ? pkg.price : 0;
        html += '<tr>';
        html += '<td><strong>' + pkg.name + '</strong></td>';
        html += '<td>₹' + price.toLocaleString() + '</td>';
        html += '<td>' + (Array.isArray(pkg.features) ? pkg.features.length : 0) + ' features</td>';
        html += '<td>' + (pkg.featured ? '⭐ Yes' : 'No') + '</td>';
        html += '<td><div class="actions">';
        html += '<button class="btn-sm btn-edit" onclick="editPackage(' + pkg.id + ')"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="btn-sm btn-delete" onclick="deletePackage(' + pkg.id + ')"><i class="fas fa-trash"></i> Delete</button>';
        html += '</div></td></tr>';
    });
    table.innerHTML = html;
}

function openPackageModal(pkg) {
    var modal = document.getElementById('packageModal');
    var form = document.getElementById('packageForm');
    var title = document.getElementById('modalTitle');

    if (!modal || !form) return;

    title.textContent = pkg ? 'Edit Package' : 'Add New Package';
    form.reset();
    document.getElementById('packageId').value = pkg ? pkg.id : '';
    document.getElementById('pkgName').value = pkg ? pkg.name : '';
    document.getElementById('pkgPrice').value = pkg ? pkg.price : '';
    document.getElementById('pkgFeatures').value = pkg ? (Array.isArray(pkg.features) ? pkg.features.join('\n') : '') : '';
    document.getElementById('pkgFeatured').checked = pkg ? pkg.featured : false;

    modal.classList.add('active');
}

function closeModal() {
    var modal = document.getElementById('packageModal');
    var modal2 = document.getElementById('portfolioModal');
    if (modal) modal.classList.remove('active');
    if (modal2) modal2.classList.remove('active');
}

function savePackage(form) {
    var id = parseInt(document.getElementById('packageId').value);
    var pkg = {
        name: document.getElementById('pkgName').value.trim(),
        price: parseInt(document.getElementById('pkgPrice').value) || 0,
        features: document.getElementById('pkgFeatures').value.split('\n').filter(function(f) {
            return f.trim();
        }),
        featured: document.getElementById('pkgFeatured').checked
    };

    if (!pkg.name || pkg.price <= 0 || pkg.features.length === 0) {
        showToast('Please fill in all fields correctly.', 'error');
        return;
    }

    var packages = DataStore.get('packages');
    if (!Array.isArray(packages)) packages = [];

    if (id) {
        var index = -1;
        for (var i = 0; i < packages.length; i++) {
            if (packages[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            packages[index] = {
                id: packages[index].id,
                name: pkg.name,
                price: pkg.price,
                features: pkg.features,
                featured: pkg.featured
            };
        }
        showToast('Package updated successfully!', 'success');
    } else {
        pkg.id = Date.now();
        packages.push(pkg);
        showToast('Package added successfully!', 'success');
    }

    DataStore.set('packages', packages);
    closeModal();
    renderPackagesTable(document.getElementById('packagesTable'));
}

window.editPackage = function(id) {
    var items = DataStore.get('packages');
    var pkg = null;
    if (Array.isArray(items)) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                pkg = items[i];
                break;
            }
        }
    }
    if (pkg) openPackageModal(pkg);
};

window.deletePackage = function(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;

    var packages = DataStore.get('packages');
    if (!Array.isArray(packages)) return;

    var newPackages = [];
    for (var i = 0; i < packages.length; i++) {
        if (packages[i].id !== id) {
            newPackages.push(packages[i]);
        }
    }
    DataStore.set('packages', newPackages);
    showToast('Package deleted successfully!', 'success');
    renderPackagesTable(document.getElementById('packagesTable'));
};

// ========================================
// ADMIN SUBMISSIONS
// ========================================

function initAdminSubmissions() {
    var table = document.getElementById('submissionsTable');
    if (!table) return;

    renderSubmissionsTable(table);

    var markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            var submissions = DataStore.get('submissions');
            if (Array.isArray(submissions)) {
                for (var i = 0; i < submissions.length; i++) {
                    submissions[i].status = 'read';
                }
                DataStore.set('submissions', submissions);
                renderSubmissionsTable(table);
                showToast('All submissions marked as read.', 'success');
            }
        });
    }
}

function renderSubmissionsTable(table) {
    var items = DataStore.get('submissions');
    if (!items || items.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No submissions yet.</td></tr>';
        return;
    }

    var html = '';
    items.forEach(function(s, index) {
        var statusColor = s.status === 'new' ? '#e74c3c' : '#27ae60';
        html += '<tr>';
        html += '<td>' + (index + 1) + '</td>';
        html += '<td><strong>' + s.name + '</strong></td>';
        html += '<td>' + s.email + '</td>';
        html += '<td>' + (s.phone || '-') + '</td>';
        html += '<td>' + s.service + '</td>';
        html += '<td><span style="background:' + statusColor + ';color:white;padding:3px 10px;border-radius:12px;font-size:0.8rem;">' + s.status + '</span></td>';
        html += '<td><div class="actions">';
        html += '<button class="btn-sm btn-view" onclick="viewSubmission(' + s.id + ')"><i class="fas fa-eye"></i> View</button>';
        if (s.status === 'new') {
            html += '<button class="btn-sm btn-edit" onclick="markRead(' + s.id + ')"><i class="fas fa-check"></i> Read</button>';
        }
        html += '<button class="btn-sm btn-delete" onclick="deleteSubmission(' + s.id + ')"><i class="fas fa-trash"></i> Delete</button>';
        html += '</div></td></tr>';
    });
    table.innerHTML = html;
}

window.viewSubmission = function(id) {
    var items = DataStore.get('submissions');
    var sub = null;
    if (Array.isArray(items)) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                sub = items[i];
                break;
            }
        }
    }
    if (!sub) return;

    alert('📩 Message from ' + sub.name + '\n\nEmail: ' + sub.email + '\nPhone: ' + (sub.phone || 'N/A') + '\nService: ' + sub.service + '\nDate: ' + sub.date + '\n\nMessage:\n' + sub.message);

    if (sub.status === 'new') {
        var submissions = DataStore.get('submissions');
        if (Array.isArray(submissions)) {
            var index = -1;
            for (var j = 0; j < submissions.length; j++) {
                if (submissions[j].id === id) {
                    index = j;
                    break;
                }
            }
            if (index !== -1) {
                submissions[index].status = 'read';
                DataStore.set('submissions', submissions);
                renderSubmissionsTable(document.getElementById('submissionsTable'));
            }
        }
    }
};

window.markRead = function(id) {
    var submissions = DataStore.get('submissions');
    if (Array.isArray(submissions)) {
        var index = -1;
        for (var i = 0; i < submissions.length; i++) {
            if (submissions[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            submissions[index].status = 'read';
            DataStore.set('submissions', submissions);
            showToast('Marked as read.', 'success');
            renderSubmissionsTable(document.getElementById('submissionsTable'));
        }
    }
};

window.deleteSubmission = function(id) {
    if (!confirm('Delete this submission?')) return;

    var submissions = DataStore.get('submissions');
    if (!Array.isArray(submissions)) return;

    var newSubmissions = [];
    for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].id !== id) {
            newSubmissions.push(submissions[i]);
        }
    }
    DataStore.set('submissions', newSubmissions);
    showToast('Submission deleted.', 'success');
    renderSubmissionsTable(document.getElementById('submissionsTable'));
};

// ========================================
// ADMIN GALLERY - COMPLETE WORKING
// ========================================

function initAdminGallery() {
    console.log('📸 Initializing Admin Gallery...');

    renderAdminGallery(document.getElementById('adminGalleryGrid'));
    updateStats();

    var addBtn = document.getElementById('quickAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', quickAddImage);
    }

    var modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    var modal = document.getElementById('portfolioModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    var bulkBtn = document.querySelector('.btn-bulk');
    if (bulkBtn) {
        bulkBtn.addEventListener('click', handleUrlUpload);
    }

    var quickUrlInput = document.getElementById('quickImageUrl');
    var quickPreview = document.getElementById('quickPreview');

    if (quickUrlInput && quickPreview) {
        quickUrlInput.addEventListener('input', function() {
            var url = this.value.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                var img = new Image();
                img.onload = function() {
                    quickPreview.innerHTML = '<img src="' + url + '" alt="Preview" style="max-width:100%;max-height:250px;border-radius:8px;">';
                    quickPreview.classList.add('has-preview');
                };
                img.onerror = function() {
                    quickPreview.innerHTML = '<div style="color:#e74c3c;padding:20px;text-align:center;"><i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:10px;"></i><p>Cannot preview image</p><small>' + url + '</small></div>';
                    quickPreview.classList.add('has-preview');
                };
                img.src = url;
            } else {
                quickPreview.innerHTML = '<div class="placeholder"><i class="fas fa-image"></i><p>Image preview will appear here</p><small style="color:#555;">Enter a URL above</small></div>';
                quickPreview.classList.remove('has-preview');
            }
        });
    }

    if (quickUrlInput) {
        quickUrlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                quickAddImage();
            }
        });
    }

    var modalForm = document.getElementById('portfolioForm');
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePortfolio(this);
        });
    }
}

function renderAdminGallery(container) {
    var items = DataStore.get('portfolio');
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-gallery-state">
                <i class="fas fa-images"></i>
                <h3>No Images in Gallery</h3>
                <p>Add your first image using the form above.</p>
            </div>
        `;
        return;
    }

    var html = '';
    items.forEach(function(item, index) {
        var imageSrc = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
        var displayDescription = item.description || '';

        html += '<div class="gallery-card">';
        html += '<div class="image-wrapper">';
        html += '<img src="' + imageSrc + '" alt="' + (item.title || 'Image ' + (index + 1)) + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\'image-error\\\'><i class=\\\'fas fa-image\\\'></i><p>Image not found</p><small>' + imageSrc + '</small></div>\'">';
        html += '<div class="image-overlay">';
        html += '<button class="btn-view" onclick="viewImage(' + item.id + ')"><i class="fas fa-eye"></i> View</button>';
        html += '<button class="btn-edit" onclick="editImage(' + item.id + ')"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="btn-delete" onclick="deleteImage(' + item.id + ')"><i class="fas fa-trash"></i> Delete</button>';
        html += '</div></div>';
        html += '<div class="card-body">';
        html += '<h3 class="card-title">' + (item.title || 'Image ' + (index + 1)) + '</h3>';
        html += '<span class="card-category">' + (item.category || 'custom') + '</span>';
        html += '<p class="card-description">' + (displayDescription) + '</p>';
        html += '</div>';
        html += '<div class="card-footer">';
        html += '<span class="image-id">ID: ' + item.id + '</span>';
        html += '<div class="card-actions">';
        html += '<button class="btn-edit-sm" onclick="editImage(' + item.id + ')"><i class="fas fa-edit"></i></button>';
        html += '<button class="btn-delete-sm" onclick="deleteImage(' + item.id + ')"><i class="fas fa-trash"></i></button>';
        html += '</div></div></div>';
    });
    container.innerHTML = html;

    updateStats();
}

function updateStats() {
    var items = DataStore.get('portfolio');
    var count = items ? items.length : 0;

    var totalEl = document.getElementById('totalImages');
    if (totalEl) totalEl.textContent = count;

    var weddingCount = 0,
        eventCount = 0,
        portraitCount = 0,
        natureCount = 0;
    if (items) {
        items.forEach(function(item) {
            if (item.category === 'wedding') weddingCount++;
            else if (item.category === 'event') eventCount++;
            else if (item.category === 'portrait') portraitCount++;
            else if (item.category === 'nature') natureCount++;
        });
    }

    var weddingEl = document.getElementById('weddingCount');
    var eventEl = document.getElementById('eventCount');
    var portraitEl = document.getElementById('portraitCount');
    var natureEl = document.getElementById('natureCount');

    if (weddingEl) weddingEl.textContent = weddingCount;
    if (eventEl) eventEl.textContent = eventCount;
    if (portraitEl) portraitEl.textContent = portraitCount;
    if (natureEl) natureEl.textContent = natureCount;
}

window.quickAddImage = function() {
    console.log('Quick Add triggered');
    var urlInput = document.getElementById('quickImageUrl');
    var titleInput = document.getElementById('quickImageTitle');
    var categorySelect = document.getElementById('quickCategory');
    var descriptionInput = document.getElementById('quickDescription');

    if (!urlInput) {
        showToast('Input field not found.', 'error');
        return;
    }

    var url = urlInput.value.trim();
    var title = titleInput ? titleInput.value.trim() : '';
    var category = categorySelect ? categorySelect.value : 'custom';
    var description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!url) {
        showToast('Please enter an image URL.', 'error');
        urlInput.focus();
        return;
    }

    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio)) portfolio = [];

    var exists = false;
    for (var i = 0; i < portfolio.length; i++) {
        if (portfolio[i].image === url) {
            exists = true;
            break;
        }
    }

    if (exists) {
        showToast('⚠️ This image already exists in the gallery.', 'error');
        return;
    }

    var newItem = {
        id: Date.now() + Math.random() * 1000,
        title: title || 'My Photo',
        category: category,
        image: url,
        description: description || ''
    };
    portfolio.push(newItem);
    DataStore.set('portfolio', portfolio);

    showToast('✅ Photo added successfully!', 'success');

    urlInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descriptionInput) descriptionInput.value = '';

    var preview = document.getElementById('quickPreview');
    if (preview) {
        preview.innerHTML = '<div class="placeholder"><i class="fas fa-image"></i><p>Image preview will appear here</p><small style="color:#555;">Enter a URL above</small></div>';
        preview.classList.remove('has-preview');
    }

    renderAdminGallery(document.getElementById('adminGalleryGrid'));
};

window.handleUrlUpload = function() {
    console.log('Bulk Upload triggered');
    var urlInput = document.getElementById('urlInput');
    if (!urlInput) {
        showToast('Input field not found.', 'error');
        return;
    }

    var urls = urlInput.value.split('\n')
        .map(function(url) { return url.trim(); })
        .filter(function(url) { return url.length > 0; });

    if (urls.length === 0) {
        showToast('Please paste at least one image URL.', 'error');
        urlInput.focus();
        return;
    }

    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio)) portfolio = [];

    var addedCount = 0;
    var skippedCount = 0;

    var existingUrls = {};
    for (var i = 0; i < portfolio.length; i++) {
        existingUrls[portfolio[i].image] = true;
    }

    for (var j = 0; j < urls.length; j++) {
        var url = urls[j];
        if (existingUrls[url]) {
            skippedCount++;
            continue;
        }

        portfolio.push({
            id: Date.now() + j + Math.random() * 1000,
            title: 'Image ' + (portfolio.length + addedCount + 1),
            category: 'custom',
            image: url,
            description: ''
        });
        addedCount++;
        existingUrls[url] = true;
    }

    DataStore.set('portfolio', portfolio);

    var message = '✅ ' + addedCount + ' images added successfully!';
    if (skippedCount > 0) {
        message += ' (' + skippedCount + ' skipped - already exist)';
    }
    showToast(message, 'success');
    urlInput.value = '';
    renderAdminGallery(document.getElementById('adminGalleryGrid'));
};

window.viewImage = function(id) {
    var items = DataStore.get('portfolio');
    if (!items) {
        showToast('Image not found.', 'error');
        return;
    }

    var item = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            item = items[i];
            break;
        }
    }
    if (!item) {
        showToast('Image not found.', 'error');
        return;
    }

    document.getElementById('viewImage').src = item.image || 'https://via.placeholder.com/400x300/eee/999?text=No+Image';
    document.getElementById('viewTitleText').textContent = item.title || 'Untitled';
    document.getElementById('viewCategory').textContent = item.category || 'custom';
    document.getElementById('viewDescription').textContent = item.description || '';
    document.getElementById('viewId').textContent = item.id;
    document.getElementById('viewPath').textContent = item.image || 'No path';
    document.getElementById('viewTitle').textContent = '📸 ' + (item.title || 'Image Details');

    document.getElementById('viewModal').classList.add('active');
};

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

window.editImage = function(id) {
    console.log('Edit Image triggered for ID:', id);
    var items = DataStore.get('portfolio');
    if (!items) {
        showToast('Image not found.', 'error');
        return;
    }

    var item = null;
    for (var i = 0; i < items.length; i++) {
        if (String(items[i].id) === String(id)) {
            item = items[i];
            break;
        }
    }
    if (item) {
        openPortfolioModal(item);
    } else {
        showToast('Image not found with ID: ' + id, 'error');
    }
};

window.deleteImage = function(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio)) return;

    var newPortfolio = [];
    for (var i = 0; i < portfolio.length; i++) {
        if (String(portfolio[i].id) !== String(id)) {
            newPortfolio.push(portfolio[i]);
        }
    }
    DataStore.set('portfolio', newPortfolio);
    showToast('🗑️ Image deleted successfully!', 'success');
    renderAdminGallery(document.getElementById('adminGalleryGrid'));
};

window.clearAllImages = function() {
    var items = DataStore.get('portfolio');
    var count = items ? items.length : 0;

    if (count === 0) {
        showToast('No images to clear.', 'info');
        return;
    }

    if (!confirm('⚠️ Are you sure you want to delete ALL ' + count + ' images? This cannot be undone!')) return;
    if (!confirm('Really? All images will be permanently deleted!')) return;

    DataStore.set('portfolio', []);
    showToast('🗑️ All images cleared!', 'success');
    renderAdminGallery(document.getElementById('adminGalleryGrid'));
};

window.refreshGallery = function() {
    renderAdminGallery(document.getElementById('adminGalleryGrid'));
    showToast('🔄 Gallery refreshed!', 'info');
};

function openPortfolioModal(item) {
    console.log('Opening edit modal for:', item);
    var modal = document.getElementById('portfolioModal');
    var form = document.getElementById('portfolioForm');
    var title = document.getElementById('modalTitle');
    var preview = document.getElementById('modalPreview');

    if (!modal || !form) return;

    title.textContent = item ? '✏️ Edit Image' : '📷 Add New Image';

    form.reset();

    document.getElementById('portfolioId').value = item ? item.id : '';
    document.getElementById('portTitle').value = item ? item.title : '';
    document.getElementById('portCategory').value = item ? item.category : 'custom';
    document.getElementById('portImage').value = item ? item.image : '';
    document.getElementById('portDescription').value = item ? item.description : '';

    if (item && item.image) {
        preview.innerHTML = '<img src="' + item.image + '" alt="Preview" onerror="this.parentElement.innerHTML=\'<div class=\\\'no-preview\\\'><i class=\\\'fas fa-image\\\'></i> Image not found</div>\'">';
    } else {
        preview.innerHTML = '<div class="no-preview"><i class="fas fa-image"></i> No image preview</div>';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    var modal = document.getElementById('portfolioModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function savePortfolio(form) {
    console.log('Saving portfolio item...');

    var id = document.getElementById('portfolioId').value;
    var title = document.getElementById('portTitle').value.trim();
    var category = document.getElementById('portCategory').value;
    var image = document.getElementById('portImage').value.trim();
    var description = document.getElementById('portDescription').value.trim();

    if (!title || !category || !image) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    var portfolio = DataStore.get('portfolio');
    if (!Array.isArray(portfolio)) portfolio = [];

    if (id) {
        var found = false;
        for (var i = 0; i < portfolio.length; i++) {
            if (String(portfolio[i].id) === String(id)) {
                portfolio[i] = {
                    id: portfolio[i].id,
                    title: title,
                    category: category,
                    image: image,
                    description: description || ''
                };
                found = true;
                break;
            }
        }

        if (found) {
            DataStore.set('portfolio', portfolio);
            showToast('✅ Image updated successfully!', 'success');
            closeModal();
            renderAdminGallery(document.getElementById('adminGalleryGrid'));
        } else {
            showToast('❌ Image not found in portfolio. Please refresh and try again.', 'error');
        }
    } else {
        var newItem = {
            id: Date.now() + Math.random() * 1000,
            title: title,
            category: category,
            image: image,
            description: description || ''
        };
        portfolio.push(newItem);
        DataStore.set('portfolio', portfolio);
        showToast('✅ Image added successfully!', 'success');
        closeModal();
        renderAdminGallery(document.getElementById('adminGalleryGrid'));
    }
}

// ========================================
// MOBILE FORCE RELOAD
// ========================================

function isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
}

function forceMobileUpdate() {
    if (!isMobile()) return;

    var lastCheck = localStorage.getItem('mobile_check');
    var now = Date.now();

    if (!lastCheck || (now - parseInt(lastCheck)) > 300000) {
        localStorage.setItem('mobile_check', now);

        var portfolio = localStorage.getItem('portfolio');
        if (!portfolio || portfolio === '[]' || portfolio === 'null') {
            console.log('📱 Mobile: No data found, reloading...');
            window.location.reload(true);
        }
    }
}

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js')
        .then(function(registration) {
            console.log('✅ Service Worker registered');
            registration.addEventListener('updatefound', function() {
                console.log('🔄 Service Worker update found');
            });
        })
        .catch(function(error) {
            console.log('❌ Service Worker registration failed:', error);
        });
}

// ========================================
// MAIN INIT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM fully loaded');
    initializeData();
    initNavigation();
    initHeroStats();
    loadGalleryPreview();
    loadGalleryPage();
    loadPackages();
    initLightbox();
    initContactForm();
    initAdminPanel();
    forceMobileUpdate();
    console.log('✅ All systems initialized');
});

// ========================================
// EXPOSE GLOBAL FUNCTIONS
// ========================================

window.DataStore = DataStore;
window.showToast = showToast;
window.closeModal = closeModal;
window.closeViewModal = closeViewModal;
window.openPortfolioModal = openPortfolioModal;
window.openPackageModal = openPackageModal;
window.editImage = editImage;
window.deleteImage = deleteImage;
window.viewImage = viewImage;
window.editPackage = editPackage;
window.deletePackage = deletePackage;
window.viewSubmission = viewSubmission;
window.markRead = markRead;
window.deleteSubmission = deleteSubmission;
window.isAuthenticated = isAuthenticated;
window.logoutAdmin = logoutAdmin;
window.quickAddImage = quickAddImage;
window.handleUrlUpload = handleUrlUpload;
window.refreshGallery = refreshGallery;
window.clearAllImages = clearAllImages;
window.initAdminDashboard = initAdminDashboard;
window.validateAndFixData = validateAndFixData;

console.log('📱 Mahadev Photography v' + APP_VERSION + ' loaded!');
console.log('📸 Admin Login: admin@mahadevphotography.com / admin123');
console.log('📞 Contact: +91 94264 24213, +91 81608 42941');
console.log('📧 Email: mahadevphotography1921@gmail.com');