const Order = require('../models/order');
const mongoose = require('mongoose');

// ================ ORDER MANAGEMENT ================

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName')
            .sort({ purchaseDate: -1 });

        return res.status(200).json({
            success: true,
            orders,
            message: 'Orders fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('user', 'firstName lastName email')
         .populate('course', 'courseName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Generate Orders PDF
exports.generateOrdersPDF = async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        
        const orders = await Order.find({})
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName')
            .sort({ purchaseDate: -1 });

        console.log(`Found ${orders.length} orders for PDF generation`);

        // Create a new PDF document with basic options
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=orders-report.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add title
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('Orders Report', { align: 'center' });
        
        doc.moveDown();
        
        // Add generation date
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
               day: '2-digit',
               month: 'long',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           })}`, { align: 'center' });
        
        doc.moveDown(2);

        // Add summary section
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const activeOrders = orders.filter(order => order.status).length;
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Summary:');
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Total Orders: ${orders.length}`)
           .text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`)
           .text(`Active Orders: ${activeOrders}`)
           .text(`Inactive Orders: ${orders.length - activeOrders}`);
        
        doc.moveDown(2);

        // Orders details section
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Order Details:');
        
        doc.moveDown();

        if (orders.length === 0) {
            doc.fontSize(12)
               .font('Helvetica')
               .text('No orders found.', { align: 'center' });
        } else {
            // Simple table layout
            const tableTop = doc.y;
            const tableLeft = 50;
            const colWidths = [40, 150, 120, 80, 60, 80];
            let currentX = tableLeft;

            // Table headers
            doc.fontSize(10)
               .font('Helvetica-Bold');
            
            const headers = ['S.No', 'User Details', 'Course', 'Amount', 'Status', 'Date'];
            headers.forEach((header, i) => {
                doc.text(header, currentX, tableTop, { width: colWidths[i], align: 'left' });
                currentX += colWidths[i];
            });

            // Header line
            doc.moveTo(tableLeft, tableTop + 15)
               .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
               .stroke();

            let currentY = tableTop + 25;

            // Add order data
            doc.font('Helvetica')
               .fontSize(9);

            orders.forEach((order, index) => {
                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                    
                    // Redraw headers
                    currentX = tableLeft;
                    doc.fontSize(10).font('Helvetica-Bold');
                    headers.forEach((header, i) => {
                        doc.text(header, currentX, currentY, { width: colWidths[i], align: 'left' });
                        currentX += colWidths[i];
                    });
                    
                    doc.moveTo(tableLeft, currentY + 15)
                       .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY + 15)
                       .stroke();
                    
                    currentY += 25;
                    doc.fontSize(9).font('Helvetica');
                }

                currentX = tableLeft;
                
                // S.No
                doc.text((index + 1).toString(), currentX, currentY, { width: colWidths[0], align: 'center' });
                currentX += colWidths[0];
                
                // User Details
                const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'N/A';
                const userEmail = order.user?.email || 'N/A';
                doc.text(`${userName}\n${userEmail}`, currentX, currentY, { width: colWidths[1], align: 'left' });
                currentX += colWidths[1];
                
                // Course
                const courseName = order.course?.courseName || 'N/A';
                doc.text(courseName, currentX, currentY, { width: colWidths[2], align: 'left' });
                currentX += colWidths[2];
                
                // Amount
                doc.text(`₹${order.amount.toLocaleString('en-IN')}`, currentX, currentY, { width: colWidths[3], align: 'right' });
                currentX += colWidths[3];
                
                // Status
                doc.text(order.status ? 'Active' : 'Inactive', currentX, currentY, { width: colWidths[4], align: 'center' });
                currentX += colWidths[4];
                
                // Date
                const orderDate = new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                doc.text(orderDate, currentX, currentY, { width: colWidths[5], align: 'center' });
                
                currentY += 30;
                
                // Row separator line
                if (index < orders.length - 1) {
                    doc.moveTo(tableLeft, currentY - 5)
                       .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY - 5)
                       .strokeOpacity(0.3)
                       .stroke()
                       .strokeOpacity(1);
                }
            });
        }

        // Add footer
        doc.fontSize(8)
           .text(`Generated by Beeja Academy | Page 1`, 50, doc.page.height - 50, { align: 'center' });

        // Finalize the PDF
        doc.end();
        
        console.log('PDF generation completed successfully');
        
    } catch (error) {
        console.error('Error generating orders PDF:', error);
        
        // Make sure we don't send headers twice
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Error generating orders PDF',
                error: error.message
            });
        }
    }
};
