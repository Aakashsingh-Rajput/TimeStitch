
import React, { useState } from 'react';
import { Heart, Eye, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  memoryId: string;
  isFavorite: boolean;
}

interface GalleryProps {
  images: GalleryImage[];
  onToggleFavorite: (imageId: string) => void;
  showFavorites?: boolean;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onToggleFavorite, showFavorites = false }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Filter images based on favorites
  const filteredImages = showFavorites ? images.filter(img => img.isFavorite) : images;

  return (
    <div className="space-y-8">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(image.id);
                  }}
                  className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                    image.isFavorite 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Image info */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate">{image.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && showFavorites && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorite images yet</h3>
          <p className="text-gray-500">
            Start marking images as favorites to see them here!
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
