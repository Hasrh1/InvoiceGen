import { state, defaultState } from './state.js';
import { renderPreview } from './templates.js';

// Elements
const previewContainer = document.getElementById('invoice-preview');
const form = document.getElementById('invoice-form');
const lineItemsContainer = document.getElementById('line-items-container');

// Simple DOM element binder helper
function bindInput(id, stateKey) {
    const el = document.getElementById(id);
    if (!el) return;

    // Attach listener
    el.addEventListener('input', (e) => {
        state.update({ [stateKey]: e.target.value });
    });

    // Sub for updates to prepopulate UI if changed externally
    state.subscribe((data) => {
        if (el.type === 'color') {
            document.documentElement.style.setProperty('--accent-color', data.accentColor);
        }
        if (el.value !== data[stateKey]) {
            el.value = data[stateKey];
            if (el.tagName === 'SELECT') {
                // If it's a select field, dispatch change event if necessary, or just rely on value
            }
        }
    });
}

function initBindings() {
    // Top-level configs
    bindInput('template-select', 'template');
    bindInput('accent-color', 'accentColor');
    
    // Business
    bindInput('business-name', 'businessName');
    bindInput('business-email', 'businessEmail');
    bindInput('business-phone', 'businessPhone');
    bindInput('business-address', 'businessAddress');
    bindInput('business-tax-id', 'businessTaxId');
    
    // Client
    bindInput('client-name', 'clientName');
    bindInput('client-company', 'clientCompany');
    bindInput('client-address', 'clientAddress');
    bindInput('client-email', 'clientEmail');
    bindInput('client-phone', 'clientPhone');
    
    // Invoice details
    bindInput('invoice-number', 'invoiceNumber');
    bindInput('currency', 'currency');
    bindInput('issue-date', 'issueDate');
    bindInput('due-date', 'dueDate');
    
    bindInput('notes', 'notes');
    bindInput('terms', 'terms');

    // Totals config
    bindInput('tax-rate', 'globalTaxRate');
    bindInput('discount-type', 'discountType');
    bindInput('discount-value', 'discountValue');

    const discountTypeEl = document.getElementById('discount-type');
    const discountValEl = document.getElementById('discount-value');
    
    state.subscribe(data => {
        if (data.discountType === 'none') {
            discountValEl.disabled = true;
            if(discountValEl.value !== '0') discountValEl.value = '0';
        } else {
            discountValEl.disabled = false;
        }

        // Handle template classes in preview
        previewContainer.className = `invoice-preview-container ${data.template}`;
        
        // Final render hook
        updatePreview(data);
    });
}

function updatePreview(data) {
    previewContainer.innerHTML = renderPreview(data);
    if(window.lucide) window.lucide.createIcons();
}

function renderLineItemsEditor() {
    lineItemsContainer.innerHTML = state.data.items.map((item, index) => `
        <div class="line-item-card" data-id="${item.id}">
            <div class="line-item-header">
                <strong>Item ${index + 1}</strong>
                <button type="button" class="btn-remove-item" onclick="window.removeItem('${item.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <div class="line-item-inputs">
                <div class="form-group item-full-width">
                    <label>Description</label>
                    <input type="text" value="${item.name}" oninput="window.updateItem('${item.id}', 'name', this.value)" placeholder="Service/Product name">
                </div>
                <!-- 
                <div class="form-group item-full-width">
                    <input type="text" value="${item.description}" oninput="window.updateItem('${item.id}', 'description', this.value)" placeholder="Additional details...">
                </div> 
                -->
                <div class="form-group">
                    <label>Qty</label>
                    <input type="number" min="1" value="${item.quantity}" oninput="window.updateItem('${item.id}', 'quantity', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" min="0" step="0.01" value="${item.price}" oninput="window.updateItem('${item.id}', 'price', parseFloat(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label>Tax (%)</label>
                    <input type="number" min="0" step="0.1" value="${item.taxRate}" oninput="window.updateItem('${item.id}', 'taxRate', parseFloat(this.value) || 0)">
                </div>
            </div>
        </div>
    `).join('');
    if(window.lucide) window.lucide.createIcons();
}


// Export globally for inline onclick handlers inside the items list
window.updateItem = (id, field, value) => {
    state.updateItem(id, field, value);
};
window.removeItem = (id) => {
    state.removeItem(id);
    renderLineItemsEditor();
};


function setupActions() {
    // Add Item
    document.getElementById('btn-add-item').addEventListener('click', () => {
        state.addItem();
        renderLineItemsEditor();
    });

    // Clear form
    document.getElementById('btn-clear').addEventListener('click', () => {
        if(confirm("Are you sure you want to clear all form data?")) {
            state.clear();
            renderLineItemsEditor();
            document.getElementById('logo-preview-container').classList.add('hidden');
            document.getElementById('logo-placeholder').classList.remove('hidden');
        }
    });

    // Sample data
    document.getElementById('btn-sample-data').addEventListener('click', () => {
        state.update({
            businessName: 'Dynamic Design Agency',
            businessEmail: 'hello@dynamic.design',
            businessPhone: '+1 (555) 123-4567',
            businessAddress: '123 Creative Blvd\\nSan Francisco, CA 94107',
            businessTaxId: 'TIN-987654321',
            clientName: 'Sarah Jenkins',
            clientCompany: 'TechStart Inc.',
            clientEmail: 'sarah@techstart.io',
            clientAddress: '456 Startup Way\\nAustin, TX 78701',
            invoiceNumber: 'INV-2023-014',
            notes: 'Thank you for choosing Dynamic Design Agency! It was a pleasure working with your team.',
            terms: 'Please fulfill payment within 14 days of receipt via bank transfer or credit card.',
            currency: '$',
            items: [
                { id: '1', name: 'UI/UX Design', description: 'Design of the main application screens', quantity: 1, price: 4500, taxRate: 0 },
                { id: '2', name: 'Frontend Development', description: 'Implementation using React and Tailwind', quantity: 1, price: 6200, taxRate: 0 },
                { id: '3', name: 'Consulting', description: 'Architecture review meeting', quantity: 4, price: 150, taxRate: 0 }
            ],
            globalTaxRate: 5,
            accentColor: '#8b5cf6',
            template: 'template-bold'
        });
        renderLineItemsEditor();
    });

    // Mobile Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    const sidebar = document.getElementById('editor-sidebar');
    const main = document.querySelector('.preview-main');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.target === 'editor') {
                sidebar.classList.add('active');
                main.classList.add('hidden');
            } else {
                sidebar.classList.remove('active');
                main.classList.remove('hidden');
            }
        });
    });

    // Logo Upload logic
    const imgInput = document.getElementById('business-logo');
    const removeBtn = document.getElementById('btn-remove-logo');
    const previewContainerEl = document.getElementById('logo-preview-container');
    const placeholderEl = document.getElementById('logo-placeholder');
    const imgEl = document.getElementById('logo-preview-img');

    imgInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const b64 = ev.target.result;
                state.update({ businessLogo: b64 });
                imgEl.src = b64;
                previewContainerEl.classList.remove('hidden');
                placeholderEl.classList.add('hidden');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        state.update({ businessLogo: '' });
        imgInput.value = '';
        previewContainerEl.classList.add('hidden');
        placeholderEl.classList.remove('hidden');
    });
    
    // Restore logo state on load
    if (state.data.businessLogo) {
        imgEl.src = state.data.businessLogo;
        previewContainerEl.classList.remove('hidden');
        placeholderEl.classList.add('hidden');
    }
}


// Bootstrap
initBindings();
setupActions();

// Initial Render
renderLineItemsEditor();
state.notify(); // forces UI to sync with LS initialized state
