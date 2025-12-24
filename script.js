
document.addEventListener('DOMContentLoaded', function() {
    // ===== LOGIN FUNCTIONALITY =====
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLink = document.getElementById('profile-link');
    const settingsLink = document.getElementById('settings-link');

    // Add class to move login to right side
    if (loginSection) {
        loginSection.classList.add('login-right');
    }

    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminDashboard();
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Simple validation (in real app, this would be server-side)
            if (email === 'admin@organicmart.com' && password === 'admin123') {
                // Show loading state
                showLoading(true);
                
                // Simulate API call
                setTimeout(() => {
                    // Store login state
                    if (rememberMe) {
                        localStorage.setItem('adminLoggedIn', 'true');
                    } else {
                        sessionStorage.setItem('adminLoggedIn', 'true');
                    }
                    
                    showAdminDashboard();
                    showLoading(false);
                    showToast('Login successful! Welcome back.', 'success');
                }, 1500);
            } else {
                showToast('Invalid email or password. Please try again.', 'error');
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                showLoading(true);
                
                setTimeout(() => {
                    // Clear login state
                    localStorage.removeItem('adminLoggedIn');
                    sessionStorage.removeItem('adminLoggedIn');
                    
                    showLoginSection();
                    showLoading(false);
                    showToast('Logged out successfully.', 'success');
                }, 1000);
            }
        });
    }

    function showAdminDashboard() {
        if (loginSection) loginSection.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        initDashboard();
    }

    function showLoginSection() {
        if (loginSection) {
            loginSection.style.display = 'flex';
            loginSection.classList.add('login-right');
        }
        if (adminDashboard) adminDashboard.style.display = 'none';
        
        // Reset login form
        if (loginForm) {
            loginForm.reset();
            if (passwordInput) {
                passwordInput.setAttribute('type', 'password');
            }
            if (togglePassword) {
                togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    }

    // ===== ADMIN DASHBOARD FUNCTIONALITY =====
    const state = {
        currentSection: 'dashboard',
        products: [],
        orders: [],
        customers: [],
        categories: [],
        reviews: [],
        coupons: [],
        isEditing: false,
        editingProductId: null,
        editingCouponId: null,
        currentSettingsTab: 'general',
        viewMode: 'grid',
        notifications: [],
        user: {
            name: 'Admin User',
            role: 'Super Admin',
            email: 'admin@organicmart.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
        },
        profileTabs: ['personal', 'security', 'preferences', 'notifications'],
        currentProfileTab: 'personal'
    };

    // ===== DOM ELEMENTS =====
    let elements = {};

    function initElements() {
        elements = {
            navItems: document.querySelectorAll('.nav-item'),
            adminSections: document.querySelectorAll('.admin-section'),
            addProductBtn: document.getElementById('add-product-btn'),
            addCategoryBtn: document.getElementById('add-category-btn'),
            addCouponBtn: document.getElementById('add-coupon-btn'),
            mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
            adminSidebar: document.querySelector('.admin-sidebar'),
            productsView: document.getElementById('products-view'),
            couponsContainer: document.getElementById('coupons-container'),
            viewButtons: document.querySelectorAll('.view-btn'),
            submenuItems: document.querySelectorAll('.has-submenu'),
            notificationBell: document.querySelector('.notification-bell'),
            markAllRead: document.querySelector('.mark-all-read'),
            settingsNavItems: document.querySelectorAll('.settings-nav .nav-item'),
            profileTabs: document.querySelectorAll('.profile-tab'),
            productModal: document.getElementById('product-modal'),
            couponModal: document.getElementById('coupon-modal'),
            categoryModal: document.getElementById('category-modal'),
            avatarUpload: document.getElementById('avatar-upload'),
            profileAvatarImg: document.getElementById('profile-avatar-img'),
            profileNameDisplay: document.getElementById('profile-name-display'),
            profileRoleDisplay: document.getElementById('profile-role-display'),
            profileEmailDisplay: document.getElementById('profile-email-display'),
            userDropdown: document.querySelector('.user-dropdown'),
            adminUser: document.querySelector('.admin-user')
        };
    }

    // ===== INITIALIZATION =====
    function initDashboard() {
        // Initialize DOM elements
        initElements();
        
        // Load initial data
        loadSampleData();
        
        // Initialize event listeners
        initEventListeners();
        
        // Show dashboard by default
        showSection('dashboard');
        
        // Render initial data
        renderProducts();
        renderCoupons();
        
        // Initialize notifications
        initNotifications();
        
        console.log('Admin dashboard initialized');
    }

    function initEventListeners() {
        // Navigation
        elements.navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const link = this.querySelector('a');
                if (!link) return;
                
                const target = link.getAttribute('href').substring(1);
                
                // Handle submenu toggle
                if (this.classList.contains('has-submenu')) {
                    e.stopPropagation();
                    this.classList.toggle('active');
                    return;
                }
                
                // Update active nav item
                elements.navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                showSection(target);
                
                // Close mobile sidebar
                if (window.innerWidth <= 768) {
                    elements.adminSidebar.classList.remove('mobile-open');
                }
            });
        });

        // Profile link in user dropdown
        if (profileLink) {
            profileLink.addEventListener('click', function(e) {
                e.preventDefault();
                showSection('profile');
                // Close dropdown
                elements.userDropdown?.classList.remove('show');
            });
        }

        // Settings link in user dropdown
        if (settingsLink) {
            settingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showSection('general-settings');
                // Close dropdown
                elements.userDropdown?.classList.remove('show');
            });
        }

        // User dropdown toggle
        if (elements.adminUser) {
            elements.adminUser.addEventListener('click', function(e) {
                e.stopPropagation();
                elements.userDropdown?.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (elements.userDropdown) {
                elements.userDropdown.classList.remove('show');
            }
        });

        // Settings navigation
        if (elements.settingsNavItems) {
            elements.settingsNavItems.forEach(item => {
                item.addEventListener('click', function() {
                    const tab = this.getAttribute('data-tab');
                    showSettingsTab(tab);
                });
            });
        }

        // Profile tabs
        if (elements.profileTabs) {
            elements.profileTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    showProfileTab(tabId);
                });
            });
        }

        // Mobile menu toggle
        if (elements.mobileMenuToggle) {
            elements.mobileMenuToggle.addEventListener('click', function() {
                elements.adminSidebar.classList.toggle('mobile-open');
            });
        }

        // View mode toggle
        if (elements.viewButtons) {
            elements.viewButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const view = this.getAttribute('data-view');
                    setViewMode(view);
                });
            });
        }

        // Submenu items
        elements.submenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('a')) {
                    this.classList.toggle('active');
                }
            });
        });

        // Add product button
        if (elements.addProductBtn) {
            elements.addProductBtn.addEventListener('click', function() {
                openProductModal();
            });
        }

        // Add category button
        if (elements.addCategoryBtn) {
            elements.addCategoryBtn.addEventListener('click', function() {
                openCategoryModal();
            });
        }

        // Add coupon button
        if (elements.addCouponBtn) {
            elements.addCouponBtn.addEventListener('click', function() {
                openCouponModal();
            });
        }

        // Add new category card
        const addCategoryCard = document.querySelector('.category-card.add-new');
        if (addCategoryCard) {
            addCategoryCard.addEventListener('click', function() {
                openCategoryModal();
            });
        }

        // Add new coupon card
        const addCouponCard = document.querySelector('.coupon-card.add-new');
        if (addCouponCard) {
            addCouponCard.addEventListener('click', function() {
                openCouponModal();
            });
        }

        // Mark all notifications as read
        if (elements.markAllRead) {
            elements.markAllRead.addEventListener('click', function(e) {
                e.stopPropagation();
                markAllNotificationsRead();
            });
        }

        // Notification bell toggle
        if (elements.notificationBell) {
            elements.notificationBell.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = this.querySelector('.notification-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            });
        }

        // Close notification dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.notification-bell')) {
                const dropdown = document.querySelector('.notification-dropdown.show');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            }
        });

        // Search functionality
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', debounce(function() {
                filterProducts(this.value);
            }, 300));
        }

        // Coupon search
        const couponSearch = document.getElementById('coupon-search');
        if (couponSearch) {
            couponSearch.addEventListener('input', debounce(function() {
                filterCoupons(this.value);
            }, 300));
        }

        // Filter functionality
        const categoryFilter = document.getElementById('category-filter');
        const statusFilter = document.getElementById('status-filter');
        const sortBy = document.getElementById('sort-by');
        
        [categoryFilter, statusFilter, sortBy].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', function() {
                    filterProducts();
                });
            }
        });

        // Coupon filters
        const couponStatusFilter = document.getElementById('coupon-status-filter');
        const couponTypeFilter = document.getElementById('coupon-type-filter');
        
        [couponStatusFilter, couponTypeFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', function() {
                    filterCoupons();
                });
            }
        });

        // Date range filter
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', function() {
                updateDashboardStats(this.value);
            });
        }

        // Global search
        const globalSearch = document.querySelector('.global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', debounce(function() {
                performGlobalSearch(this.value);
            }, 500));
        }

        // Avatar upload
        if (elements.avatarUpload) {
            elements.avatarUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        elements.profileAvatarImg.src = e.target.result;
                        state.user.avatar = e.target.result;
                        showToast('Profile picture updated successfully!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Copy coupon code buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.copy-btn')) {
                const couponCode = e.target.closest('.coupon-code').querySelector('span').textContent;
                copyToClipboard(couponCode);
                showToast('Coupon code copied to clipboard!', 'success');
            }
        });

        // Close modals
        document.addEventListener('click', function(e) {
            // Close modal when clicking close button or outside modal
            if (e.target.classList.contains('close-modal') || 
                (e.target.classList.contains('modal') && !e.target.closest('.modal-content'))) {
                closeAllModals();
            }
        });

        // Cancel buttons in modals
        const cancelProductBtn = document.getElementById('cancel-product');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', function() {
                closeAllModals();
            });
        }

        const cancelCouponBtn = document.getElementById('cancel-coupon');
        if (cancelCouponBtn) {
            cancelCouponBtn.addEventListener('click', function() {
                closeAllModals();
            });
        }

        // Generate coupon code
        const generateCodeBtn = document.getElementById('generate-code');
        if (generateCodeBtn) {
            generateCodeBtn.addEventListener('click', function() {
                generateCouponCode();
            });
        }

        // Coupon type change
        const couponTypeSelect = document.getElementById('coupon-type');
        if (couponTypeSelect) {
            couponTypeSelect.addEventListener('change', function() {
                updateCouponAmountSuffix(this.value);
            });
        }

        // Product form submission
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProduct();
            });
        }

        // Product form tabs
        const productFormTabs = document.querySelectorAll('.form-tabs .form-tab');
        productFormTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                showProductFormTab(tabId);
            });
        });

        // Profile form submissions
        const personalForm = document.getElementById('personal-form');
        if (personalForm) {
            personalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfilePersonal();
            });
        }

        const securityForm = document.getElementById('security-form');
        if (securityForm) {
            securityForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfileSecurity();
            });
        }

        const preferencesForm = document.getElementById('preferences-form');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfilePreferences();
            });
        }

        const notificationsForm = document.getElementById('notifications-form');
        if (notificationsForm) {
            notificationsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfileNotifications();
            });
        }

        // Settings form submissions
        const generalSettingsForm = document.getElementById('general-settings-form');
        if (generalSettingsForm) {
            generalSettingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveGeneralSettings();
            });
        }

        const paymentSettingsForm = document.getElementById('payment-settings-form');
        if (paymentSettingsForm) {
            paymentSettingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                savePaymentSettings();
            });
        }

        const shippingSettingsForm = document.getElementById('shipping-settings-form');
        if (shippingSettingsForm) {
            shippingSettingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveShippingSettings();
            });
        }

        const notificationSettingsForm = document.getElementById('notification-settings-form');
        if (notificationSettingsForm) {
            notificationSettingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveNotificationSettings();
            });
        }

        const securitySettingsForm = document.getElementById('security-settings-form');
        if (securitySettingsForm) {
            securitySettingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveSecuritySettings();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.global-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Window resize handling
        window.addEventListener('resize', debounce(function() {
            handleResize();
        }, 250));

        // Initialize chart buttons
        initChartButtons();
    }

    function initChartButtons() {
        // Revenue analytics chart buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                chartBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                showToast(`Showing ${this.textContent} analytics`, 'info');
            });
        });

        // Analytics date range
        const analyticsDateRange = document.getElementById('analytics-date-range');
        if (analyticsDateRange) {
            analyticsDateRange.addEventListener('change', function() {
                showToast(`Analytics updated for ${this.options[this.selectedIndex].text}`, 'info');
            });
        }
    }

    function initNotifications() {
        state.notifications = [
            {
                id: 1,
                type: 'order',
                title: 'New Order Received',
                message: 'New order #OM124567 received from Rahul Sharma',
                time: '2 min ago',
                read: false,
                icon: 'shopping-cart'
            },
            {
                id: 2,
                type: 'customer',
                title: 'New Customer Registration',
                message: 'Priya Patel has registered as a new customer',
                time: '5 min ago',
                read: false,
                icon: 'user'
            },
            {
                id: 3,
                type: 'inventory',
                title: 'Low Stock Alert',
                message: 'Organic Bananas are running low on stock',
                time: '1 hour ago',
                read: true,
                icon: 'box'
            },
            {
                id: 4,
                type: 'review',
                title: 'New Product Review',
                message: 'Amit Kumar left a 5-star review for Organic Apples',
                time: '2 hours ago',
                read: true,
                icon: 'star'
            }
        ];
        
        updateNotificationBadge();
    }

    // ===== SECTION MANAGEMENT =====
    function showSection(sectionId) {
        // Hide all sections
        elements.adminSections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            state.currentSection = sectionId;
            
            // Update breadcrumb
            updateBreadcrumb(sectionId);
        }

        // Update page title
        document.title = `${getSectionTitle(sectionId)} - OrganicMart Admin`;
        
        // Load section-specific data
        loadSectionData(sectionId);
    }

    function getSectionTitle(sectionId) {
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Products',
            'categories': 'Categories',
            'orders': 'Orders',
            'customers': 'Customers',
            'inventory': 'Inventory',
            'analytics': 'Analytics',
            'reviews': 'Reviews',
            'coupons': 'Coupons',
            'profile': 'My Profile',
            'general-settings': 'General Settings',
            'payment-settings': 'Payment Settings',
            'shipping-settings': 'Shipping Settings',
            'notification-settings': 'Notification Settings'
        };
        return titles[sectionId] || 'Admin';
    }

    function updateBreadcrumb(sectionId) {
        const breadcrumb = document.querySelector('.section-header .breadcrumb');
        if (!breadcrumb) return;
        
        const sectionTitle = getSectionTitle(sectionId);
        
        if (sectionId.includes('settings')) {
            breadcrumb.innerHTML = `
                <span>Dashboard</span>
                <i class="fas fa-chevron-right"></i>
                <span>Settings</span>
                <i class="fas fa-chevron-right"></i>
                <span class="active">${sectionTitle}</span>
            `;
        } else if (sectionId === 'profile') {
            breadcrumb.innerHTML = `
                <span>Dashboard</span>
                <i class="fas fa-chevron-right"></i>
                <span class="active">${sectionTitle}</span>
            `;
        } else {
            breadcrumb.innerHTML = `
                <span>Dashboard</span>
                <i class="fas fa-chevron-right"></i>
                <span class="active">${sectionTitle}</span>
            `;
        }
    }

    function loadSectionData(sectionId) {
        switch(sectionId) {
            case 'products':
                renderProducts();
                break;
            case 'coupons':
                renderCoupons();
                break;
            case 'dashboard':
                updateDashboardStats('month');
                break;
            case 'profile':
                loadProfileData();
                break;
            case 'categories':
                renderCategories();
                break;
            case 'orders':
                renderOrders();
                break;
            case 'customers':
                renderCustomers();
                break;
            case 'inventory':
                renderInventory();
                break;
            case 'reviews':
                renderReviews();
                break;
        }
    }

    function showSettingsTab(tabId) {
        // Update active nav item
        elements.settingsNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });

        // Show corresponding tab
        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === `${tabId}-tab`) {
                tab.classList.add('active');
            }
        });

        state.currentSettingsTab = tabId;
    }

    function showProfileTab(tabId) {
        // Update active tab
        elements.profileTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        // Show corresponding tab content
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}-tab`) {
                pane.classList.add('active');
            }
        });

        state.currentProfileTab = tabId;
    }

    function showProductFormTab(tabId) {
        // Update active tab
        const tabs = document.querySelectorAll('.form-tabs .form-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            }
        });

        // Show corresponding tab content
        const panes = document.querySelectorAll('#product-form .tab-pane');
        panes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}-tab`) {
                pane.classList.add('active');
            }
        });
    }

    // ===== VIEW MODE MANAGEMENT =====
    function setViewMode(mode) {
        state.viewMode = mode;
        
        // Update active view button
        elements.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
        });
        
        // Re-render products
        if (state.currentSection === 'products') {
            renderProducts();
        }
    }

    // ===== PRODUCT MANAGEMENT =====
    function filterProducts(searchTerm = '') {
        const categoryFilter = document.getElementById('category-filter');
        const statusFilter = document.getElementById('status-filter');
        const sortBy = document.getElementById('sort-by');
        
        const category = categoryFilter ? categoryFilter.value : '';
        const status = statusFilter ? statusFilter.value : '';
        const sort = sortBy ? sortBy.value : 'newest';
        
        let filteredProducts = [...state.products];
        
        // Filter by search term
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by category
        if (category) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === category
            );
        }
        
        // Filter by status
        if (status) {
            if (status === 'out-of-stock') {
                filteredProducts = filteredProducts.filter(product => product.stock === 0);
            } else if (status === 'active') {
                filteredProducts = filteredProducts.filter(product => product.status);
            } else if (status === 'inactive') {
                filteredProducts = filteredProducts.filter(product => !product.status);
            }
        }
        
        // Sort products
        filteredProducts.sort((a, b) => {
            switch(sort) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'price-high':
                    return b.price - a.price;
                case 'price-low':
                    return a.price - b.price;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        renderProducts(filteredProducts);
    }

    function renderProducts(products = state.products) {
        if (!elements.productsView) return;

        if (products.length === 0) {
            elements.productsView.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-primary" id="add-product-empty">
                        <i class="fas fa-plus"></i>
                        Add New Product
                    </button>
                </div>
            `;
            
            document.getElementById('add-product-empty')?.addEventListener('click', function() {
                openProductModal();
            });
            return;
        }

        // INVENTORY-STYLE TABLE LAYOUT
        elements.productsView.innerHTML = `
            <div class="inventory-table-container">
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr data-id="${product.id}">
                                <td>
                                    <div class="product-info-cell">
                                        <div class="product-image-small">
                                            <img src="${product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop'}" alt="${product.name}">
                                        </div>
                                        <div class="product-details">
                                            <div class="product-name">${product.name}</div>
                                            <div class="product-brand">${product.brand || 'No Brand'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="category-badge">${capitalizeFirstLetter(product.category)}</span>
                                </td>
                                <td>
                                    <code class="sku-code">${product.sku}</code>
                                </td>
                                <td>
                                    <div class="price-cell">
                                        ${product.salePrice ? 
                                            `<span class="sale-price">₹${product.salePrice}</span>
                                             <span class="regular-price">₹${product.price}</span>` :
                                            `<span class="current-price">₹${product.price}</span>`
                                        }
                                    </div>
                                </td>
                                <td>
                                    <div class="stock-cell">
                                        <div class="stock-progress">
                                            <div class="stock-bar">
                                                <div class="stock-fill" style="width: ${Math.min((product.stock / 100) * 100, 100)}%"></div>
                                            </div>
                                            <span class="stock-text">${product.stock} units</span>
                                        </div>
                                        ${product.stock <= (product.lowStockThreshold || 5) ? 
                                            '<span class="low-stock-badge">Low Stock</span>' : ''
                                        }
                                    </div>
                                </td>
                                <td>
                                    <span class="status-badge ${getProductStatusClass(product)}">
                                        ${getProductStatusText(product)}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-outline edit-product" title="Edit Product">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline delete-product" title="Delete Product">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline toggle-status" title="Toggle Status">
                                            <i class="fas fa-power-off"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Add event listeners to table rows
        document.querySelectorAll('.inventory-table tbody tr').forEach(row => {
            const productId = row.getAttribute('data-id');
            
            // Edit button
            row.querySelector('.edit-product')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.editProduct(productId);
            });
            
            // Delete button
            row.querySelector('.delete-product')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.deleteProduct(productId);
            });
            
            // Toggle status button
            row.querySelector('.toggle-status')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.toggleProductStatus(productId);
            });
        });

        updateTableInfo(products.length, 'products');
    }

    function getProductStatusClass(product) {
        if (!product.status) return 'status-inactive';
        if (product.stock === 0) return 'status-out-of-stock';
        if (product.stock <= (product.lowStockThreshold || 5)) return 'status-low';
        return 'status-active';
    }

    function getProductStatusText(product) {
        if (!product.status) return 'Inactive';
        if (product.stock === 0) return 'Out of Stock';
        if (product.stock <= (product.lowStockThreshold || 5)) return 'Low Stock';
        return 'Active';
    }

    function saveProduct() {
        const productName = document.getElementById('product-name').value;
        const productSku = document.getElementById('product-sku').value;
        
        if (!productName || !productSku) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (state.isEditing && state.editingProductId) {
            // Update existing product
            const index = state.products.findIndex(p => p.id === state.editingProductId);
            if (index !== -1) {
                state.products[index] = {
                    ...state.products[index],
                    name: productName,
                    sku: productSku,
                    category: document.getElementById('product-category').value,
                    brand: document.getElementById('product-brand').value,
                    description: document.getElementById('product-description').value,
                    price: parseFloat(document.getElementById('product-price').value) || 0,
                    salePrice: parseFloat(document.getElementById('product-sale-price').value) || null,
                    stock: parseInt(document.getElementById('product-stock').value) || 0
                };
                showToast('Product updated successfully!', 'success');
            }
        } else {
            // Add new product
            const newProduct = {
                id: Date.now().toString(),
                name: productName,
                sku: productSku,
                category: document.getElementById('product-category').value,
                brand: document.getElementById('product-brand').value,
                description: document.getElementById('product-description').value,
                price: parseFloat(document.getElementById('product-price').value) || 0,
                salePrice: parseFloat(document.getElementById('product-sale-price').value) || null,
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                status: true,
                rating: 4.5,
                images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'],
                createdAt: new Date().toISOString()
            };
            
            state.products.unshift(newProduct);
            showToast('Product added successfully!', 'success');
        }
        
        closeAllModals();
        renderProducts();
    }

    // ===== COUPON MANAGEMENT =====
    function filterCoupons(searchTerm = '') {
        const statusFilter = document.getElementById('coupon-status-filter');
        const typeFilter = document.getElementById('coupon-type-filter');
        
        const status = statusFilter ? statusFilter.value : '';
        const type = typeFilter ? typeFilter.value : '';
        
        let filteredCoupons = [...state.coupons];
        
        // Filter by search term
        if (searchTerm) {
            filteredCoupons = filteredCoupons.filter(coupon =>
                coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by status
        if (status) {
            filteredCoupons = filteredCoupons.filter(coupon => coupon.status === status);
        }
        
        // Filter by type
        if (type) {
            filteredCoupons = filteredCoupons.filter(coupon => coupon.type === type);
        }
        
        renderCoupons(filteredCoupons);
    }

    function renderCoupons(coupons = state.coupons) {
        if (!elements.couponsContainer) return;

        if (coupons.length === 0) {
            elements.couponsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No coupons found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-primary" id="add-coupon-empty">
                        <i class="fas fa-plus"></i>
                        Create New Coupon
                    </button>
                </div>
            `;
            
            document.getElementById('add-coupon-empty')?.addEventListener('click', function() {
                openCouponModal();
            });
            return;
        }

        // Create coupon cards
        elements.couponsContainer.innerHTML = coupons.map(coupon => `
            <div class="coupon-card" data-id="${coupon.id}">
                <div class="coupon-header">
                    <div class="coupon-code">
                        <span>${coupon.code}</span>
                        <button class="copy-btn" title="Copy Code">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="coupon-type ${coupon.type}">
                        ${getCouponTypeText(coupon)}
                    </div>
                </div>
                <div class="coupon-body">
                    <h4 class="coupon-title">${coupon.title}</h4>
                    <p class="coupon-desc">${coupon.description || ''}</p>
                    <div class="coupon-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Valid until: ${formatDate(coupon.validUntil)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>Used: ${coupon.usageCount || 0} times</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-rupee-sign"></i>
                            <span>Discount: ₹${(coupon.discountAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="coupon-footer">
                    <span class="status ${coupon.status}">${capitalizeFirstLetter(coupon.status)}</span>
                    <div class="coupon-actions">
                        <button class="action-btn edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn stats" title="Statistics">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                        <button class="action-btn delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to coupon cards
        document.querySelectorAll('.coupon-card').forEach(card => {
            const couponId = card.getAttribute('data-id');
            
            // Edit button
            card.querySelector('.action-btn.edit')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.editCoupon(couponId);
            });
            
            // Stats button
            card.querySelector('.action-btn.stats')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.viewCouponStats(couponId);
            });
            
            // Delete button
            card.querySelector('.action-btn.delete')?.addEventListener('click', function(e) {
                e.stopPropagation();
                adminApp.deleteCoupon(couponId);
            });
        });

        // Add "Add New" card
        elements.couponsContainer.innerHTML += `
            <div class="coupon-card add-new">
                <div class="add-new-content">
                    <i class="fas fa-plus"></i>
                    <span>Create New Coupon</span>
                </div>
            </div>
        `;

        // Add event listener to new coupon card
        const newCouponCard = elements.couponsContainer.querySelector('.coupon-card.add-new');
        if (newCouponCard) {
            newCouponCard.addEventListener('click', function() {
                openCouponModal();
            });
        }
    }

    function getCouponTypeText(coupon) {
        switch(coupon.type) {
            case 'percentage':
                return `${coupon.value || 0}% OFF`;
            case 'fixed':
                return `₹${coupon.value || 0} OFF`;
            case 'free-shipping':
                return 'FREE SHIPPING';
            case 'bogo':
                return 'BUY 1 GET 1';
            default:
                return coupon.type.toUpperCase();
        }
    }

    // ===== CATEGORY MANAGEMENT =====
    function renderCategories() {
        // Add event listeners to category cards
        document.querySelectorAll('.category-card:not(.add-new)').forEach(card => {
            // Edit button
            card.querySelector('.action-btn.edit')?.addEventListener('click', function(e) {
                e.stopPropagation();
                showToast('Edit category feature coming soon!', 'info');
            });
            
            // Delete button
            card.querySelector('.action-btn.delete')?.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this category?')) {
                    showToast('Category deleted successfully!', 'success');
                    card.remove();
                }
            });
        });
    }

    // ===== ORDER MANAGEMENT =====
    function renderOrders() {
        // Add event listeners to order actions
        document.querySelectorAll('.orders-table .action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.classList.contains('view') ? 'View' :
                              this.classList.contains('edit') ? 'Edit' :
                              this.classList.contains('print') ? 'Print' :
                              this.classList.contains('track') ? 'Track' :
                              this.classList.contains('process') ? 'Process' :
                              this.classList.contains('ship') ? 'Ship' : 'Action';
                showToast(`${action} order feature coming soon!`, 'info');
            });
        });
    }

    // ===== CUSTOMER MANAGEMENT =====
    function renderCustomers() {
        // Add event listeners to customer actions
        document.querySelectorAll('.customers-table .action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.classList.contains('view') ? 'View' :
                              this.classList.contains('edit') ? 'Edit' :
                              this.classList.contains('message') ? 'Message' : 'Action';
                showToast(`${action} customer feature coming soon!`, 'info');
            });
        });
    }

    // ===== INVENTORY MANAGEMENT =====
    function renderInventory() {
        // Add event listeners to inventory actions
        document.querySelectorAll('.inventory-table .action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.classList.contains('edit') ? 'Update Stock' :
                              this.classList.contains('history') ? 'Stock History' :
                              this.classList.contains('restock') ? 'Quick Restock' : 'Action';
                showToast(`${action} feature coming soon!`, 'info');
            });
        });
    }

    // ===== REVIEW MANAGEMENT =====
    function renderReviews() {
        // Add event listeners to review actions
        document.querySelectorAll('.review-actions .btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.textContent.trim().split('\n')[0] || 'Action';
                showToast(`${action} review feature coming soon!`, 'info');
            });
        });
    }

    // ===== DASHBOARD FUNCTIONS =====
    function updateDashboardStats(range) {
        const stats = {
            today: { revenue: '₹45,678', orders: '89', customers: '234', products: '156' },
            week: { revenue: '₹2,34,567', orders: '567', customers: '1,234', products: '156' },
            month: { revenue: '₹1,24,567', orders: '1,234', customers: '8,567', products: '156' },
            quarter: { revenue: '₹3,45,678', orders: '2,345', customers: '12,345', products: '156' },
            year: { revenue: '₹15,67,890', orders: '8,765', customers: '45,678', products: '156' }
        };

        const selectedStats = stats[range] || stats.month;
        
        animateValue('.quick-stats .stat-card:nth-child(1) .stat-value', selectedStats.revenue);
        animateValue('.quick-stats .stat-card:nth-child(2) .stat-value', selectedStats.orders);
        animateValue('.quick-stats .stat-card:nth-child(3) .stat-value', selectedStats.customers);
        animateValue('.quick-stats .stat-card:nth-child(4) .stat-value', selectedStats.products);
    }

    function animateValue(selector, newValue) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        element.style.opacity = '0.5';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = '1';
        }, 300);
    }

    // ===== PROFILE MANAGEMENT =====
    function loadProfileData() {
        if (elements.profileNameDisplay) {
            elements.profileNameDisplay.textContent = state.user.name;
        }
        if (elements.profileRoleDisplay) {
            elements.profileRoleDisplay.textContent = state.user.role;
        }
        if (elements.profileEmailDisplay) {
            elements.profileEmailDisplay.textContent = state.user.email;
        }
        if (elements.profileAvatarImg) {
            elements.profileAvatarImg.src = state.user.avatar;
        }
    }

    function saveProfilePersonal() {
        const fullName = document.getElementById('full-name').value;
        const displayName = document.getElementById('display-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const bio = document.getElementById('bio').value;
        const location = document.getElementById('location').value;
        const timezone = document.getElementById('timezone').value;

        state.user.name = fullName;
        state.user.email = email;
        
        // Update display
        if (elements.profileNameDisplay) {
            elements.profileNameDisplay.textContent = fullName;
        }
        if (elements.profileEmailDisplay) {
            elements.profileEmailDisplay.textContent = email;
        }

        showToast('Personal information updated successfully!', 'success');
    }

    function saveProfileSecurity() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword) {
            showToast('Please enter your current password', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        showToast('Security settings updated successfully!', 'success');
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }

    function saveProfilePreferences() {
        const compactView = document.getElementById('compact-view').checked;
        const darkMode = document.getElementById('dark-mode').checked;
        const animations = document.getElementById('animations').checked;
        const language = document.getElementById('language').value;
        const currency = document.getElementById('currency').value;

        localStorage.setItem('dashboard_preferences', JSON.stringify({
            compactView,
            darkMode,
            animations,
            language,
            currency
        }));

        showToast('Preferences saved successfully!', 'success');
    }

    function saveProfileNotifications() {
        const emailOrders = document.getElementById('email-orders').checked;
        const emailCustomers = document.getElementById('email-customers').checked;
        const emailReviews = document.getElementById('email-reviews').checked;
        const emailStock = document.getElementById('email-stock').checked;
        const pushOrders = document.getElementById('push-orders').checked;
        const pushSales = document.getElementById('push-sales').checked;
        const pushSystem = document.getElementById('push-system').checked;

        localStorage.setItem('notification_preferences', JSON.stringify({
            emailOrders,
            emailCustomers,
            emailReviews,
            emailStock,
            pushOrders,
            pushSales,
            pushSystem
        }));

        showToast('Notification preferences saved successfully!', 'success');
    }

    // ===== SETTINGS MANAGEMENT =====
    function saveGeneralSettings() {
        const storeName = document.getElementById('store-name').value;
        const storeEmail = document.getElementById('store-email').value;
        const storePhone = document.getElementById('store-phone').value;
        const storeAddress = document.getElementById('store-address').value;
        const storeCurrency = document.getElementById('store-currency').value;
        const storeTimezone = document.getElementById('store-timezone').value;

        localStorage.setItem('general_settings', JSON.stringify({
            storeName,
            storeEmail,
            storePhone,
            storeAddress,
            storeCurrency,
            storeTimezone
        }));

        showToast('General settings saved successfully!', 'success');
    }

    function savePaymentSettings() {
        const stripeEnabled = document.getElementById('stripe-enabled').checked;
        const paypalEnabled = document.getElementById('paypal-enabled').checked;
        const razorpayEnabled = document.getElementById('razorpay-enabled').checked;
        const currencySymbol = document.getElementById('currency-symbol').value;
        const currencyPosition = document.getElementById('currency-position').value;

        localStorage.setItem('payment_settings', JSON.stringify({
            stripeEnabled,
            paypalEnabled,
            razorpayEnabled,
            currencySymbol,
            currencyPosition
        }));

        showToast('Payment settings saved successfully!', 'success');
    }

    function saveShippingSettings() {
        const standardCost = document.getElementById('standard-cost').value;
        const standardFree = document.getElementById('standard-free').value;
        const expressCost = document.getElementById('express-cost').value;
        const expressFree = document.getElementById('express-free').value;
        const sameDayCost = document.getElementById('same-day-cost').value;
        const sameDayFree = document.getElementById('same-day-free').value;

        localStorage.setItem('shipping_settings', JSON.stringify({
            standardCost,
            standardFree,
            expressCost,
            expressFree,
            sameDayCost,
            sameDayFree
        }));

        showToast('Shipping settings saved successfully!', 'success');
    }

    function saveNotificationSettings() {
        const emailOrderNotifications = document.getElementById('email-order-notifications').checked;
        const emailCustomerNotifications = document.getElementById('email-customer-notifications').checked;
        const emailInventoryNotifications = document.getElementById('email-inventory-notifications').checked;
        const emailSystemNotifications = document.getElementById('email-system-notifications').checked;
        const smsOrderNotifications = document.getElementById('sms-order-notifications').checked;
        const smsDeliveryNotifications = document.getElementById('sms-delivery-notifications').checked;
        const pushRealTime = document.getElementById('push-real-time').checked;
        const pushMarketing = document.getElementById('push-marketing').checked;

        localStorage.setItem('system_notification_settings', JSON.stringify({
            emailOrderNotifications,
            emailCustomerNotifications,
            emailInventoryNotifications,
            emailSystemNotifications,
            smsOrderNotifications,
            smsDeliveryNotifications,
            pushRealTime,
            pushMarketing
        }));

        showToast('Notification settings saved successfully!', 'success');
    }

    function saveSecuritySettings() {
        const minPasswordLength = document.getElementById('min-password-length').value;
        const passwordExpiry = document.getElementById('password-expiry').value;
        const requireUppercase = document.getElementById('require-uppercase').checked;
        const requireNumbers = document.getElementById('require-numbers').checked;
        const requireSpecial = document.getElementById('require-special').checked;
        const enable2fa = document.getElementById('enable-2fa').checked;
        const maxLoginAttempts = document.getElementById('max-login-attempts').value;
        const lockoutDuration = document.getElementById('lockout-duration').value;
        const ipRestriction = document.getElementById('ip-restriction').checked;
        const sessionTimeout = document.getElementById('session-timeout').value;
        const maxSessions = document.getElementById('max-sessions').value;

        localStorage.setItem('security_settings', JSON.stringify({
            minPasswordLength,
            passwordExpiry,
            requireUppercase,
            requireNumbers,
            requireSpecial,
            enable2fa,
            maxLoginAttempts,
            lockoutDuration,
            ipRestriction,
            sessionTimeout,
            maxSessions
        }));

        showToast('Security settings saved successfully!', 'success');
    }

    // ===== MODAL FUNCTIONS =====
    function openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        
        if (productId) {
            // Edit mode
            state.isEditing = true;
            state.editingProductId = productId;
            title.textContent = 'Edit Product';
            
            const product = state.products.find(p => p.id === productId);
            if (product) {
                // Populate form fields
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-sku').value = product.sku;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-brand').value = product.brand || '';
                document.getElementById('product-description').value = product.description || '';
                document.getElementById('product-weight').value = product.weight || '';
                document.getElementById('product-dimensions').value = product.dimensions || '';
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-sale-price').value = product.salePrice || '';
                document.getElementById('product-stock').value = product.stock;
                document.getElementById('product-low-stock').value = product.lowStockThreshold || 5;
                document.getElementById('manage-stock').checked = product.manageStock || true;
                document.getElementById('backorders').checked = product.allowBackorders || false;
                document.getElementById('seo-title').value = product.seoTitle || '';
                document.getElementById('meta-description').value = product.metaDescription || '';
                document.getElementById('slug').value = product.slug || '';
            }
        } else {
            // Add mode
            state.isEditing = false;
            state.editingProductId = null;
            title.textContent = 'Add New Product';
            
            // Reset form
            document.getElementById('product-form').reset();
        }
        
        modal.style.display = 'flex';
    }

    function openCategoryModal() {
        const modal = document.getElementById('category-modal');
        modal.style.display = 'flex';
    }

    function openCouponModal(couponId = null) {
        const modal = document.getElementById('coupon-modal');
        const title = document.getElementById('coupon-modal-title');
        
        if (couponId) {
            // Edit mode
            state.editingCouponId = couponId;
            title.textContent = 'Edit Coupon';
            
            const coupon = state.coupons.find(c => c.id === couponId);
            if (coupon) {
                // Populate form fields
                document.getElementById('coupon-code').value = coupon.code;
                document.getElementById('coupon-name').value = coupon.title;
                document.getElementById('coupon-type').value = coupon.type;
                document.getElementById('coupon-amount').value = coupon.value;
                document.getElementById('coupon-description').value = coupon.description || '';
                document.getElementById('start-date').value = coupon.startDate || '';
                document.getElementById('end-date').value = coupon.validUntil || '';
                updateCouponAmountSuffix(coupon.type);
            }
        } else {
            // Add mode
            state.editingCouponId = null;
            title.textContent = 'Create New Coupon';
            
            // Reset form
            document.getElementById('coupon-form').reset();
            generateCouponCode();
            updateCouponAmountSuffix('percentage');
        }
        
        modal.style.display = 'flex';
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    function generateCouponCode() {
        const prefixes = ['WELCOME', 'SAVE', 'DISCOUNT', 'OFFER', 'SALE', 'FESTIVE'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const numbers = Math.floor(Math.random() * 90) + 10; // 10-99
        const code = `${prefix}${numbers}`;
        document.getElementById('coupon-code').value = code;
    }

    function updateCouponAmountSuffix(type) {
        const suffix = document.getElementById('amount-suffix');
        const amountInput = document.getElementById('coupon-amount');
        
        switch(type) {
            case 'percentage':
                suffix.textContent = '%';
                amountInput.placeholder = '20';
                amountInput.disabled = false;
                break;
            case 'fixed':
                suffix.textContent = '₹';
                amountInput.placeholder = '500';
                amountInput.disabled = false;
                break;
            case 'free-shipping':
            case 'bogo':
                suffix.textContent = '';
                amountInput.placeholder = '0';
                amountInput.disabled = true;
                break;
            default:
                suffix.textContent = '%';
                amountInput.placeholder = '20';
                amountInput.disabled = false;
        }
    }

    // ===== NOTIFICATION MANAGEMENT =====
    function markAllNotificationsRead() {
        state.notifications.forEach(notification => {
            notification.read = true;
        });
        updateNotificationBadge();
        showToast('All notifications marked as read', 'success');
    }

    function updateNotificationBadge() {
        const unreadCount = state.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-bell .notification-count');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
const mailIcon = document.querySelector('.icon-item .fa-envelope').parentElement;
const messageDropdown = document.querySelector('.message-dropdown');
const markReadBtn = document.querySelector('.message-dropdown .mark-all-read');
const unreadMsgs = document.querySelectorAll('.message-item.unread');
const mailCount = mailIcon.querySelector('.notification-count');

mailIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    messageDropdown.style.display =
        messageDropdown.style.display === 'block' ? 'none' : 'block';
});

markReadBtn.addEventListener('click', () => {
    unreadMsgs.forEach(msg => msg.classList.remove('unread'));
    if (mailCount) mailCount.style.display = 'none';
});

document.addEventListener('click', () => {
    messageDropdown.style.display = 'none';
});

    // ===== UTILITY FUNCTIONS =====
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function formatDate(dateString) {
        if (!dateString) return 'No expiry';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    function getToastIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    function getToastTitle(type) {
        switch(type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'warning': return 'Warning';
            default: return 'Info';
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function performGlobalSearch(query) {
        if (!query.trim()) return;
        
        // In a real app, this would search across all sections
        showToast(`Searching for "${query}"...`, 'info');
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            elements.adminSidebar.classList.remove('mobile-open');
        }
    }

    function updateTableInfo(total, type) {
        const tableInfo = document.querySelector('.table-info');
        if (tableInfo) {
            const showing = Math.min(total, type === 'products' ? 12 : 4);
            const typeText = type === 'products' ? 'products' : 
                           type === 'customers' ? 'customers' :
                           type === 'orders' ? 'orders' :
                           type === 'reviews' ? 'reviews' : 'items';
            tableInfo.textContent = `Showing 1-${showing} of ${total} ${typeText}`;
        }
    }

    // ===== SAMPLE DATA =====
    function loadSampleData() {
        state.products = [
            {
                id: '1',
                name: 'Organic Shimla Apples (1kg)',
                sku: 'APP001',
                category: 'fruits',
                brand: 'Organic Farms',
                description: 'Fresh organic Shimla apples, rich in nutrients and flavor. Grown in the pristine orchards of Himachal Pradesh.',
                weight: 1,
                dimensions: '10×8×8',
                price: 199,
                salePrice: 179,
                stock: 45,
                lowStockThreshold: 10,
                manageStock: true,
                allowBackorders: false,
                status: true,
                rating: 4.8,
                images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop'],
                seoTitle: 'Organic Shimla Apples - Fresh & Healthy',
                metaDescription: 'Buy fresh organic Shimla apples online. Rich in nutrients, perfect for health-conscious families.',
                slug: 'organic-shimla-apples',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: '2',
                name: 'Fresh Carrots (500g)',
                sku: 'CAR001',
                category: 'vegetables',
                brand: 'Green Valley',
                description: 'Sweet and crunchy fresh carrots, packed with vitamins and antioxidants.',
                weight: 0.5,
                dimensions: '15×8×8',
                price: 49,
                salePrice: null,
                stock: 0,
                lowStockThreshold: 5,
                manageStock: true,
                allowBackorders: true,
                status: true,
                rating: 4.6,
                images: ['https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400&h=300&fit=crop'],
                seoTitle: 'Fresh Carrots - Vitamin Rich',
                metaDescription: 'Fresh organic carrots rich in Vitamin A and antioxidants. Perfect for juices and cooking.',
                slug: 'fresh-carrots',
                createdAt: '2024-01-14T14:20:00Z'
            },
            {
                id: '3',
                name: 'Organic Milk (1L)',
                sku: 'MIL001',
                category: 'dairy',
                brand: 'Pure Dairy',
                description: 'Pure organic milk from grass-fed cows. No antibiotics or hormones.',
                weight: 1,
                dimensions: '8×8×18',
                price: 75,
                salePrice: 69,
                stock: 25,
                lowStockThreshold: 10,
                manageStock: true,
                allowBackorders: false,
                status: true,
                rating: 4.7,
                images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop'],
                seoTitle: 'Organic Milk - Grass Fed',
                metaDescription: 'Pure organic milk from grass-fed cows. Rich in calcium and protein.',
                slug: 'organic-milk',
                createdAt: '2024-01-16T08:15:00Z'
            }
        ];

        state.coupons = [
            {
                id: '1',
                code: 'WELCOME20',
                type: 'percentage',
                value: 20,
                title: 'Welcome Discount',
                description: 'Get 20% off on your first order',
                startDate: '2024-01-01',
                validUntil: '2024-12-31',
                usageCount: 234,
                discountAmount: 8450,
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: '2',
                code: 'FREESHIP',
                type: 'free-shipping',
                value: 0,
                title: 'Free Shipping',
                description: 'Free shipping on orders above ₹999',
                startDate: '2024-01-01',
                validUntil: '2025-01-15',
                usageCount: 156,
                discountAmount: 12340,
                status: 'active',
                createdAt: '2024-01-15T00:00:00Z'
            },
            {
                id: '3',
                code: 'SUMMER50',
                type: 'fixed',
                value: 500,
                title: 'Summer Sale',
                description: 'Get ₹500 off on orders above ₹2,999',
                startDate: '2024-06-01',
                validUntil: '2024-06-30',
                usageCount: 89,
                discountAmount: 44500,
                status: 'expired',
                createdAt: '2024-05-15T00:00:00Z'
            },
            {
                id: '4',
                code: 'ORGANIC10',
                type: 'percentage',
                value: 10,
                title: 'Organic Special',
                description: '10% off on all organic products',
                startDate: '2024-12-01',
                validUntil: '2024-12-31',
                usageCount: 67,
                discountAmount: 2345,
                status: 'active',
                createdAt: '2024-11-25T00:00:00Z'
            },
            {
                id: '5',
                code: 'BOGOFRUIT',
                type: 'bogo',
                value: 0,
                title: 'Buy One Get One Free',
                description: 'Buy one fruit product, get one free',
                startDate: '2024-12-15',
                validUntil: '2024-12-25',
                usageCount: 45,
                discountAmount: 5678,
                status: 'active',
                createdAt: '2024-12-10T00:00:00Z'
            }
        ];

        state.categories = [
            { id: '1', name: 'Fruits', productCount: 45, revenue: 89450 },
            { id: '2', name: 'Vegetables', productCount: 38, revenue: 67890 },
            { id: '3', name: 'Dairy', productCount: 22, revenue: 45670 },
            { id: '4', name: 'Grains', productCount: 28, revenue: 56780 },
            { id: '5', name: 'Spices', productCount: 15, revenue: 34560 }
        ];

        state.orders = [
            {
                id: '1',
                orderId: 'OM123456',
                customer: { name: 'Rahul Sharma', email: 'rahul@example.com' },
                date: '2024-12-12T10:30:00Z',
                amount: 2499,
                status: 'delivered',
                items: [
                    { name: 'Organic Apples', quantity: 2, price: 199 }
                ]
            }
        ];

        state.customers = [
            {
                id: '1',
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '+91 98765 43210',
                location: 'Mumbai, India',
                orders: 12,
                totalSpent: 24567,
                lastOrder: '2024-12-12',
                status: 'active'
            }
        ];

        state.reviews = [
            {
                id: '1',
                customer: { name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
                product: 'Organic Apples',
                rating: 5,
                comment: 'Excellent quality! The apples were fresh, sweet, and perfectly ripe.',
                date: '2024-12-12',
                status: 'approved'
            }
        ];
    }

    // ===== GLOBAL ACCESS =====
    window.adminApp = {
        // Product actions
        editProduct: (productId) => {
            openProductModal(productId);
        },
        deleteProduct: (productId) => {
            if (confirm('Are you sure you want to delete this product?')) {
                state.products = state.products.filter(p => p.id !== productId);
                renderProducts();
                showToast('Product deleted successfully!', 'success');
            }
        },
        toggleProductStatus: (productId) => {
            const product = state.products.find(p => p.id === productId);
            if (product) {
                product.status = !product.status;
                renderProducts();
                showToast('Product status updated!', 'success');
            }
        },
        quickView: (productId) => {
            showToast('Quick view feature coming soon!', 'info');
        },
        
        // Coupon actions
        editCoupon: (couponId) => {
            openCouponModal(couponId);
        },
        deleteCoupon: (couponId) => {
            if (confirm('Are you sure you want to delete this coupon?')) {
                state.coupons = state.coupons.filter(c => c.id !== couponId);
                renderCoupons();
                showToast('Coupon deleted successfully!', 'success');
            }
        },
        viewCouponStats: (couponId) => {
            showToast('Coupon statistics feature coming soon!', 'info');
        },
        
        // Utility functions
        showToast: (message, type) => showToast(message, type),
        showLoading: (show) => showLoading(show),
        openProductModal: () => openProductModal(),
        openCouponModal: () => openCouponModal()
    };
});
