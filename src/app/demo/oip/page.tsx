export const metadata = {
  title: 'Original Italian Pizza - Authentic Italian Cuisine in Sunbury, PA',
  description: 'Authentic Italian cuisine in the heart of Sunbury, PA',
};

export default function OIPDemo() {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Lato', sans-serif;
            line-height: 1.6;
            color: #333;
          }

          .hero {
            background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23c41e3a" width="1200" height="800"/><circle cx="600" cy="400" r="200" fill="%23009246" opacity="0.3"/></svg>');
            background-size: cover;
            background-position: center;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
          }

          .hero-content {
            max-width: 800px;
            padding: 20px;
          }

          h1 {
            font-family: 'Playfair Display', serif;
            font-size: 4rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          }

          .tagline {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            font-weight: 300;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
          }

          .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background-color: #c41e3a;
            color: white;
            text-decoration: none;
            font-size: 1.2rem;
            border-radius: 5px;
            transition: all 0.3s ease;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .cta-button:hover {
            background-color: #009246;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }

          .section {
            padding: 80px 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 3rem;
            color: #c41e3a;
          }

          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            margin-top: 40px;
          }

          .feature {
            text-align: center;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 10px;
            transition: transform 0.3s ease;
          }

          .feature:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .feature h3 {
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #009246;
          }

          .location {
            background-color: #009246;
            color: white;
            text-align: center;
          }

          .location-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .location h2 {
            color: white;
            margin-bottom: 2rem;
          }

          .location p {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }

          .hours {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 2rem;
          }

          .hours h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 30px 20px;
          }

          footer p {
            margin-bottom: 10px;
          }

          .italian-flag {
            display: inline-block;
            width: 60px;
            height: 40px;
            margin: 20px auto;
            background: linear-gradient(to right, #009246 33.33%, white 33.33%, white 66.66%, #c41e3a 66.66%);
            border-radius: 5px;
          }

          @media (max-width: 768px) {
            h1 {
              font-size: 2.5rem;
            }

            .tagline {
              font-size: 1.2rem;
            }

            .features {
              grid-template-columns: 1fr;
            }
          }
        `}} />
      </head>
      <body>
        <section className="hero">
          <div className="hero-content">
            <h1>Original Italian Pizza</h1>
            <div className="italian-flag"></div>
            <p className="tagline">Authentic Italian Cuisine in the Heart of Sunbury, PA</p>
            <a href="tel:570-286-1234" className="cta-button">Order Now</a>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Why Choose OIP?</h2>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🍕</div>
              <h3>Authentic Recipes</h3>
              <p>Traditional Italian recipes passed down through generations, made with love and the finest ingredients.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <h3>Fresh Ingredients</h3>
              <p>We source the freshest local and imported Italian ingredients to ensure every bite is perfection.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Master Craftsmanship</h3>
              <p>Our experienced chefs bring decades of Italian culinary expertise to every dish we serve.</p>
            </div>
          </div>
        </section>

        <section className="section location">
          <div className="location-content">
            <h2 className="section-title">Visit Us</h2>
            <p><strong>📍 Location:</strong> Sunbury, Pennsylvania</p>
            <p><strong>📞 Phone:</strong> <a href="tel:570-286-1234" style={{ color: 'white', textDecoration: 'underline' }}>Call to Order</a></p>
            <div className="hours">
              <h3>Hours of Operation</h3>
              <p>Monday - Thursday: 11:00 AM - 9:00 PM</p>
              <p>Friday - Saturday: 11:00 AM - 10:00 PM</p>
              <p>Sunday: 12:00 PM - 8:00 PM</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Our Specialties</h2>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🍕</div>
              <h3>Wood-Fired Pizza</h3>
              <p>Crispy, authentic Neapolitan-style pizza with the perfect char and flavor.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🍝</div>
              <h3>Fresh Pasta</h3>
              <p>Handmade pasta dishes featuring classic Italian sauces and seasonal ingredients.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🥗</div>
              <h3>Italian Salads</h3>
              <p>Fresh, vibrant salads with imported Italian cheeses, oils, and vinegars.</p>
            </div>
          </div>
        </section>

        <footer>
          <div className="italian-flag"></div>
          <p>&copy; 2026 Original Italian Pizza. All rights reserved.</p>
          <p>Proudly serving Sunbury, PA with authentic Italian cuisine.</p>
          <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>Demo page by Guardia Content</p>
        </footer>
      </body>
    </html>
  );
}
