// ========================================
// MAHADEV PHOTOGRAPHY - FIREBASE VERSION
// VERSION: 6.0.0
// ========================================

const APP_VERSION = '6.0.0';

// ========================================
// CHECK FIREBASE STATUS
// ========================================

const useFirebase = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
console.log('🔥 Firebase status:', useFirebase ? 'Connected ✅' : 'Not connected ❌');

// ========================================
// DATA STORE - FIREBASE + LOCALSTORAGE
// ========================================

const DataStore = {
    // GET data from Firebase or localStorage
    get: async function(key, defaultVal = []) {
        if (useFirebase) {
            try {
                // Map local keys to Firestore collection names
                const collectionMap = {
                    'portfolio': 'gallery',
                    'packages': 'packages',
                    'submissions': 'submissions'
                };

                const collectionName = collectionMap[key] || key;
                const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();

                if (snapshot.empty) {
                    console.log('📭 No data in Firebase for:', collectionName);
                    return defaultVal;
                }

                const items = [];
                snapshot.forEach(doc => {
                    items.push({ id: doc.id, ...doc.data() });
                });

                console.log('🔥 Firebase loaded:', collectionName, items.length);
                return items;
            } catch (error) {
                console.error('Firebase get error:', error);
                // Fallback to localStorage
                return this.getLocal(key, defaultVal);
            }
        } else {
            console.log('💾 Using localStorage fallback');
            return this.getLocal(key, defaultVal);
        }
    },

    // SET data to Firebase or localStorage
    set: async function(key, data) {
        if (useFirebase) {
            try {
                const collectionMap = {
                    'portfolio': 'gallery',
                    'packages': 'packages',
                    'submissions': 'submissions'
                };

                const collectionName = collectionMap[key] || key;

                // For each item, save to Firestore
                for (const item of data) {
                    // If item has an id, use it, otherwise create new
                    if (item.id) {
                        // Check if document exists
                        const docRef = db.collection(collectionName).doc(String(item.id));
                        const docSnap = await docRef.get();

                        if (docSnap.exists) {
                            // Update existing
                            await docRef.update({
                                ...item,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        } else {
                            // Create new with same ID
                            await docRef.set({
                                ...item,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    } else {
                        // Generate a new ID
                        const docRef = db.collection(collectionName).doc();
                        await docRef.set({
                            ...item,
                            id: docRef.id,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }

                console.log('🔥 Firebase saved:', collectionName, data.length);
                return true;
            } catch (error) {
                console.error('Firebase set error:', error);
                // Fallback to localStorage
                return this.setLocal(key, data);
            }
        } else {
            return this.setLocal(key, data);
        }
    },

    // LocalStorage methods (fallback)
    getLocal: function(key, defaultVal = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            console.error('LocalStorage get error:', e);
            return defaultVal;
        }
    },

    setLocal: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('LocalStorage set error:', e);
            return false;
        }
    },

    // Check if using Firebase
    isFirebase: useFirebase
};

window.DataStore = DataStore;

// ========================================
// FIREBASE IMAGE UPLOAD
// ========================================

function uploadToFirebase(file) {
    if (!file) {
        showToast('Please select a file.', 'error');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File too large. Max 5MB.', 'error');
        return;
    }

    var statusEl = document.getElementById('firebaseStatus');
    if (statusEl) {
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Firebase...';
        statusEl.style.color = '#3498db';
    }

    // Create a unique filename
    var fileName = 'gallery/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    var uploadTask = storage.ref(fileName).put(file);

    uploadTask.on('state_changed',
        function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (statusEl) {
                statusEl.innerHTML = 'Uploading: ' + Math.round(progress) + '%';
            }
        },
        function(error) {
            console.error('Upload error:', error);
            if (statusEl) {
                statusEl.innerHTML = '❌ Upload failed: ' + error.message;
                statusEl.style.color = '#e74c3c';
            }
            showToast('❌ Upload failed: ' + error.message, 'error');
        },
        function() {
            // Upload completed successfully
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // Auto-fill the URL field
                var urlInput = document.getElementById('quickImageUrl');
                if (urlInput) {
                    urlInput.value = downloadURL;
                }

                // Show preview
                var preview = document.getElementById('quickPreview');
                if (preview) {
                    preview.innerHTML = '<img src="' + downloadURL + '" alt="Preview" style="max-width:100%;max-height:250px;border-radius:8px;">';
                    preview.classList.add('has-preview');
                }

                if (statusEl) {
                    statusEl.innerHTML = '✅ Uploaded successfully!';
                    statusEl.style.color = '#27ae60';
                }

                showToast('✅ Image uploaded to Firebase!', 'success');
            }).catch(function(error) {
                console.error('Get download URL error:', error);
                showToast('❌ Error getting image URL', 'error');
            });
        }
    );
}

// ========================================
// INITIAL DATA
// ========================================

function initializeData() {
    // Data is now stored in Firebase, but we keep localStorage as fallback
    console.log('📦 Using Firebase for data storage:', useFirebase);
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
// CLIENT GALLERY
// ========================================

function loadGalleryPreview() {
    var container = document.getElementById('galleryPreview');
    if (!container) return;

    var items = DataStore.get('portfolio').slice(0, 4);
    if (items.length === 0) {
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
    if (items.length === 0) {
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
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#999;">No packages available.</p>';
        return;
    }

    var html = '';
    items.forEach(function(pkg) {
        var featuredClass = pkg.featured ? 'featured' : '';
        html += '<div class="package-card ' + featuredClass + '">';
        html += '<div class="package-header">';
        html += '<h3>' + pkg.name + '</h3>';
        html += '<div class="package-price">₹' + pkg.price.toLocaleString() + ' <span>/ session</span></div>';
        html += '</div>';
        html += '<div class="package-body">';
        html += '<ul>';
        pkg.features.forEach(function(f) {
            html += '<li><i class="fas fa-check"></i> ' + f + '</li>';
        });
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

                // Save to Firebase
                var submissions = DataStore.get('submissions');
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
                console.log('✅ Submission saved to Firebase');

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
// ADMIN PANEL
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
// ADMIN DASHBOARD
// ========================================

function initAdminDashboard() {
    console.log('📊 Loading Dashboard...');

    try {
        var portfolio = DataStore.get('portfolio') || [];
        var packages = DataStore.get('packages') || [];
        var submissions = DataStore.get('submissions') || [];

        var portfolioCount = Array.isArray(portfolio) ? portfolio.length : 0;
        var packagesCount = Array.isArray(packages) ? packages.length : 0;
        var submissionsCount = Array.isArray(submissions) ? submissions.length : 0;

        var totalRevenue = 0;
        if (Array.isArray(packages)) {
            packages.forEach(function(pkg) {
                var price = parseFloat(pkg.price) || 0;
                if (price > 0) totalRevenue += price;
            });
        }

        console.log('📸 Portfolio:', portfolioCount);
        console.log('📦 Packages:', packagesCount);
        console.log('📩 Submissions:', submissionsCount);
        console.log('💰 Revenue:', totalRevenue);

        var statPortfolio = document.getElementById('statPortfolio');
        var statPackages = document.getElementById('statPackages');
        var statSubmissions = document.getElementById('statSubmissions');
        var statRevenue = document.getElementById('statRevenue');

        if (statPortfolio) statPortfolio.textContent = portfolioCount;
        if (statPackages) statPackages.textContent = packagesCount;
        if (statSubmissions) statSubmissions.textContent = submissionsCount;
        if (statRevenue) statRevenue.textContent = '₹' + totalRevenue.toLocaleString('en-IN');

        var recentTable = document.getElementById('recentSubmissions');
        if (recentTable) {
            var recent = Array.isArray(submissions) ? submissions.slice(-5).reverse() : [];

            if (recent.length === 0) {
                recentTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;padding:30px;">No submissions yet.</td></tr>';
            } else {
                var html = '';
                recent.forEach(function(s) {
                    var statusText = s.status || 'new';
                    var statusClass = statusText === 'new' ? 'badge-new' : 'badge-read';
                    var dateText = s.date || new Date().toLocaleString();
                    html += '<tr><td><strong>' + (s.name || 'Unknown') + '</strong></td><td>' + (s.email || 'N/A') + '</td><td><span class="badge ' + statusClass + '">' + statusText + '</span></td><td style="color:#888;">' + dateText + '</td></tr>';
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
// ADMIN PACKAGES
// ========================================

function initAdminPackages() {
    renderPackagesTable();

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
            savePackage(e);
        });
    }
}

function renderPackagesTable() {
    var table = document.getElementById('packagesTable');
    if (!table) return;

    var items = DataStore.get('packages') || [];

    if (items.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:40px;">No packages added yet.</td></tr>';
        return;
    }

    var html = '';
    items.forEach(function(pkg) {
        var featuredBadge = pkg.featured ? '<span style="background:#D4AF37;color:#0A0A0A;padding:2px 10px;border-radius:12px;font-size:0.7rem;font-weight:600;"><i class="fas fa-star"></i> Featured</span>' : 'No';
        html += '<tr><td><strong>' + (pkg.name || 'Untitled') + '</strong></td><td>₹' + (pkg.price || 0).toLocaleString() + '</td><td>' + (Array.isArray(pkg.features) ? pkg.features.length : 0) + ' features</td><td>' + featuredBadge + '</td><td><div class="actions"><button class="btn-sm btn-edit" onclick="editPackage(' + pkg.id + ')"><i class="fas fa-edit"></i> Edit</button><button class="btn-sm btn-delete" onclick="deletePackage(' + pkg.id + ')"><i class="fas fa-trash"></i> Delete</button></div></td></tr>';
    });
    table.innerHTML = html;
}

window.editPackage = function(id) {
    var items = DataStore.get('packages') || [];
    var pkg = null;
    for (var i = 0; i < items.length; i++) {
        if (String(items[i].id) === String(id)) {
            pkg = items[i];
            break;
        }
    }
    if (pkg) {
        openPackageModal(pkg);
    } else {
        showToast('Package not found.', 'error');
    }
};

window.deletePackage = function(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;

    var packages = DataStore.get('packages') || [];
    var newPackages = [];
    for (var i = 0; i < packages.length; i++) {
        if (String(packages[i].id) !== String(id)) {
            newPackages.push(packages[i]);
        }
    }
    DataStore.set('packages', newPackages);
    showToast('Package deleted successfully!', 'success');
    renderPackagesTable();
};

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
    document.getElementById('pkgFeatures').value = pkg ? (Array.isArray(pkg.features) ? pkg.features.join('\n') : pkg.features) : '';
    document.getElementById('pkgFeatured').checked = pkg ? pkg.featured : false;

    modal.classList.add('active');
}

function closeModal() {
    var modal = document.getElementById('packageModal');
    if (modal) modal.classList.remove('active');
}

function savePackage(e) {
    e.preventDefault();

    var id = document.getElementById('packageId').value;
    var name = document.getElementById('pkgName').value.trim();
    var price = parseFloat(document.getElementById('pkgPrice').value);
    var featuresText = document.getElementById('pkgFeatures').value;
    var featured = document.getElementById('pkgFeatured').checked;

    if (!name || !price || isNaN(price) || price <= 0) {
        showToast('Please fill in all fields correctly.', 'error');
        return;
    }

    var features = featuresText.split('\n').map(function(f) { return f.trim(); }).filter(function(f) { return f.length > 0; });

    if (features.length === 0) {
        showToast('Please enter at least one feature.', 'error');
        return;
    }

    var packages = DataStore.get('packages') || [];

    if (id) {
        for (var i = 0; i < packages.length; i++) {
            if (String(packages[i].id) === String(id)) {
                packages[i] = { id: packages[i].id, name: name, price: price, features: features, featured: featured };
                break;
            }
        }
        showToast('Package updated successfully!', 'success');
    } else {
        packages.push({ id: Date.now() + Math.random() * 1000, name: name, price: price, features: features, featured: featured });
        showToast('Package added successfully!', 'success');
    }

    DataStore.set('packages', packages);
    closeModal();
    renderPackagesTable();
}

// ========================================
// ADMIN SUBMISSIONS
// ========================================

function initAdminSubmissions() {
    console.log('📩 Initializing Submissions...');
    renderSubmissions();

    var markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            var submissions = DataStore.get('submissions') || [];
            var hasNew = false;
            for (var i = 0; i < submissions.length; i++) {
                if (submissions[i].status === 'new') {
                    submissions[i].status = 'read';
                    hasNew = true;
                }
            }
            if (hasNew) {
                DataStore.set('submissions', submissions);
                renderSubmissions();
                showToast('All submissions marked as read.', 'success');
            } else {
                showToast('No new submissions to mark.', 'info');
            }
        });
    }

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            renderSubmissions();
            showToast('🔄 Refreshed', 'info');
        });
    }

    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#b8b8b8';
            });
            this.classList.add('active');
            this.style.background = 'rgba(212, 175, 55, 0.15)';
            this.style.color = '#D4AF37';

            currentFilter = this.dataset.filter;
            renderSubmissions();
        });
    });
}

var currentFilter = 'all';

function renderSubmissions() {
    console.log('📩 Rendering submissions...');

    var table = document.getElementById('submissionsTable');
    if (!table) {
        console.error('Table not found!');
        return;
    }

    var items = DataStore.get('submissions') || [];
    console.log('📩 Submissions found:', items.length);

    var filtered = items;
    if (currentFilter !== 'all') {
        filtered = items.filter(function(s) {
            return s.status === currentFilter;
        });
    }

    var countEl = document.getElementById('submissionCount');
    if (countEl) {
        countEl.textContent = filtered.length + ' submissions';
    }

    if (filtered.length === 0) {
        table.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666;padding:40px;">No submissions yet.</td></tr>';
        return;
    }

    var html = '';
    filtered.forEach(function(s, index) {
        var statusClass = s.status === 'new' ? 'badge-new' : s.status === 'replied' ? 'badge-replied' : 'badge-read';
        var rowClass = s.status === 'new' ? 'submission-new' : '';
        var dateText = s.date || new Date().toLocaleString();

        html += '<tr class="' + rowClass + '">';
        html += '<td>' + (index + 1) + '</td>';
        html += '<td><strong>' + (s.name || 'Unknown') + '</strong></td>';
        html += '<td><a href="mailto:' + (s.email || '') + '" style="color:#D4AF37;text-decoration:none;">' + (s.email || 'N/A') + '</a></td>';
        html += '<td>' + (s.phone || '-') + '</td>';
        html += '<td>' + (s.service || '-') + '</td>';
        html += '<td><span class="' + statusClass + '">' + (s.status || 'new') + '</span></td>';
        html += '<td style="font-size:0.85rem;color:#888;">' + dateText + '</td>';
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
    var items = DataStore.get('submissions') || [];
    var sub = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            sub = items[i];
            break;
        }
    }
    if (!sub) return;

    alert('📩 Message from ' + sub.name + '\n\nEmail: ' + sub.email + '\nPhone: ' + (sub.phone || 'N/A') + '\nService: ' + sub.service + '\nDate: ' + sub.date + '\n\nMessage:\n' + sub.message);

    if (sub.status === 'new') {
        var submissions = DataStore.get('submissions') || [];
        for (var j = 0; j < submissions.length; j++) {
            if (submissions[j].id === id) {
                submissions[j].status = 'read';
                break;
            }
        }
        DataStore.set('submissions', submissions);
        renderSubmissions();
        showToast('Marked as read.', 'success');
    }
};

window.markRead = function(id) {
    var submissions = DataStore.get('submissions') || [];
    for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].id === id) {
            submissions[i].status = 'read';
            break;
        }
    }
    DataStore.set('submissions', submissions);
    renderSubmissions();
    showToast('Marked as read.', 'success');
};

window.deleteSubmission = function(id) {
    if (!confirm('Delete this submission?')) return;

    var submissions = DataStore.get('submissions') || [];
    var newSubmissions = [];
    for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].id !== id) {
            newSubmissions.push(submissions[i]);
        }
    }
    DataStore.set('submissions', newSubmissions);
    renderSubmissions();
    showToast('Submission deleted.', 'success');
};

// ========================================
// ADMIN GALLERY
// ========================================

function initAdminGallery() {
    console.log('📸 Initializing Admin Gallery...');
    renderAdminGallery();
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
            if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('images/'))) {
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
            savePortfolio(e);
        });
    }
}

function renderAdminGallery() {
    var container = document.getElementById('adminGalleryGrid');
    if (!container) return;

    var items = DataStore.get('portfolio') || [];

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-gallery-state"><i class="fas fa-images"></i><h3>No Images in Gallery</h3><p>Add your first image using the form above.</p></div>';
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
    var items = DataStore.get('portfolio') || [];
    var count = items.length;

    var totalEl = document.getElementById('totalImages');
    if (totalEl) totalEl.textContent = count;

    var weddingCount = 0,
        eventCount = 0,
        portraitCount = 0,
        natureCount = 0;
    items.forEach(function(item) {
        if (item.category === 'wedding') weddingCount++;
        else if (item.category === 'event') eventCount++;
        else if (item.category === 'portrait') portraitCount++;
        else if (item.category === 'nature') natureCount++;
    });

    var weddingEl = document.getElementById('weddingCount');
    var eventEl = document.getElementById('eventCount');
    var portraitEl = document.getElementById('portraitCount');
    var natureEl = document.getElementById('natureCount');

    if (weddingEl) weddingEl.textContent = weddingCount;
    if (eventEl) eventEl.textContent = eventCount;
    if (portraitEl) portraitEl.textContent = portraitCount;
    if (natureEl) natureEl.textContent = natureCount;
}

// ========================================
// QUICK ADD IMAGE
// ========================================

window.quickAddImage = function() {
    console.log('Quick Add triggered');
    var urlInput = document.getElementById('quickImageUrl');
    var titleInput = document.getElementById('quickImageTitle');
    var categorySelect = document.getElementById('quickCategory');
    var descriptionInput = document.getElementById('quickDescription');

    if (!urlInput) return;

    var url = urlInput.value.trim();
    var title = titleInput ? titleInput.value.trim() : '';
    var category = categorySelect ? categorySelect.value : 'custom';
    var description = descriptionInput ? descriptionInput.value.trim() : '';

    if (!url) {
        showToast('Please enter an image URL.', 'error');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('images/')) {
        showToast('Please enter a valid URL (http://, https://, or images/)', 'error');
        return;
    }

    var portfolio = DataStore.get('portfolio') || [];

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

    renderAdminGallery();
};

window.handleUrlUpload = function() {
    var urlInput = document.getElementById('urlInput');
    if (!urlInput) return;

    var urls = urlInput.value.split('\n').map(function(url) { return url.trim(); }).filter(function(url) { return url.length > 0; });

    if (urls.length === 0) {
        showToast('Please paste at least one image URL.', 'error');
        return;
    }

    var portfolio = DataStore.get('portfolio') || [];
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
    showToast('✅ ' + addedCount + ' images added successfully!', 'success');
    urlInput.value = '';
    renderAdminGallery();
};

window.viewImage = function(id) {
    var items = DataStore.get('portfolio') || [];
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
    var items = DataStore.get('portfolio') || [];
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
        showToast('Image not found.', 'error');
    }
};

window.deleteImage = function(id) {
    if (!confirm('Delete this image?')) return;

    var portfolio = DataStore.get('portfolio') || [];
    var newPortfolio = [];
    for (var i = 0; i < portfolio.length; i++) {
        if (String(portfolio[i].id) !== String(id)) {
            newPortfolio.push(portfolio[i]);
        }
    }
    DataStore.set('portfolio', newPortfolio);
    showToast('Image deleted successfully!', 'success');
    renderAdminGallery();
};

window.refreshGallery = function() {
    renderAdminGallery();
    showToast('🔄 Gallery refreshed!', 'info');
};

window.clearAllImages = function() {
    var items = DataStore.get('portfolio') || [];
    if (items.length === 0) {
        showToast('No images to clear.', 'info');
        return;
    }
    if (!confirm('⚠️ Delete ALL ' + items.length + ' images? This cannot be undone!')) return;

    DataStore.set('portfolio', []);
    showToast('All images cleared!', 'success');
    renderAdminGallery();
};

function openPortfolioModal(item) {
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
}

function savePortfolio(e) {
    e.preventDefault();

    var id = document.getElementById('portfolioId').value;
    var title = document.getElementById('portTitle').value.trim();
    var category = document.getElementById('portCategory').value;
    var image = document.getElementById('portImage').value.trim();
    var description = document.getElementById('portDescription').value.trim();

    if (!title || !category || !image) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    var portfolio = DataStore.get('portfolio') || [];

    if (id) {
        for (var i = 0; i < portfolio.length; i++) {
            if (String(portfolio[i].id) === String(id)) {
                portfolio[i] = { id: portfolio[i].id, title: title, category: category, image: image, description: description || '' };
                break;
            }
        }
        showToast('✅ Image updated successfully!', 'success');
    } else {
        portfolio.push({ id: Date.now() + Math.random() * 1000, title: title, category: category, image: image, description: description || '' });
        showToast('✅ Image added successfully!', 'success');
    }

    DataStore.set('portfolio', portfolio);
    closeModal();
    renderAdminGallery();
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
window.renderSubmissions = renderSubmissions;
window.renderPackagesTable = renderPackagesTable;
window.renderAdminGallery = renderAdminGallery;
window.updateStats = updateStats;
window.uploadToFirebase = uploadToFirebase;

console.log('📱 Mahadev Photography v' + APP_VERSION + ' loaded!');
console.log('📸 Admin Login: admin@mahadevphotography.com / admin123');
console.log('🔥 Firebase Status:', useFirebase ? 'Connected ✅' : 'Not connected ❌');
console.log('📞 Contact: +91 94264 24213, +91 81608 42941');