
// Auto-tagging based on content analysis
export const generateAutoTags = (title: string, description: string): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  // Common keywords and their corresponding tags
  const tagMappings = {
    // Events
    'birthday': ['birthday', 'celebration', 'party'],
    'wedding': ['wedding', 'celebration', 'love'],
    'graduation': ['graduation', 'achievement', 'education'],
    'anniversary': ['anniversary', 'celebration', 'milestone'],
    'holiday': ['holiday', 'vacation', 'travel'],
    'christmas': ['christmas', 'holiday', 'family'],
    'vacation': ['vacation', 'travel', 'leisure'],
    
    // Activities
    'travel': ['travel', 'adventure', 'journey'],
    'trip': ['travel', 'trip', 'adventure'],
    'hiking': ['hiking', 'nature', 'outdoor'],
    'beach': ['beach', 'summer', 'vacation'],
    'mountain': ['mountain', 'nature', 'adventure'],
    'cooking': ['cooking', 'food', 'kitchen'],
    'sport': ['sports', 'fitness', 'activity'],
    'workout': ['fitness', 'health', 'exercise'],
    'concert': ['music', 'concert', 'entertainment'],
    'movie': ['movie', 'entertainment', 'cinema'],
    
    // People
    'family': ['family', 'together', 'love'],
    'friend': ['friends', 'social', 'together'],
    'baby': ['baby', 'family', 'milestone'],
    'pet': ['pet', 'animal', 'companion'],
    
    // Locations
    'home': ['home', 'house', 'family'],
    'office': ['work', 'office', 'professional'],
    'school': ['school', 'education', 'learning'],
    'restaurant': ['food', 'dining', 'restaurant'],
    'park': ['park', 'nature', 'outdoor'],
    
    // Seasons
    'spring': ['spring', 'season', 'nature'],
    'summer': ['summer', 'season', 'warm'],
    'autumn': ['autumn', 'fall', 'season'],
    'winter': ['winter', 'season', 'cold'],
    
    // Emotions/Moods
    'happy': ['happy', 'joy', 'positive'],
    'sad': ['sad', 'emotional', 'memory'],
    'excited': ['excited', 'energy', 'positive'],
    'peaceful': ['peaceful', 'calm', 'relaxing'],
    'beautiful': ['beautiful', 'aesthetic', 'memorable'],
    
    // Projects/Work
    'project': ['project', 'work', 'achievement'],
    'meeting': ['meeting', 'work', 'professional'],
    'presentation': ['presentation', 'work', 'achievement'],
    'launch': ['launch', 'achievement', 'milestone']
  };

  // Check for keyword matches
  Object.entries(tagMappings).forEach(([keyword, associatedTags]) => {
    if (content.includes(keyword)) {
      associatedTags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
  });

  // Detect dates and add time-based tags
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  if (content.includes(currentYear.toString())) {
    tags.push('recent');
  }
  
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december'];
  
  months.forEach((month, index) => {
    if (content.includes(month)) {
      const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer',
                      'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
      if (!tags.includes(seasons[index])) {
        tags.push(seasons[index]);
      }
    }
  });

  // Limit to 5 most relevant tags
  return tags.slice(0, 5);
};

// Extract location from text (simplified version)
export const extractLocation = (text: string): string | null => {
  const locationPatterns = [
    /(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/g,
  ];

  for (const pattern of locationPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].replace(/^(in|at|from|to)\s+/i, '').trim();
    }
  }

  return null;
};

// Analyze image content (placeholder for future ML integration)
export const analyzeImageContent = async (imageUrl: string): Promise<string[]> => {
  // This would integrate with image recognition APIs like Google Vision, AWS Rekognition, etc.
  // For now, return some sample tags based on common image content
  const sampleTags = ['photo', 'memory', 'moment'];
  
  // In a real implementation, you would:
  // 1. Send the image to an ML service
  // 2. Get back detected objects, scenes, faces, text
  // 3. Convert those to meaningful tags
  
  return sampleTags;
};
