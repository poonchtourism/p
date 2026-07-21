/**
 * generate-sitemap.js
 *
 * Builds sitemap.xml by reading every place (and stay, if you want stay pages
 * indexed later) from Firestore, using the SAME public client config your
 * site already uses in the browser (this config is not a secret — it's
 * already visible in your index.html).
 *
 * Usage:
 *   npm install firebase
 *   node generate-sitemap.js
 *
 * Run this any time you add/remove places, then redeploy:
 *   firebase deploy --only hosting
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyCoswR0H9KLnGU8Y7NvUtwHL7ELXdtBZ-c",
  authDomain: "poonch-tourism.firebaseapp.com",
  projectId: "poonch-tourism",
  storageBucket: "poonch-tourism.firebasestorage.app",
  messagingSenderId: "1015030062941",
  appId: "1:1015030062941:web:a2b0ed816266b5f230d2b4"
};

// Change this if your live domain is different (e.g. a custom domain
// instead of poonchtourism.web.app).
const SITE_URL = "https://poonchtourism.web.app";

function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'place';
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const placesSnap = await getDocs(collection(db, 'places'));
  const places = placesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/about.html`, priority: '0.5' },
    { loc: `${SITE_URL}/submit-place.html`, priority: '0.3' },
    { loc: `${SITE_URL}/list-your-stay.html`, priority: '0.3' },
  ];

  const placeUrls = places.map(place => ({
    loc: `${SITE_URL}/place/${slugify(place.name)}/${place.id}/`,
    priority: '0.8'
  }));

  const allUrls = [...staticUrls, ...placeUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync('sitemap.xml', xml);
  console.log(`Wrote sitemap.xml with ${allUrls.length} URLs (${placeUrls.length} places).`);
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
