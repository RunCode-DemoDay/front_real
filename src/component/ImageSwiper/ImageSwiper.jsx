import React from 'react';
import './ImageSwiper.css'; // 스타일링을 위한 CSS 파일

const ImageSwiper = ({ images }) => {
  // 이미지가 없거나 배열이 비어있으면 아무것도 렌더링하지 않습니다.
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="swiper-container">
      <div className="swiper-wrapper">
        {images.map((url, index) => (
          <div key={index} className="swiper-slide">
            {/* <img> 태그의 src 속성이 올바른지 다시 확인하세요. */}
            <img src={url} alt={`모임 사진 ${index + 1}`} className="swiper-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSwiper;