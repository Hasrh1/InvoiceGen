import { state } from './state.js';

async function downloadPDF() {
    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Generating...';
        btn.disabled = true;
        if(window.lucide) window.lucide.createIcons();

        // 1. Get the target element (the outer a4-wrapper)
        // We capture the wrapper itself so we get the exact 794x1123 proportions.
        // But to ensure it captures at full scale regardless of CSS scale transform,
        // we might need to temporarily remove any scale transforms.
        
        const previewElement = document.querySelector('.invoice-preview-container');
        const wrapperElement = document.querySelector('.a4-wrapper');
        
        // Temporarily reset styles to ensure a clean capture
        const originalTransform = wrapperElement.style.transform;
        const originalMargin = wrapperElement.style.marginBottom;
        const originalTransformOrigin = wrapperElement.style.transformOrigin;
        
        wrapperElement.style.transform = 'none';
        wrapperElement.style.marginBottom = '0';
        wrapperElement.style.transformOrigin = 'top left';

        // Brief delay to allow DOM to flush reset styles
        await new Promise(r => setTimeout(r, 100));

        // 2. Generate Canvas
        const canvas = await html2canvas(previewElement, {
            scale: 2, // 2x scale for higher quality text
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Restore styles
        wrapperElement.style.transform = originalTransform;
        wrapperElement.style.marginBottom = originalMargin;
        wrapperElement.style.transformOrigin = originalTransformOrigin;

        // 3. Setup jsPDF
        // A4 format is 210mm x 297mm
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // 4. Calculate dimensions
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // 5. Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // 6. Provide download
        const invoiceNum = state.data.invoiceNumber || 'Invoice';
        const clientName = state.data.clientName ? `-${state.data.clientName.replace(/[^a-z0-9]/gi, '_')}` : '';
        const filename = `${invoiceNum}${clientName}.pdf`;
        
        pdf.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Check console for details.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if(window.lucide) window.lucide.createIcons();
    }
}

document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
document.getElementById('btn-duplicate').addEventListener('click', () => {
    // change invoice number slightly
    const num = state.data.invoiceNumber;
    const nextNum = num + "-COPY";
    state.update({ invoiceNumber: nextNum, issueDate: new Date().toISOString().split('T')[0] });
    alert("Invoice duplicated. Given new number: " + nextNum);
});
