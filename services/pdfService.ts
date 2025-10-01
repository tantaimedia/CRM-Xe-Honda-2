import { Customer } from '../types';

declare const jspdf: any;

export const exportCustomersToPDF = (customers: Customer[]): void => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Danh Sách Khách Hàng - GIA HÒA 6', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Báo cáo được tạo vào: ${new Date().toLocaleString()}`, 14, 29);

    const tableColumn = ["ID", "Họ Tên", "Số Điện Thoại", "Mẫu Xe", "Trạng Thái"];
    const tableRows: (string | number)[][] = [];

    customers.forEach(customer => {
        const customerData = [
            customer.id,
            customer.fullName,
            customer.phone,
            customer.preferredModel,
            customer.status,
        ];
        tableRows.push(customerData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        headStyles: {
            fillColor: [228, 0, 43] // Honda Red
        },
        theme: 'grid',
    });
    
    doc.save('danh_sach_khach_hang.pdf');
};
