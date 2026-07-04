export const TOPICS: Record<string, { title: string; sideA: string; sideB: string; category: string }> = {
  // Sports
  t1: { title: 'Virat Kohli is the best Test captain', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t2: { title: 'MS Dhoni is the greatest finisher', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t3: { title: 'Messi is the greatest footballer', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t4: { title: 'Cristiano Ronaldo is the most complete modern footballer', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t5: { title: 'Federer is the most elegant tennis player', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t6: { title: 'LeBron James is the most impactful NBA player', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t7: { title: 'Cricket is more skillful than Football', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },
  t8: { title: 'T20 is ruining Test cricket', sideA: 'Agree', sideB: 'Disagree', category: 'Sports' },

  // Entertainment
  t9: { title: 'Harry Potter is the best movie series', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t10: { title: 'Marvel is the most successful cinematic universe', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t11: { title: 'Scorsese\'s filmmaking has the strongest impact', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t12: { title: 'Nolan is the best modern filmmaker', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t13: { title: 'Christopher Reeve\'s Superman is the most iconic superhero performance', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t14: { title: 'Baahubali is the most impactful Indian franchise', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t15: { title: 'The Office is the most rewatchable sitcom', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t16: { title: 'Breaking Bad is the best TV series', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t17: { title: 'Game of Thrones had the biggest cultural impact', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t18: { title: 'Friends is the most beloved comfort show', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t19: { title: 'DC has the strongest iconic characters', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t20: { title: 'Interstellar is a better film than Inception', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t21: { title: 'Anime has better storytelling than Western shows', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t22: { title: 'Batman is the best superhero', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t23: { title: 'Spider-Man is the most relatable superhero', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t24: { title: 'One Piece is the greatest manga', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },
  t25: { title: 'Naruto has the strongest underdog impact', sideA: 'Agree', sideB: 'Disagree', category: 'Entertainment' },

  // Music
  t26: { title: 'BTS has the strongest fandom in music', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t27: { title: 'Taylor Swift is the most powerful pop artist', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t28: { title: 'Michael Jackson is the greatest pop star', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t29: { title: 'Arijit Singh is the most loved playback singer', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t30: { title: 'The Beatles are the most influential band', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t31: { title: 'Eminem is the most impactful rapper', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t32: { title: 'A.R. Rahman is the most visionary composer', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t33: { title: 'Kendrick Lamar is a better artist than Drake', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },
  t34: { title: 'Live music is a better experience than studio albums', sideA: 'Agree', sideB: 'Disagree', category: 'Music' },

  // Technology
  t35: { title: 'Apple is the best consumer tech brand', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t36: { title: 'Android is the best mobile platform', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t37: { title: 'Tesla has the strongest EV fanbase', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t38: { title: 'Google has the biggest tech influence', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t39: { title: 'Open-source software has the deepest long-term impact', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t40: { title: 'NVIDIA is the most important chip company', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t41: { title: 'Elon Musk has the biggest tech fanbase', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t42: { title: 'AI will do more good than harm for humanity', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t43: { title: 'Social media does more harm than good to society', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },
  t44: { title: 'Remote work is more productive than office work', sideA: 'Agree', sideB: 'Disagree', category: 'Technology' },

  // Gaming
  t45: { title: 'PlayStation has the best gaming legacy', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t46: { title: 'Nintendo makes the most timeless games', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t47: { title: 'Xbox is the best ecosystem for gamers', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t48: { title: 'GTA is the most impactful game series', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t49: { title: 'The Legend of Zelda is the best adventure franchise', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t50: { title: 'Minecraft is the most influential game', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t51: { title: 'PC gaming is superior to console gaming', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },
  t52: { title: 'Single player games are better than multiplayer', sideA: 'Agree', sideB: 'Disagree', category: 'Gaming' },

  // Literature
  t53: { title: 'Dostoevsky has the deepest impact on literature', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t54: { title: 'Shakespeare is the greatest writer', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t55: { title: 'Tolstoy wrote the most powerful novels', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t56: { title: 'Kafka\'s impact on literature is unmatched', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t57: { title: 'Jane Austen is the sharpest social observer in literature', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t58: { title: 'J.K. Rowling built the most devoted book fanbase', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },
  t59: { title: 'Books are a better learning tool than podcasts', sideA: 'Agree', sideB: 'Disagree', category: 'Literature' },

  // Philosophy
  t60: { title: 'Socrates had the greatest philosophical impact', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },
  t61: { title: 'Nietzsche is the most provocative philosopher', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },
  t62: { title: 'Aristotle is the most useful philosopher', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },
  t63: { title: 'Plato is the most foundational philosopher', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },
  t64: { title: 'Stoicism has the strongest modern appeal', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },
  t65: { title: 'Existentialism is the most relatable philosophy', sideA: 'Agree', sideB: 'Disagree', category: 'Philosophy' },

  // History
  t66: { title: 'Gandhi had the biggest moral impact in history', sideA: 'Agree', sideB: 'Disagree', category: 'History' },
  t67: { title: 'Napoleon is the most fascinating historical figure', sideA: 'Agree', sideB: 'Disagree', category: 'History' },
  t68: { title: 'Alexander the Great had the widest military impact', sideA: 'Agree', sideB: 'Disagree', category: 'History' },
  t69: { title: 'Churchill is history\'s most memorable wartime leader', sideA: 'Agree', sideB: 'Disagree', category: 'History' },
  t70: { title: 'Julius Caesar is the most iconic Roman figure', sideA: 'Agree', sideB: 'Disagree', category: 'History' },
  t71: { title: 'The Industrial Revolution had the greatest historical impact', sideA: 'Agree', sideB: 'Disagree', category: 'History' },

  // Politics
  t72: { title: 'Strong leaders matter more than party labels', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },
  t73: { title: 'Democracy works best when voters judge results, not speeches', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },
  t74: { title: 'The best political campaign is the one with the strongest emotional connection', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },
  t75: { title: 'Social media has more influence on politics than traditional debates', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },
  t76: { title: 'Identity politics matters more than critics admit', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },
  t77: { title: 'Economic policy creates more real impact than ideological slogans', sideA: 'Agree', sideB: 'Disagree', category: 'Politics' },

  // Fandom
  t78: { title: 'Fanfiction is better than many official sequels', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },
  t79: { title: 'Canon-compliant fanfiction has the strongest appeal', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },
  t80: { title: 'Alternate-universe fanfiction is the most creative form', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },
  t81: { title: 'Harry Potter has one of the biggest fanbases ever', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },
  t82: { title: 'Book fandoms create more engagement than publishing campaigns', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },
  t83: { title: 'Reader communities have more power now than traditional critics', sideA: 'Agree', sideB: 'Disagree', category: 'Fandom' },

  // Astrology
  t84: { title: 'Astrology has more cultural influence than skeptics admit', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },
  t85: { title: 'Birth charts are more compelling than sun signs', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },
  t86: { title: 'Pop astrology is the most popular form of astrology', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },
  t87: { title: 'Celebrity astrologers have the biggest reach', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },
  t88: { title: 'Astrology gives people meaning, not just predictions', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },
  t89: { title: 'Zodiac-based fan culture is stronger than people think', sideA: 'Agree', sideB: 'Disagree', category: 'Astrology' },

  // Science
  t90: { title: 'Einstein had the greatest scientific impact', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },
  t91: { title: 'Newton is the most foundational scientist', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },
  t92: { title: 'Marie Curie had the most inspiring scientific legacy', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },
  t93: { title: 'Space science captures the public imagination more than any other field', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },
  t94: { title: 'Medical science has the biggest everyday impact', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },
  t95: { title: 'Scientific breakthroughs matter most when they change life outside the lab', sideA: 'Agree', sideB: 'Disagree', category: 'Science' },

  // Fiction
  t96: { title: 'Fantasy is the best fiction genre', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },
  t97: { title: 'Dystopian fiction has the strongest impact', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },
  t98: { title: 'Character-driven fiction is better than plot-driven fiction', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },
  t99: { title: 'Long-form series fiction builds stronger fan loyalty than standalone novels', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },
  t100: { title: 'Realistic fiction is more powerful than fantasy', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },
  t101: { title: 'Epic fiction has the greatest emotional payoff', sideA: 'Agree', sideB: 'Disagree', category: 'Fiction' },

  // Lifestyle
  t102: { title: 'Calisthenics builds better functional fitness than gym', sideA: 'Agree', sideB: 'Disagree', category: 'Lifestyle' },
  t103: { title: 'Being an early bird is better than being a night owl', sideA: 'Agree', sideB: 'Disagree', category: 'Lifestyle' },
  t104: { title: 'A vegetarian diet is healthier than a non-vegetarian one', sideA: 'Agree', sideB: 'Disagree', category: 'Lifestyle' },
  t105: { title: 'City life is better than village life in the modern era', sideA: 'Agree', sideB: 'Disagree', category: 'Lifestyle' },

  // Career
  t106: { title: 'A college degree is still worth it in 2025', sideA: 'Agree', sideB: 'Disagree', category: 'Career' },
  t107: { title: 'Job security is more important than startup risk at 25', sideA: 'Agree', sideB: 'Disagree', category: 'Career' },
  t108: { title: 'You should follow your passion even if it pays less', sideA: 'Agree', sideB: 'Disagree', category: 'Career' },
  t109: { title: 'Being an entrepreneur is better than being an employee', sideA: 'Agree', sideB: 'Disagree', category: 'Career' },
}

// Suggestions by category — more maintainable than per-topic at this scale
export const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  Sports: ['What makes someone the GOAT?', 'How do you judge greatness — stats or moments?', 'Which era do you think was toughest?'],
  Entertainment: ['What made this stick with you?', 'How does it compare to today\'s standards?', 'What\'s the moment that defines it for you?'],
  Music: ['What makes an artist\'s impact last?', 'Does the fanbase reflect the music\'s quality?', 'Which era of their work proves this best?'],
  Technology: ['What does loyalty to a brand actually mean?', 'Would you switch if price wasn\'t a factor?', 'What matters more — ecosystem or specs?'],
  Gaming: ['What makes a game "timeless"?', 'Which title best proves this?', 'Does nostalgia affect your opinion here?'],
  Literature: ['What makes a writer\'s influence last centuries?', 'Which work best proves this?', 'Is difficulty a feature or a flaw?'],
  Philosophy: ['What makes an idea "foundational"?', 'How does this apply to modern life?', 'Do you actually agree with their conclusions?'],
  History: ['What makes a historical figure "impactful"?', 'How do you separate legacy from myth?', 'Would history judge them differently today?'],
  Politics: ['What matters more to you — policy or personality?', 'How do you evaluate this fairly?', 'What would change your mind here?'],
  Fandom: ['What makes fan-created content valuable?', 'Where do you draw the line on canon?', 'What\'s a fandom moment that surprised you?'],
  Astrology: ['Do you engage with this seriously or casually?', 'What draws people to it, in your view?', 'Has it ever been accurate for you?'],
  Science: ['What makes a discovery "foundational"?', 'How do you weigh impact vs originality?', 'What\'s a breakthrough that changed how you think?'],
  Fiction: ['What makes a story stay with you?', 'Do you prefer being surprised or moved?', 'What\'s a book or show that proves your point?'],
  Lifestyle: ['What does your own experience tell you?', 'What would change your mind here?', 'What\'s the hidden tradeoff people don\'t talk about?'],
  Career: ['What would you tell your younger self?', 'What\'s the real tradeoff people don\'t admit?', 'Has your view changed with experience?'],
}