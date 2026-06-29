export const TOPICS: Record<string, { title: string; sideA: string; sideB: string }> = {
  // Sports
  t1: { title: 'Virat Kohli is a better Test captain than Rohit Sharma', sideA: 'Agree', sideB: 'Disagree' },
  t2: { title: 'Messi is the greatest footballer of all time', sideA: 'Agree', sideB: 'Disagree' },
  t3: { title: 'Cricket is more skillful than Football', sideA: 'Agree', sideB: 'Disagree' },
  t4: { title: 'LeBron James is better than Michael Jordan', sideA: 'Agree', sideB: 'Disagree' },
  t5: { title: 'T20 is ruining Test cricket', sideA: 'Agree', sideB: 'Disagree' },

  // Entertainment
  t6: { title: 'Marvel has better storytelling than DC', sideA: 'Agree', sideB: 'Disagree' },
  t7: { title: 'Interstellar is a better film than Inception', sideA: 'Agree', sideB: 'Disagree' },
  t8: { title: 'Nolan is a better director than Scorsese', sideA: 'Agree', sideB: 'Disagree' },
  t9: { title: 'Anime has better storytelling than Western shows', sideA: 'Agree', sideB: 'Disagree' },
  t10: { title: 'TV shows are a better format than movies for storytelling', sideA: 'Agree', sideB: 'Disagree' },

  // Technology
  t11: { title: 'Android gives more value than iPhone', sideA: 'Agree', sideB: 'Disagree' },
  t12: { title: 'AI will do more good than harm for humanity', sideA: 'Agree', sideB: 'Disagree' },
  t13: { title: 'Remote work is more productive than office work', sideA: 'Agree', sideB: 'Disagree' },
  t14: { title: 'Social media does more harm than good to society', sideA: 'Agree', sideB: 'Disagree' },
  t15: { title: 'Electric cars are ready to replace petrol cars today', sideA: 'Agree', sideB: 'Disagree' },

  // Gaming
  t16: { title: 'PC gaming is superior to console gaming', sideA: 'Agree', sideB: 'Disagree' },
  t17: { title: 'PUBG is a better game than Free Fire', sideA: 'Agree', sideB: 'Disagree' },
  t18: { title: 'Single player games are better than multiplayer', sideA: 'Agree', sideB: 'Disagree' },
  t19: { title: 'Minecraft has more creative value than Roblox', sideA: 'Agree', sideB: 'Disagree' },

  // Lifestyle
  t20: { title: 'Calisthenics builds better functional fitness than gym', sideA: 'Agree', sideB: 'Disagree' },
  t21: { title: 'Being an early bird is better than being a night owl', sideA: 'Agree', sideB: 'Disagree' },
  t22: { title: 'A vegetarian diet is healthier than a non-vegetarian one', sideA: 'Agree', sideB: 'Disagree' },
  t23: { title: 'Books are a better learning tool than podcasts', sideA: 'Agree', sideB: 'Disagree' },
  t24: { title: 'City life is better than village life in the modern era', sideA: 'Agree', sideB: 'Disagree' },

  // Music
  t25: { title: 'Kendrick Lamar is a better artist than Drake', sideA: 'Agree', sideB: 'Disagree' },
  t26: { title: 'Hip Hop has more cultural depth than Rock', sideA: 'Agree', sideB: 'Disagree' },
  t27: { title: 'Spotify is a better music platform than YouTube Music', sideA: 'Agree', sideB: 'Disagree' },
  t28: { title: 'Live music is a better experience than studio albums', sideA: 'Agree', sideB: 'Disagree' },

  // Career
  t29: { title: 'A college degree is still worth it in 2025', sideA: 'Agree', sideB: 'Disagree' },
  t30: { title: 'Job security is more important than startup risk at 25', sideA: 'Agree', sideB: 'Disagree' },
  t31: { title: 'You should follow your passion even if it pays less', sideA: 'Agree', sideB: 'Disagree' },
  t32: { title: 'Being an entrepreneur is better than being an employee', sideA: 'Agree', sideB: 'Disagree' },
}

export const SUGGESTIONS: Record<string, string[]> = {
  t1: ['What makes a great Test captain?', 'How do you compare their leadership styles?', 'Which series defined their captaincy?'],
  t2: ['What makes someone the GOAT?', 'How does Ronaldo compare in your view?', 'Which World Cup moment defines Messi?'],
  t3: ['What skills does each sport require?', 'Which is harder to master?', 'Which do you think deserves more global respect?'],
  t4: ['What era of basketball do you think was harder?', 'How do you compare their championships?', 'Who had the bigger cultural impact?'],
  t5: ['What has T20 done to batting technique?', 'Is Test cricket dying or evolving?', 'What format would you save if you could only keep one?'],
  t6: ['Which has better villain writing?', 'Which cinematic universe is more consistent?', 'What is the best film from each?'],
  t7: ['Which ending hit harder?', 'Which is more rewatchable?', 'Which concept was more original?'],
  t8: ['Who takes more creative risks?', 'Who has the stronger overall filmography?', 'Which single film best represents each director?'],
  t9: ['Which has deeper character development?', 'Which handles serious themes better?', 'What anime would you recommend to a non-anime fan?'],
  t10: ['Which format allows deeper storytelling?', 'Which is better for character development?', 'What show changed your mind on this?'],
  t11: ['Which gives you more control over your device?', 'Which is better value for money?', 'Which ecosystem works better for daily life?'],
  t12: ['Which jobs do you think AI will replace first?', 'Can AI be genuinely creative?', 'Should AI development be regulated?'],
  t13: ['What does your own experience tell you?', 'Which is better for mental health?', 'What is the biggest downside of each?'],
  t14: ['What has social media done well?', 'What has it made worse?', 'Should there be an age limit?'],
  t15: ['What is the biggest barrier to EV adoption?', 'Which is more practical in your country right now?', 'Will petrol cars exist in 20 years?'],
  t16: ['Which has better exclusives?', 'Which is more accessible to new gamers?', 'Which community is better?'],
  t17: ['Which has better gameplay mechanics?', 'Which has a healthier community?', 'Which has more competitive depth?'],
  t18: ['Which do you personally enjoy more?', 'Which has better game design?', 'What is the best single player game ever made?'],
  t19: ['Which teaches more creativity?', 'Which has aged better?', 'Which would you recommend to a 10 year old?'],
  t20: ['Which builds more practical strength?', 'Which is more accessible without equipment?', 'Which is more sustainable long term?'],
  t21: ['What does your own routine look like?', 'Which is better for productivity?', 'Which suits the modern work lifestyle better?'],
  t22: ['What does the science actually say?', 'Which is more sustainable for the planet?', 'Have you ever tried switching?'],
  t23: ['Which helps you retain information better?', 'Which fits better into daily life?', 'What book or podcast changed your thinking?'],
  t24: ['What do you value most in where you live?', 'Which is better for raising a family?', 'Would you ever switch permanently?'],
  t25: ['What makes a rapper great — bars or culture?', 'How do you judge the beef outcome?', 'Which album do you think defines each artist?'],
  t26: ['Which has more artistic range?', 'Which has had more cultural impact globally?', 'Which will still be relevant in 50 years?'],
  t27: ['Which discovery algorithm is better?', 'Which has better sound quality?', 'Which do you actually use daily?'],
  t28: ['What is the best live show you have experienced?', 'Does live performance show more artistry?', 'Which memory lasts longer?'],
  t29: ['What field are you in and does it matter there?', 'What would you tell your 18 year old self?', 'Is the debt worth it?'],
  t30: ['What would you choose at 25 knowing what you know now?', 'What is the hidden cost of each path?', 'Has your view changed over time?'],
  t31: ['Can passion actually pay the bills?', 'Does chasing salary eventually lead to passion?', 'What did you personally choose?'],
  t32: ['What is the hidden cost of entrepreneurship?', 'Which gives you more freedom in practice?', 'Would you switch if you could?'],
}