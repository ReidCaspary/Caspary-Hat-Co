
import React, { useState } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const galleryItems = [
  {
    title: "Custom Event Hats",
    category: "Event",
    description: "Elegant Custom Memorabilia for Events",
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517516/WhatsApp_Image_2025-11-03_at_15.52.15_6119fab8_mtukfz.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/Dancers_zlksmi.jpg"
    ]

  },
  {
    title: "Custom Corporate Hats",
    category: "Business",
    description: "Premium Custom Hats for Corporate Branding",
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517513/100_Cotton_gmcwn1.jpg"
    ]

  },
  {
    title: "Team Hats",
    category: "Team Hats",
    description: "Custom Team Hats with Embroidered Mascot and Colors",
    images: [
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_thunder_Baseball_jgryfz.jpg",
      "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_Mud_Dogs_zcblz4.jpg"
    ]

  }];


export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(galleryItems.map((item) => item.category))];

  const filteredItems = filter === "All" ?
    galleryItems :
    galleryItems.filter((item) => item.category === filter);

  const handlePrevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) =>
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-48 sm:h-64 lg:h-80 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2071)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>

          <div className="absolute inset-0 bg-[var(--navy)]/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-blue-950 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Custom Designs</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto mb-3 sm:mb-4" />
          <p className="text-blue-950 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">Explore our portfolio of custom baseball cap designs
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16 lg:py-24 from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item, index) =>
              <div
                key={index}
                className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => handleItemClick(item)}>

                <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--navy)]" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-[var(--orange)] text-white text-xs sm:text-sm font-semibold rounded-full">
                      {item.category}
                    </span>
                  </div>
                  {item.images.length > 1 &&
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                      <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-black/70 text-white text-[10px] sm:text-xs font-semibold rounded-full">
                        {item.images.length} images
                      </span>
                    </div>
                  }
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[var(--black)] mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[var(--gray-medium)]">{item.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Zoom Modal with Carousel */}
      <Dialog open={!!selectedItem} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl p-0 max-h-[95vh] overflow-hidden">
          {selectedItem &&
            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[95vh] overflow-hidden">
              {/* Image Container - Responsive */}
              <div className="relative bg-black flex items-center justify-center h-[40vh] sm:h-[50vh] md:h-auto md:aspect-[4/3]">
                <img
                  src={selectedItem.images[currentImageIndex]}
                  alt={`${selectedItem.title} - Image ${currentImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain" />


                {/* Navigation Arrows */}
                {selectedItem.images.length > 1 &&
                  <>
                    <Button
                      onClick={handlePrevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[var(--primary)] rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0">

                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                    <Button
                      onClick={handleNextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[var(--primary)] rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0">

                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>

                    {/* Image Counter */}
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      {currentImageIndex + 1} / {selectedItem.images.length}
                    </div>
                  </>
                }
              </div>

              {/* Details Panel - Now Scrollable on Mobile */}
              <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[95vh]">
                <div className="pr-2">
                  <div className="mb-3 sm:mb-4">
                    <span className="inline-block px-3 py-1 bg-[var(--orange)] text-white text-xs sm:text-sm font-semibold rounded-full">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--black)] mb-3 sm:mb-4">
                    {selectedItem.title}
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--gray-medium)] mb-4 sm:mb-6">
                    {selectedItem.description}
                  </p>

                  {/* Thumbnail Navigation */}
                  {selectedItem.images.length > 1 &&
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-sm font-semibold text-[var(--primary)] mb-2 sm:mb-3">Gallery</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedItem.images.map((img, idx) =>
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex ?
                                'border-[var(--accent)] scale-110' :
                                'border-gray-300 hover:border-[var(--primary)]'
                            }`}>

                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover" />

                          </button>
                        )}
                      </div>
                    </div>
                  }

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[var(--orange)] rounded-full flex-shrink-0" />
                      <span className="text-sm sm:text-base text-[var(--gray-medium)]">Classic trucker style</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[var(--orange)] rounded-full flex-shrink-0" />
                      <span className="text-sm sm:text-base text-[var(--gray-medium)]">Available in 5 or 6 panels</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[var(--orange)] rounded-full flex-shrink-0" />
                      <span className="text-sm sm:text-base text-[var(--gray-medium)]">Premium embroidery & materials</span>
                    </div>
                  </div>
                </div>

                {/* Close Button - Always Visible */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition shadow-lg z-50">

                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--navy)]" />
                </button>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>
  );
}
