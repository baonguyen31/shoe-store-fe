"use client"; 

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "SHOESTORE",
    subtitle: "Mang cá tính vào từng bước đi.",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2070&auto=format&fit=crop",
    link: "/products",
    color: "text-white"
  },
  {
    id: 2,
    title: "CHẠY BỘ ĐỈNH CAO",
    subtitle: "Nâng tầm thành tích với công nghệ đệm khí tiên tiến.",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2070&auto=format&fit=crop",
    link: "/products/running",
    color: "text-white"
  },
  {
    id: 3,
    title: "PHONG CÁCH ĐƯỜNG PHỐ",
    subtitle: "Thể hiện cá tính riêng biệt với thiết kế độc đáo.",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop",
    link: "/products/lifestyle",
    color: "text-white"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Tự động chuyển slide sau 5 giây
  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group bg-gray-900">
      
      {/* --- Các Slide --- */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Ảnh nền */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0} // Ưu tiên tải ảnh đầu tiên
            className="object-cover brightness-75" // Làm tối ảnh một chút để chữ nổi hơn
          />

          {/* Nội dung chữ đè lên ảnh */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <h2 className={`text-4xl md:text-6xl font-extrabold mb-4 tracking-wider animate-fade-in-up ${slide.color}`}>
              {slide.title}
            </h2>
            <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl animate-fade-in-up delay-100">
              {slide.subtitle}
            </p>
            <Link 
              href={slide.link}
              // className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-blue-600 hover:text-white transition transform hover:scale-105 animate-fade-in-up delay-200"
            >
              
            </Link>
          </div>
        </div>
      ))}

      {/* --- Mũi tên điều hướng (Hiện khi hover vào slider) --- */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 bg-white/30 hover:bg-white text-white hover:text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 bg-white/30 hover:bg-white text-white hover:text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
      >
        <ChevronRight size={24} />
      </button>

      {/* --- Dấu chấm chỉ báo (Dots) --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current ? "bg-white w-8" : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}