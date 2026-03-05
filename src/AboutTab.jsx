// src/AboutTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Eduvhibe.css';


import mainHeroImage from './assets/main-img.jpg'; 
import myProfileImage from './assets/chris.jpg';
import michaelTestimonialImage from './assets/michael.jpg';
import kwabenaTestimonialImage from './assets/kwabena-boateng.jpg';
import amoahTestimonialImage from './assets/amoah-portia.jpg';

export default function AboutTab() {
  const heroRef = useRef(null);
  const carouselRef = useRef(null);
  const profileRef = useRef(null);
  const footerRef = useRef(null);

  const testimonialsData = [
    {
      id: 1,
      name: "Kwabena Boateng Agyei",
      role: "Software Developer & Founder",
      quote: "I, the Ceo and the Founder of Sharether.com and a partner of Eduvhibe, testify that the website is real, valid, reliable, engaging and more suitable for studying course materials.",
      image: kwabenaTestimonialImage
    },
    {
      id: 2,
      name: "Acquah Michael",
      role: "Colleague",
      quote: "I being a colleague to the owner of this site(Eduvhibe), gives credit for the usage of the site. It is good and has features that will help improve users educational progress.",
      image: michaelTestimonialImage
    },
    {
      id: 3,
      name: "Amoah Portia",
      role: "Student",
      quote: "The CGPA tracker alone saved me so much stress this semester. Having all my course materials organized in one clean dashboard is exactly what we needed on campus.",
      image: amoahTestimonialImage
    },
    {
      id: 4,
      name: "Michael Mensah",
      role: "Engineering Student",
      quote: "The V3 interface is incredibly smooth. Finding past questions and video resources takes seconds now instead of scrolling through endless WhatsApp groups.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === testimonialsData.length - 1 ? 0 : prevSlide + 1
      );
    }, 8500); 
    return () => clearInterval(timer); 
  }, [testimonialsData.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-on-scroll');
        }
      });
    });

    const elementsToWatch = [heroRef.current, carouselRef.current, profileRef.current, footerRef.current];
    elementsToWatch.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // --- FALLBACK FUNCTION ---
  // If a local image breaks, this forces it to use an internet placeholder instantly.
  const handleImageError = (e, fallbackUrl) => {
    e.target.onerror = null; // Prevents infinite loops
    e.target.src = fallbackUrl;
  };

  return (
    <div className="about-container">
      
      {/* --- Top Section: Main Hero --- */}
      <div ref={heroRef} className="about-hero hidden-on-scroll">
        <div className="about-text-content">
          <h2 className="about-title">About the Eduvhibe website</h2>
          <p className="about-description">
            Eduvhibe gives you access to a wide range of course materials and the means of enriching academic progress. Notwithstanding education being the key, the Eduvhibe platform gives you access to better performance in education.
          </p>
          
          <ul className="about-features-list">
            <li><span className="check-icon">✓</span> Download and view course materials uploaded for the various departments.</li>
            <li><span className="check-icon">✓</span> View video resources on academic courses.</li>
            <li><span className="check-icon">✓</span> Explore ways and means of strategizing personal studies.</li>
            <li><span className="check-icon">✓</span> Track your CGPA throughout your educational journey.</li>
          </ul>
        </div>
        
        <div className="about-image-content">
          {/* Main Hero Image with Fallback! */}
          <img 
            src={mainHeroImage} 
            alt="Eduvhibe Lead" 
            className="about-main-image" 
            onError={(e) => handleImageError(e, "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&fit=crop")}
          />
        </div>
      </div>

      {/* --- Middle Section: The New Side-by-Side Layout --- */}
      <div ref={carouselRef} className="testimonials-section hidden-on-scroll">
        <h3 style={{ textAlign: 'center', width: '100%', color: 'var(--color-primary-900)', marginBottom: '30px', fontSize: '1.8rem' }}>
          What Our Community Says
        </h3>

        {/* THE GRID WRAPPER */}
        <div className="testimonials-layout">
          
          {/* Left Side: The Picture */}
          <div className="community-image-side">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" 
              alt="Students collaborating" 
              className="community-banner-img"
            />
          </div>
          
          {/* Right Side: The Carousel */}
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {testimonialsData.map((testimonial) => (
                <div className="carousel-slide" key={testimonial.id}>
                  <div className="testimonial-card">
                    <div className="testimonial-header">
                      <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar-img" />
                      <div>
                        <h4 className="testimonial-name">{testimonial.name}</h4>
                        <p className="testimonial-role">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="testimonial-quote">"{testimonial.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="carousel-dots">
              {testimonialsData.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${currentSlide === index ? 'active-dot' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Your Profile Card --- */}
      <div className="edu-about-section" style={{ marginTop: '60px', marginLeft: 'auto', marginRight: 'auto' }}>
        <h3 style={{ color: 'var(--color-secondary-500)', textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem' }}>
          Platform Interface Engineered By
        </h3>
        
        <div ref={profileRef} className="edu-profile-card hidden-on-scroll" style={{ margin: '0 auto' }}>
          <div className="profile-header">
            {/* Profile Image with Fallback! */}
            <img 
              src={myProfileImage} 
              alt="Osei Chris" 
              className="profile-avatar-img" 
              onError={(e) => handleImageError(e, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop")}
            />
            <div>
              <h2 className="profile-name">Osei Chris</h2>
              <p className="profile-title">Frontend/Backend Developer & Tech Entrepreneur</p>
            </div>
          </div>
          
          <div className="profile-body">
            <p>Hello! I am Osei Chris, a Collage student with a deep passion for software engineering, mathematics, and building digital solutions.</p>
            <p>I built this Eduvhibe V3 interface to merge clean, modern design with practical tools that help students succeed.</p>
          </div>
        </div>
      </div>

    </div>
  );
}