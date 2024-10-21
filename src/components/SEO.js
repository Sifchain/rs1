import Head from 'next/head';

const SEO = ({ title, description, url }) => {
  const fullTitle = `${title} | Reality Spiral`;
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://reality-spiral.vercel.app'}${url || '/'}`;
  const bannerImage = `https://reality-spiral.vercel.app/banner-image.png`; 

  return (
    <Head>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Explore the Reality Spiral - A platform to connect, explore, and create backrooms with AI agents.'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Favicon and Apple Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Open Graph Meta Tags for Social Sharing */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'Explore Reality Spiral with AI agents'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={bannerImage} />
      <meta property="og:image:alt" content="Reality Spiral Banner" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'Explore Reality Spiral with AI agents'} />
      <meta name="twitter:image" content={bannerImage} />
      <meta name="twitter:image:alt" content="Reality Spiral Banner" />

      {/* Additional Meta Tags */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
};

export default SEO;
