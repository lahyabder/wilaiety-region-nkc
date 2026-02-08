export const siteConfig = {
  clientKey: import.meta.env.VITE_CLIENT_KEY || "wilaiety-template",
  name: import.meta.env.VITE_SITE_NAME || "اسم البلدية هنا",
  tagline: import.meta.env.VITE_SITE_TAGLINE || "وصف قصير للموقع",
  brand: {
    primary: import.meta.env.VITE_BRAND_PRIMARY || "#0B6B3A",
    accent: import.meta.env.VITE_BRAND_ACCENT || "#C5A059",
  },
};
