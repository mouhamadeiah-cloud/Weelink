import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ARABIC_TO_ENGLISH_MAP: Record<string, string> = {
  'طبيعة': 'nature landscape wallpaper',
  'أعمال': 'modern business office team',
  'عمل': 'workspace office desk',
  'فضاء': 'deep space stars galaxy cosmos',
  'تجريدي': 'abstract modern textured background',
  'رخام': 'white marble luxury texture',
  'تقنية': 'technology futuristic cyber',
  'داكن': 'dark aesthetic minimalist black',
  'هندسة': 'minimal modern architecture',
  'مباني': 'clean architectural buildings',
  'بحر': 'calm blue sea waves ocean',
  'غروب': 'warm golden hour sunset landscape',
  'تدرج': 'smooth colorful gradient aesthetic',
  'خلفيات': 'wallpaper desktop background minimal',
  'ألوان': 'vibrant colorful background',
  'مكتب': 'clean desk workspace computer',
  'الكل': 'popular aesthetic desktop wallpaper',
};

// Curated stock photos from Unsplash for instant zero-config availability
const CURATED_UNSPLASH_FALLBACKS = [
  {
    id: 'u-1',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
    alt: 'مناظر طبيعية جبلية وانعكاس بحيرة هادئة',
    photographer: 'Bailey Zindel',
    photographerUrl: 'https://unsplash.com/@baileyzindel',
    category: 'طبيعة بحر جبال nature',
    color: '#344648',
  },
  {
    id: 'u-2',
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=2400&q=85',
    alt: 'رخام أبيض فاخر وناعم بتصميم انسيابي',
    photographer: 'Annie Spratt',
    photographerUrl: 'https://unsplash.com/@anniespratt',
    category: 'رخام أبيض تجريدي texture marble',
    color: '#e2e2e2',
  },
  {
    id: 'u-3',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85',
    alt: 'فضاء كوني مذهل مع إشعاعات أرضية وشبكة بيانات',
    photographer: 'NASA',
    photographerUrl: 'https://unsplash.com/@nasa',
    category: 'فضاء تقنية داكن space tech',
    color: '#0a192f',
  },
  {
    id: 'u-4',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=85',
    alt: 'مكتب شركات مفتوح وعصري بأناقة معمارية',
    photographer: 'Alex Kotliarskyi',
    photographerUrl: 'https://unsplash.com/@frantic',
    category: 'أعمال مكتب عمل business office',
    color: '#d4d4d8',
  },
  {
    id: 'u-5',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=85',
    alt: 'رقائق إلكترونية ومعالجات تقنية عالية الدقة',
    photographer: 'Alexandre Debiève',
    photographerUrl: 'https://unsplash.com/@alexandre_debieve',
    category: 'تقنية ذكاء حاسوب tech',
    color: '#1e293b',
  },
  {
    id: 'u-6',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2400&q=85',
    alt: 'تدرج فني ناعم ثلاثي الأبعاد بألوان الشفق القطبي',
    photographer: 'Lucas Benjamin',
    photographerUrl: 'https://unsplash.com/@lucasbenjamin',
    category: 'تدرج تجريدي ألوان gradient abstract',
    color: '#3b0764',
  },
  {
    id: 'u-7',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2400&q=85',
    alt: 'غرفة استوديو ناصعة البياض بتصميم مينيمال',
    photographer: 'Jonas Jacobsson',
    photographerUrl: 'https://unsplash.com/@jonasjacobsson',
    category: 'أبيض مينيمال هادئ minimal white',
    color: '#f8fafc',
  },
  {
    id: 'u-8',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2400&q=85',
    alt: 'قمم جبال ثلجية تحت سماء مرصعة بالنجوم ومجرة درب التبانة',
    photographer: 'Benjamin Davies',
    photographerUrl: 'https://unsplash.com/@bendavisual',
    category: 'فضاء طبيعة جبال داكن mountains night',
    color: '#0f172a',
  },
  {
    id: 'u-9',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
    alt: 'شاطئ استوائي برمال ناعمة ومياه تركوازية صافية',
    photographer: 'Sean Oulashin',
    photographerUrl: 'https://unsplash.com/@oulashin',
    category: 'طبيعة بحر رمل شاطئ beach sea',
    color: '#0284c7',
  },
  {
    id: 'u-10',
    url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=2400&q=85',
    alt: 'تأثير إضاءة نيون فني بألوان الشفق والغموض',
    photographer: 'Ferdinand Stöhr',
    photographerUrl: 'https://unsplash.com/@fellowferdi',
    category: 'نيون داكن تجريدي neon dark',
    color: '#18181b',
  },
  {
    id: 'u-11',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85',
    alt: 'ناطحات سحاب زجاجية تعكس أفق المدينة الحديثة',
    photographer: 'Sean Pollock',
    photographerUrl: 'https://unsplash.com/@seanpollock',
    category: 'هندسة مباني أعمال architecture',
    color: '#0369a1',
  },
  {
    id: 'u-12',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=450&q=80',
    full: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2400&q=85',
    alt: 'تموجات سائلة تجريدية ثلاثية الأبعاد بأسلوب ناعم',
    photographer: 'Milad Fakurian',
    photographerUrl: 'https://unsplash.com/@fakurian',
    category: 'تجريدي تدرج حديث 3d abstract',
    color: '#312e81',
  }
];

// Helper to get Unsplash Key from environment
function getUnsplashKey(): string | undefined {
  return (
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.UNSPLASH_API_KEY ||
    process.env.VITE_UNSPLASH_ACCESS_KEY
  );
}

// Unsplash Search API endpoint
app.get('/api/unsplash/search', async (req, res) => {
  const originalQuery = (req.query.q as string || '').trim();
  const page = parseInt(req.query.page as string || '1', 10);
  const apiKey = getUnsplashKey();

  // Translate Arabic queries if matching known keywords
  let searchQuery = originalQuery;
  if (originalQuery && ARABIC_TO_ENGLISH_MAP[originalQuery]) {
    searchQuery = ARABIC_TO_ENGLISH_MAP[originalQuery];
  } else if (!originalQuery || originalQuery === 'الكل') {
    searchQuery = 'minimal wallpaper landscape';
  }

  if (apiKey) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchQuery
      )}&per_page=30&page=${page}&orientation=landscape`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      });

      if (response.ok) {
        const data: any = await response.json();
        const photos = (data.results || []).map((p: any) => ({
          id: p.id,
          url: p.urls.regular,
          thumb: p.urls.small || p.urls.thumb,
          full: p.urls.full || p.urls.regular,
          alt: p.alt_description || p.description || originalQuery || 'Unsplash Photo',
          photographer: p.user?.name || 'Unsplash Photographer',
          photographerUrl: p.user?.links?.html || 'https://unsplash.com',
          width: p.width,
          height: p.height,
          color: p.color || '#333333',
        }));

        return res.json({
          photos,
          hasKey: true,
          total: data.total || photos.length,
          totalPages: data.total_pages || 1,
          page,
          provider: 'unsplash',
        });
      } else {
        const errText = await response.text();
        console.warn('Unsplash API responded with error status:', response.status, errText);
      }
    } catch (err) {
      console.error('Error fetching from Unsplash API:', err);
    }
  }

  // Fallback to rich curated Unsplash collection
  const lowerQ = originalQuery.toLowerCase();
  const filtered = originalQuery && originalQuery !== 'الكل'
    ? CURATED_UNSPLASH_FALLBACKS.filter(
        (p) =>
          p.category.toLowerCase().includes(lowerQ) ||
          p.alt.toLowerCase().includes(lowerQ)
      )
    : CURATED_UNSPLASH_FALLBACKS;

  const results = filtered.length > 0 ? filtered : CURATED_UNSPLASH_FALLBACKS;
  return res.json({
    photos: results,
    hasKey: Boolean(apiKey),
    total: results.length,
    totalPages: 1,
    page: 1,
    provider: 'unsplash-fallback',
  });
});

// Unsplash Curated / Popular API endpoint
app.get('/api/unsplash/curated', async (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const apiKey = getUnsplashKey();

  if (apiKey) {
    try {
      const url = `https://api.unsplash.com/photos?per_page=30&page=${page}&order_by=popular`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      });

      if (response.ok) {
        const data: any = await response.json();
        const photos = (Array.isArray(data) ? data : []).map((p: any) => ({
          id: p.id,
          url: p.urls.regular,
          thumb: p.urls.small || p.urls.thumb,
          full: p.urls.full || p.urls.regular,
          alt: p.alt_description || p.description || 'Unsplash Background',
          photographer: p.user?.name || 'Unsplash Photographer',
          photographerUrl: p.user?.links?.html || 'https://unsplash.com',
          width: p.width,
          height: p.height,
          color: p.color || '#333333',
        }));

        return res.json({
          photos,
          hasKey: true,
          total: photos.length,
          page,
          provider: 'unsplash',
        });
      } else {
        const errText = await response.text();
        console.warn('Unsplash curated responded with error:', response.status, errText);
      }
    } catch (err) {
      console.error('Error fetching curated from Unsplash API:', err);
    }
  }

  return res.json({
    photos: CURATED_UNSPLASH_FALLBACKS,
    hasKey: Boolean(apiKey),
    total: CURATED_UNSPLASH_FALLBACKS.length,
    page: 1,
    provider: 'unsplash-fallback',
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
