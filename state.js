// uuid generator mock (since we are using pure vanilla without actual import mappings, 
// though we included uuid via CDN, generating a simple id is often easier)
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Default state structure
export const defaultState = {
    template: 'template-modern',
    accentColor: '#3b82f6',
    businessLogo: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessTaxId: '',
    
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    
    invoiceNumber: 'INV-001',
    currency: '$',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 days
    
    items: [
        { id: generateId(), name: 'Web Design', description: 'Homepage and inner pages', quantity: 1, price: 1500, taxRate: 0 }
    ],
    
    globalTaxRate: 0,
    discountType: 'none', // 'none', 'fixed', 'percentage'
    discountValue: 0,
    
    notes: 'Thank you for your business!',
    terms: 'Please pay within 30 days.'
};

// Global State Object
export const state = {
    data: { ...defaultState },
    listeners: [],
    
    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    // Publish state changes
    notify() {
        this.listeners.forEach(cb => cb(this.data));
        this.save();
    },
    
    // Update multiple fields
    update(updates) {
        this.data = { ...this.data, ...updates };
        this.notify();
    },
    
    // Line Item Helpers
    addItem() {
        this.data.items.push({
            id: generateId(),
            name: '',
            description: '',
            quantity: 1,
            price: 0,
            taxRate: 0
        });
        this.notify();
    },
    
    updateItem(id, field, value) {
        const item = this.data.items.find(i => i.id === id);
        if (item) {
            item[field] = value;
            this.notify();
        }
    },
    
    removeItem(id) {
        this.data.items = this.data.items.filter(i => i.id !== id);
        this.notify();
    },
    
    // Persistence
    save() {
        localStorage.setItem('invoiceGenState', JSON.stringify(this.data));
    },
    
    load() {
        const saved = localStorage.getItem('invoiceGenState');
        if (saved) {
            try {
                this.data = { ...defaultState, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        }
        return this.data;
    },
    
    clear() {
        this.data = { ...defaultState, items: [] };
        this.notify();
    },

    // Utilities to get computed totals
    getTotals() {
        let subtotal = 0;
        let totalTax = 0;
        
        // Per item calculations
        this.data.items.forEach(item => {
            const lineTotal = item.quantity * item.price;
            subtotal += lineTotal;
            if (item.taxRate > 0) {
                totalTax += lineTotal * (item.taxRate / 100);
            }
        });

        // Global Tax
        if (this.data.globalTaxRate > 0) {
            totalTax += subtotal * (this.data.globalTaxRate / 100);
        }

        // Discount
        let discountAmount = 0;
        if (this.data.discountType === 'fixed') {
            discountAmount = parseFloat(this.data.discountValue) || 0;
        } else if (this.data.discountType === 'percentage') {
            const pct = parseFloat(this.data.discountValue) || 0;
            discountAmount = subtotal * (pct / 100);
        }

        const rawTotal = subtotal + totalTax - discountAmount;
        const grandTotal = Math.max(0, rawTotal); 

        return {
            subtotal,
            totalTax,
            discountAmount,
            grandTotal
        };
    }
};

// Initialize by loading from LS
state.load();
