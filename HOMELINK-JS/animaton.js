// Add your own high-quality images here (replace these URLs)
const images = [  
  "https://th.bing.com/th/id/R.64cd0bcf4e5d072d8dc204ee16cd19db?rik=PkmGBAIFg5La2Q&pid=ImgRaw&r=0",
  "https://myersjackson.com/wp-content/uploads/2022/01/shutterstock_221187091.jpg",
  "https://media.salecore.com/salesaspects/shared/GlobalImageLibrary/Responsive/ElegantSeller/real-estate-home-exterior-6-1760-1000.jpg"
];

let currentIndex = 0;
const hero = document.querySelector('.hero');


function createBackground() { 
  const bg = document.createElement('div');
  bg.className = 'hero-background';
  bg.style.backgroundImage = `url(${images[currentIndex]})`;
  bg.style.animation = 'zoomInOut 12s ease-in-out infinite';
  hero.appendChild(bg);
  
  // After 12 seconds, change to next image
  setTimeout(() => {
    bg.style.opacity = '0';
    
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % images.length;
      bg.style.backgroundImage = `url(${images[currentIndex]})`;
      bg.style.opacity = '1';
    }, 600); // fade out duration
  }, 1000);
}

// Initialize first background
createBackground();

// Keep creating new layers so we always have smooth transition
setInterval(() => {
  createBackground();
}, 12000);