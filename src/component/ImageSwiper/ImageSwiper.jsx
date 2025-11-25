import React from 'react';
import './ImageSwiper.css'; 

const ImageSwiper = ({ images }) => {
 
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="swiper-container">
      <div className="swiper-wrapper">
        {images.map((url, index) => (
          <div key={index} className="swiper-slide">
           
            <img src={url} alt={`모임 사진 ${index + 1}`} className="swiper-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSwiper;