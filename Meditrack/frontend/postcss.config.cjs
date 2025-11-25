// frontend/postcss.config.cjs
module.exports = {
  plugins: [
    // use the separate Tailwind PostCSS package
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
