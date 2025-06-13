
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = "X-Ample Development - FiveM, Roblox, Web & Discord Development",
  description = "Professional development services for FiveM scripts, Roblox servers, websites, and Discord bots. Custom solutions for gaming and web platforms.",
  keywords = "FiveM development, Roblox servers, web development, Discord bots, gaming scripts, custom development",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = "https://x-ampledevelopment.com",
  type = "website"
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="X-Ample Development" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="X-Ample Development" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@iamxample" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "X-Ample Development",
          "url": url,
          "logo": "https://i.imgur.com/4bSGPHi.png",
          "description": description,
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "url": `${url}/contact`
          },
          "sameAs": [
            "https://discord.gg/3mNGT2AwNy"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
