
import { Memory, Project } from '@/hooks/useTimeStitch';

// PDF Export
export const exportToPDF = async (memories: Memory[], projectName: string) => {
  // This would use a library like jsPDF or Puppeteer
  console.log('Exporting to PDF...', { memories, projectName });
  
  // Create a simple HTML structure for PDF generation
  const htmlContent = `
    <html>
      <head>
        <title>${projectName} - Memory Book</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .memory { page-break-before: always; margin-bottom: 40px; }
          .memory:first-child { page-break-before: auto; }
          .memory-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .memory-date { color: #666; margin-bottom: 15px; }
          .memory-description { line-height: 1.6; margin-bottom: 20px; }
          .memory-images { display: flex; flex-wrap: wrap; gap: 10px; }
          .memory-image { max-width: 200px; max-height: 200px; object-fit: cover; }
          .tags { margin-top: 15px; }
          .tag { background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${projectName} - Memory Book</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        ${memories.map(memory => `
          <div class="memory">
            <div class="memory-title">${memory.title}</div>
            <div class="memory-date">${memory.date}</div>
            <div class="memory-description">${memory.description}</div>
            ${memory.images.length > 0 ? `
              <div class="memory-images">
                ${memory.images.map(img => `<img src="${img}" class="memory-image" alt="${memory.title}" />`).join('')}
              </div>
            ` : ''}
            ${memory.tags.length > 0 ? `
              <div class="tags">
                ${memory.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </body>
    </html>
  `;

  // In a real implementation, you would use a PDF generation library
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-memories.html`;
  a.click();
  URL.revokeObjectURL(url);
};

// Slideshow Export
export const exportToSlideshow = (memories: Memory[], projectName: string) => {
  const slideshowHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${projectName} - Slideshow</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #000; }
          .slideshow-container { position: relative; max-width: 100%; margin: auto; }
          .slide { display: none; text-align: center; padding: 20px; color: white; }
          .slide.active { display: block; }
          .slide img { max-width: 80%; max-height: 60vh; object-fit: contain; }
          .slide-content { margin-top: 20px; }
          .slide-title { font-size: 2em; margin-bottom: 10px; }
          .slide-date { opacity: 0.8; margin-bottom: 15px; }
          .slide-description { max-width: 600px; margin: 0 auto; line-height: 1.6; }
          .controls { text-align: center; padding: 20px; }
          .btn { background: #007bff; color: white; border: none; padding: 10px 20px; margin: 0 5px; cursor: pointer; border-radius: 5px; }
          .btn:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="slideshow-container">
          ${memories.map((memory, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
              ${memory.images.length > 0 ? `<img src="${memory.images[0]}" alt="${memory.title}">` : ''}
              <div class="slide-content">
                <div class="slide-title">${memory.title}</div>
                <div class="slide-date">${memory.date}</div>
                <div class="slide-description">${memory.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="controls">
          <button class="btn" onclick="changeSlide(-1)">Previous</button>
          <button class="btn" onclick="changeSlide(1)">Next</button>
          <button class="btn" onclick="toggleAutoplay()">Auto Play</button>
        </div>
        <script>
          let currentSlide = 0;
          let autoplay = false;
          let autoplayInterval;

          function showSlide(n) {
            const slides = document.querySelectorAll('.slide');
            if (n >= slides.length) currentSlide = 0;
            if (n < 0) currentSlide = slides.length - 1;
            slides.forEach(slide => slide.classList.remove('active'));
            slides[currentSlide].classList.add('active');
          }

          function changeSlide(n) {
            currentSlide += n;
            showSlide(currentSlide);
          }

          function toggleAutoplay() {
            autoplay = !autoplay;
            if (autoplay) {
              autoplayInterval = setInterval(() => {
                currentSlide++;
                showSlide(currentSlide);
              }, 3000);
            } else {
              clearInterval(autoplayInterval);
            }
          }

          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') changeSlide(-1);
            if (e.key === 'ArrowRight') changeSlide(1);
            if (e.key === ' ') toggleAutoplay();
          });
        </script>
      </body>
    </html>
  `;

  const blob = new Blob([slideshowHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-slideshow.html`;
  a.click();
  URL.revokeObjectURL(url);
};

// Photo Book Export (JSON format that can be imported)
export const exportToPhotoBook = (memories: Memory[], project: Project) => {
  const photoBook = {
    title: project.name,
    description: project.description,
    createdAt: new Date().toISOString(),
    memories: memories.map(memory => ({
      ...memory,
      exportedAt: new Date().toISOString()
    })),
    metadata: {
      totalMemories: memories.length,
      totalImages: memories.reduce((sum, m) => sum + m.images.length, 0),
      dateRange: {
        earliest: memories.reduce((earliest, m) => 
          new Date(m.date) < new Date(earliest) ? m.date : earliest, memories[0]?.date || ''),
        latest: memories.reduce((latest, m) => 
          new Date(m.date) > new Date(latest) ? m.date : latest, memories[0]?.date || '')
      }
    }
  };

  const blob = new Blob([JSON.stringify(photoBook, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name}-photobook.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// CSV Export for data analysis
export const exportToCSV = (memories: Memory[], projectName: string) => {
  const headers = ['Title', 'Description', 'Date', 'Tags', 'Image Count', 'Is Favorite'];
  const rows = memories.map(memory => [
    `"${memory.title.replace(/"/g, '""')}"`,
    `"${memory.description.replace(/"/g, '""')}"`,
    memory.date,
    `"${memory.tags.join(', ')}"`,
    memory.images.length,
    memory.isFavorite ? 'Yes' : 'No'
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-data.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
