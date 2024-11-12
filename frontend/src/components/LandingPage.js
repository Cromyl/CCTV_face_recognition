import React from 'react';

const LandingPage = () => {
  return (
    <div style={styles.container}>
      {/* <nav style={styles.navbar}>
        <div style={styles.logo}>CCTV Monitor</div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
        </div>
      </nav> */}
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>Advanced CCTV Monitoring</h1>
        <p style={styles.heroSubtitle}>Detect unknown faces with our state-of-the-art technology</p>
        <a href="https://github.com/Cromyl/CCTV_face_recognition" target="_blank" style={styles.heroButtonLink}>
          <button style={styles.heroButton}>Learn More</button>
        </a>
      </header>
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Features</h2>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <h3 style={styles.featureTitle}>Real-time Monitoring</h3>
            <p style={styles.featureDescription}>Stay updated with real-time crowd density statistics.</p>
          </div>
          <div style={styles.featureItem}>
            <h3 style={styles.featureTitle}>Unknown Face Detection</h3>
            <p style={styles.featureDescription}>Identify unknown individuals quickly and efficiently.</p>
          </div>
          <div style={styles.featureItem}>
            <h3 style={styles.featureTitle}>Video Live-Stream</h3>
            <p style={styles.featureDescription}>Have an eye on the realtime footage.</p>
          </div>
        </div>
      </section>
      <section id="about" style={styles.section}>
        <h2 style={styles.sectionTitle}>About Us</h2>
        <p style={styles.sectionDescription}>We are developing a platform that analyzes CCTV footage to extract multiple insights and presents them in a user-friendly format, making the information easily accessible and valuable to users.</p>
      </section>
      <footer id="contact" style={styles.footer}>
        <h2 style={styles.footerTitle}>GitHub Profiles</h2>
        {/* <p style={styles.footerDescription}>Email: contact@cctvmonitor.com</p>
        <p style={styles.footerDescription}>Phone: +123 456 7890</p> */}
        <div style={styles.socialLinks}>
          <a href="https://github.com/Cromyl" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fab fa-github"></i> Cromyl
          </a>
          <br></br><br></br>
          <a href="https://github.com/ShrutiBilolikar" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fab fa-github"></i>  ShrutiBilolikar
          </a>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    textAlign: 'center',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: '#333',
    color: '#fff',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    gap: '15px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '18px',
  },
  hero: {
    backgroundColor: '#f7f7f7',
    padding: '100px 20px',
  },
  heroTitle: {
    fontSize: '48px',
    margin: '0 0 20px',
  },
  heroSubtitle: {
    fontSize: '24px',
    margin: '0 0 40px',
  },
  heroButton: {
    padding: '10px 20px',
    fontSize: '18px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  section: {
    padding: '60px 20px',
  },
  sectionTitle: {
    fontSize: '36px',
    marginBottom: '20px',
  },
  sectionDescription: {
    fontSize: '18px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  featureList: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  featureItem: {
    maxWidth: '300px',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  },
  featureTitle: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  featureDescription: {
    fontSize: '16px',
  },
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '40px 20px',
  },
  footerTitle: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  footerDescription: {
    fontSize: '16px',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  socialLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '18px',
  },
};

export default LandingPage;
