console.log('Testing FAQ imports...\n');

try {
    console.log('1. Testing FAQ model import...');
    const FAQ = require('./models/faq.js');
    console.log('✅ FAQ model imported successfully');
    console.log('FAQ model:', FAQ);
} catch (error) {
    console.log('❌ FAQ model import failed');
    console.log('Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

try {
    console.log('2. Testing FAQ controller import...');
    const faqController = require('./controllers/faq.js');
    console.log('✅ FAQ controller imported successfully');
    console.log('Controller functions:', Object.keys(faqController));
} catch (error) {
    console.log('❌ FAQ controller import failed');
    console.log('Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

try {
    console.log('3. Testing FAQ routes import...');
    const faqRoutes = require('./routes/faq.js');
    console.log('✅ FAQ routes imported successfully');
    console.log('Routes object:', faqRoutes);
} catch (error) {
    console.log('❌ FAQ routes import failed');
    console.log('Error:', error.message);
}
