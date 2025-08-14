#!/bin/bash

echo "🧪 TESTING GALERIA IN PRODUCTION"
echo "================================"
echo ""

echo "1️⃣ Testing API endpoint:"
echo "GET https://thebadgerspage.onrender.com/api/galeria/"
curl -s https://thebadgerspage.onrender.com/api/galeria/ | jq '.' 2>/dev/null || curl -s https://thebadgerspage.onrender.com/api/galeria/

echo ""
echo ""
echo "2️⃣ Testing if any images are returned:"
RESPONSE=$(curl -s https://thebadgerspage.onrender.com/api/galeria/)
if echo "$RESPONSE" | grep -q "url"; then
    echo "✅ API returns data with URLs"
    echo "Image count: $(echo "$RESPONSE" | grep -o '"url"' | wc -l)"
else
    echo "❌ No images found in API response"
    echo "Response: $RESPONSE"
fi

echo ""
echo "3️⃣ Testing frontend static files:"
echo "GET https://the-badgers.com/ (should return HTML with CSS)"
curl -I https://the-badgers.com/ 2>/dev/null | head -5

echo ""
echo "4️⃣ Quick diagnosis:"
echo "• Frontend URL: https://the-badgers.com/galeria"
echo "• Backend API: https://thebadgerspage.onrender.com/api/galeria/"
echo "• Expected: Images should load with Tailwind CSS styling"
echo ""
echo "🔧 If images don't load:"
echo "   - Check browser console for API errors"
echo "   - Verify image URLs are accessible"
echo "   - Check if Cloudinary is configured"
echo ""
echo "🎨 If CSS doesn't load:"
echo "   - Clear browser cache"
echo "   - Check if Tailwind CSS is compiled in build"
echo "   - Verify static files are served correctly"
