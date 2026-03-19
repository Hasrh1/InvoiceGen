import { state } from './state.js';

function formatCurrency(amount, currencySymbol) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // use USD just for standard formatting behavior
    }).format(amount).replace('$', currencySymbol);
}

function renderLineItemsTable(stateData) {
    if (!stateData.items || stateData.items.length === 0) return '';
    return `
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th class="right">Qty</th>
                    <th class="right">Price</th>
                    <th class="right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${stateData.items.map(item => `
                    <tr>
                        <td>
                            <div class="item-name">${escapeHtml(item.name || 'Item Name')}</div>
                            <div class="item-desc">${escapeHtml(item.description || '')}</div>
                        </td>
                        <td class="right">${item.quantity}</td>
                        <td class="right">${formatCurrency(item.price, stateData.currency)}</td>
                        <td class="right">${formatCurrency(item.quantity * item.price, stateData.currency)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderTotals(stateData, totals) {
    let taxRowsHTML = '';
    
    // Line wise taxes can be aggregated, or just use the global computation from totals
    if (totals.totalTax > 0) {
        taxRowsHTML = `
            <tr>
                <td>Tax Phase</td>
                <td class="right">${formatCurrency(totals.totalTax, stateData.currency)}</td>
            </tr>
        `;
    }

    let discountHTML = '';
    if (totals.discountAmount > 0) {
        discountHTML = `
            <tr>
                <td>Discount</td>
                <td class="right">-${formatCurrency(totals.discountAmount, stateData.currency)}</td>
            </tr>
        `;
    }

    return `
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal</td>
                    <td class="right">${formatCurrency(totals.subtotal, stateData.currency)}</td>
                </tr>
                ${discountHTML}
                ${taxRowsHTML}
                <tr class="total-row">
                    <td>TOTAL DUE</td>
                    <td class="right">${formatCurrency(totals.grandTotal, stateData.currency)}</td>
                </tr>
            </table>
        </div>
    `;
}

export function renderPreview(stateData) {
    const totals = state.getTotals();
    const logoHtml = stateData.businessLogo ? `<img src="${stateData.businessLogo}" alt="Business Logo">` : '';

    const html = `
        <div class="invoice-template">
            <header class="template-header">
                <div class="business-info-block">
                    ${logoHtml}
                    <div class="b-name">${escapeHtml(stateData.businessName || 'Business Name')}</div>
                    <div>${escapeHtml(stateData.businessAddress).replace(/\\n/g, '<br>')}</div>
                    ${stateData.businessTaxId ? `<div>Tax/VAT: ${escapeHtml(stateData.businessTaxId)}</div>` : ''}
                    ${stateData.businessEmail ? `<div>Email: ${escapeHtml(stateData.businessEmail)}</div>` : ''}
                    ${stateData.businessPhone ? `<div>Phone: ${escapeHtml(stateData.businessPhone)}</div>` : ''}
                </div>
                <div class="invoice-meta">
                    <div class="invoice-title">INVOICE</div>
                    <div><strong>#${escapeHtml(stateData.invoiceNumber || 'INV-001')}</strong></div>
                    <div style="margin-top: 0.5rem">
                        <div>Issue Date: ${escapeHtml(stateData.issueDate || '')}</div>
                        <div>Due Date: ${escapeHtml(stateData.dueDate || '')}</div>
                    </div>
                </div>
            </header>

            <div class="details-grid">
                <div class="details-block">
                    <h3>Billed To:</h3>
                    <div class="b-name">${escapeHtml(stateData.clientName || 'Client Name')}</div>
                    ${stateData.clientCompany ? `<div>${escapeHtml(stateData.clientCompany)}</div>` : ''}
                    <div>${escapeHtml(stateData.clientAddress).replace(/\\n/g, '<br>')}</div>
                    ${stateData.clientEmail ? `<div>${escapeHtml(stateData.clientEmail)}</div>` : ''}
                </div>
            </div>

            ${renderLineItemsTable(stateData)}
            
            ${renderTotals(stateData, totals)}

            ${(stateData.notes || stateData.terms) ? `
                <div class="footer-notes">
                    ${stateData.notes ? `
                        <h4>Notes</h4>
                        <div style="margin-bottom: 1rem;">${escapeHtml(stateData.notes)}</div>
                    ` : ''}
                    ${stateData.terms ? `
                        <h4>Payment Terms</h4>
                        <div>${escapeHtml(stateData.terms)}</div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;

    return html;
}

// Simple HTML escaper
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
