import { type SocialWorld, type Post, PEOPLE } from './socialModel';

export interface NpcPersona {
  id: string;
  name: string;
  keywords: string[];
  blogComments: { generic: string[]; topicMatched: string[] };
  guestbookReplies: string[];
  spontaneousGuestbook: string[];
}

export const NPC_PERSONAS: Record<string, NpcPersona> = {
  jeremie: {
    id: 'jeremie',
    name: 'Jeremie Belpois',
    keywords: ['tech', 'code', 'circuit', 'diagram', 'build', 'invention', 'machine', 'terminal', 'logic', 'system', 'program'],
    blogComments: {
      generic: [
        'i like how you put this together ^_^ looking forward to seeing how it develops.',
        'clean documentation. it is nice to see the thought process behind it.',
        'solid work! let me know if you run into any bus sync delays or need a second pair of eyes.'
      ],
      topicMatched: [
        'fascinating logic structure! i was actually sketching out something similar in my notebook yesterday ^_^',
        'the architecture here is really clean. nice job getting the signal path routed properly!',
        'i appreciate the breakdown here. it is always more rewarding when you solve the underlying problem yourself ^_^'
      ]
    },
    guestbookReplies: [
      'thanks for signing my page ^_^ hope your projects are coming along smoothly!',
      'always good hearing from you. let me know if you want to look over those schematics sometime.'
    ],
    spontaneousGuestbook: [
      'stopping by to check out your latest updates! your profile layout looks great ^_^',
      'hope you are having a productive week! take a break from the screen once in a while though haha'
    ]
  },
  aelita: {
    id: 'aelita',
    name: 'Aelita Schaeffer',
    keywords: ['music', 'song', 'melody', 'art', 'color', 'sketch', 'memory', 'dream', 'quiet', 'piano', 'sound', 'stars'],
    blogComments: {
      generic: [
        'this feels very peaceful... thank you for sharing a quiet reflection today ✿',
        'reading this brought a little smile to my face ♡',
        'there is something very gentle in the way you express this.'
      ],
      topicMatched: [
        'the colors and imagery in this are so vivid... it reminds me of a morning by the botanical conservatory ✿',
        'i love this melody of thoughts! music and writing always seem to connect in the best ways ♡',
        'such a sweet memory to hold onto. the small moments really are the ones that matter most ✿'
      ]
    },
    guestbookReplies: [
      'thank you for leaving such a kind note on my page ✿ wishing you a restful evening!',
      'it was lovely seeing your name pop up in my guestbook ♡ take care today!'
    ],
    spontaneousGuestbook: [
      'listening to your profile song while looking at your page ♫ it fits the mood so well ✿',
      'just leaving a little warmth on your wall! hope you discover something beautiful today ♡'
    ]
  },
  sissi: {
    id: 'sissi',
    name: 'Elisabeth Delmas',
    keywords: ['style', 'look', 'photo', 'party', 'event', 'weekend', 'outfit', 'evening', 'glamour', 'friends', 'plans'],
    blogComments: {
      generic: [
        'loving this entry! you definitely have a distinct point of view ~ xoxo',
        'cute post!! we really need to catch up properly soon ♡',
        'honestly, so true! nobody talks about this enough haha ~'
      ],
      topicMatched: [
        'ok wait, this aesthetic is EVERYTHING!! absolute perfection ~ xoxo',
        'you have such an eye for great moments! definitely saving this to read again ♡',
        'love seeing your updates on my feed! make sure you save some time for our weekend plans ~'
      ]
    },
    guestbookReplies: [
      'thx 4 the comment!! your profile is looking super cute today ~ xoxo',
      'aww thanks for visiting my corner! don’t be a stranger, okay? ♡'
    ],
    spontaneousGuestbook: [
      'stopping by to drop some love on your wall! ♡ hope you are having the best week ever ~ xoxo',
      'your Top 8 choices are immaculate haha! thanks for being an awesome friend ♡'
    ]
  },
  odd: {
    id: 'odd',
    name: 'Odd Della Robbia',
    keywords: ['funny', 'joke', 'laugh', 'dog', 'snack', 'food', 'comic', 'game', 'doodle', 'fun', 'sketch'],
    blogComments: {
      generic: [
        'hahaha legendary post! ten out of ten, no notes xd',
        'i literally laughed out loud at this, thanks for brightening up the feed!! :D',
        'now THIS is the kind of quality content i log on for ★'
      ],
      topicMatched: [
        'dude this is awesome! i was literally doodling something like this five minutes ago xd',
        'wait that sounds delicious / hilarious!! you gotta tell me the whole story next time ★',
        'epic update!! Kiwi approved this message 100% :D'
      ]
    },
    guestbookReplies: [
      'yo thanks for stopping by my page! grab a digital cookie on your way out :D ★',
      'thx 4 the note!! your page is rockin’ today xd'
    ],
    spontaneousGuestbook: [
      'BOOM! signed your guestbook! hope you have an epic day full of great snacks and zero homework :D ★',
      'just checking out your profile widgets! looking totally rad xd'
    ]
  },
  voss: {
    id: 'voss',
    name: 'Dr. Sharon Voss',
    keywords: ['health', 'rest', 'tea', 'botany', 'plant', 'break', 'reading', 'sleep', 'walk', 'calm', 'quiet'],
    blogComments: {
      generic: [
        'A grounded and thoughtful reflection. Thank you for sharing this perspective.',
        'Well said. Making time for honest observations is valuable.',
        'A quiet breath in the middle of a busy schedule. Much appreciated.'
      ],
      topicMatched: [
        'Very true. Remember that taking an intentional pause is just as vital as continuous progress.',
        'A soothing read. A warm cup of mint tea and a quiet corner do wonders for the mind.',
        'An observant eye. Nature and quiet spaces always restore our perspective when the work gets heavy.'
      ]
    },
    guestbookReplies: [
      'Thank you for signing my guestbook. Wishing you health, focus, and a peaceful evening.',
      'A pleasure to see your note. Take good care of yourself today.'
    ],
    spontaneousGuestbook: [
      'Passing by your corner of the network. I hope you are pacing yourself well today. ❧',
      'A pleasant profile. Remember to stay hydrated and step away from the glare now and then.'
    ]
  },
  riven: {
    id: 'riven',
    name: 'Riven Asterwind',
    keywords: ['city', 'street', 'walk', 'tower', 'view', 'district', 'outside', 'rain', 'night', 'bridge'],
    blogComments: {
      generic: [
        'Good observation. Keep your eyes open.',
        'Fair point. Things look different depending on where you stand.',
        'Interesting angle.'
      ],
      topicMatched: [
        'I walked past that district around dusk. The light changes fast out there; good eye.',
        'Quiet streets at night have their own rhythm. Glad you captured it.',
        'Accurate reading of the city. You notice the small shifts most people walk right past.'
      ]
    },
    guestbookReplies: [
      'Thanks for the note. Keep moving forward.',
      'Appreciate the visit. Stay alert out there.'
    ],
    spontaneousGuestbook: [
      'Checking in. City looks quiet tonight. Hope things are steady on your end. ◇',
      'Dropped by your space. Good to see you are doing well.'
    ]
  },
  mara: {
    id: 'mara',
    name: 'Mara Thorne',
    keywords: ['book', 'library', 'offline', 'paper', 'print', 'novel', 'chapter', 'author', 'read', 'shelf'],
    blogComments: {
      generic: [
        'Adding this to my reading stack. Always refreshing to see genuine writing.',
        'Thoughtful prose. It is rare to see people take time with their thoughts like this.',
        'A nice entry. Writing for yourself first is always the best way.'
      ],
      topicMatched: [
        'This reminds me of an old essay on craft I found in the second-hand shop last month. Beautifully put.',
        'There is a tactile quality to this reflection that I really appreciate. Keep going.',
        'Books and quiet hours remain the most reliable antidote to screen fatigue. A lovely post.'
      ]
    },
    guestbookReplies: [
      'Thank you for leaving a note on my page. May your reading pile bring you good company today.',
      'Lovely to hear from you. Take your time with the things you love.'
    ],
    spontaneousGuestbook: [
      'Visiting your corner between chapters. Your page layout has a wonderful nostalgic warmth. ✧',
      'Leaving a little mark in your guestbook. Wishing you peaceful hours and good stories.'
    ]
  },
  rowan: {
    id: 'rowan',
    name: 'Archivist Rowan',
    keywords: ['journal', 'archive', 'history', 'record', 'margin', 'past', 'note', 'ink', 'page', 'memory'],
    blogComments: {
      generic: [
        'A worthy entry for the personal record. The margins are always where the real story lives.',
        'Thoughtfully inscribed. Each post is a small marker against the erosion of memory.',
        'A fine beginning to a lasting record.'
      ],
      topicMatched: [
        'Historical memory thrives on precisely these quiet, honest notations. A splendid entry.',
        'I have added a mental note of this in the margin index. Time has a way of returning value to reflections like this.',
        'Ink on paper or characters in a terminal; preservation begins with the willingness to record.'
      ]
    },
    guestbookReplies: [
      'I appreciate your thoughtful inscription in my guestbook. The archives remember kindness.',
      'Thank you for your visit. May your own records grow richer with each cycle.'
    ],
    spontaneousGuestbook: [
      'Paying a quiet visit to your personal space. The arrangement of your thoughts is commendable. ❦',
      'Leaving an archival greeting in your guestbook. May your day be orderly and contemplative.'
    ]
  }
};

/**
 * Matches an NPC's persona to the content of a post and returns an authentic comment.
 */
export function getCommentForPost(persona: NpcPersona, post: Post): { comment: string; matched: boolean } {
  const content = `${post.title} ${post.html}`.toLowerCase();
  const matchedKeyword = persona.keywords.find(kw => content.includes(kw));

  if (matchedKeyword && persona.blogComments.topicMatched.length > 0) {
    const pool = persona.blogComments.topicMatched;
    const comment = pool[Math.floor(Math.random() * pool.length)];
    return { comment, matched: true };
  }

  const pool = persona.blogComments.generic;
  const comment = pool[Math.floor(Math.random() * pool.length)];
  return { comment, matched: false };
}

/**
 * Evaluates player's public blog posts and generates NPC comments, likes, and guestbook visits.
 * Called on timeCycle advance ('tick') in social state.
 */
export function processNpcReactivity(
  world: SocialWorld,
  currentCycle: number
): { modified: boolean; newNotificationCount: number } {
  let modified = false;
  let newNotificationCount = 0;

  // Filter player's public, published blogs & bulletins
  const playerPosts = world.posts.filter(
    p => p.author === 'you' && !p.draft && ['public', 'friends'].includes(p.audience)
  );

  // Eligible NPC friends (excluding blocked/muted)
  const eligibleFriends = world.friends.filter(id => !world.blocked.includes(id) && !world.muted.includes(id));
  if (!eligibleFriends.length && !world.top8.length) return { modified: false, newNotificationCount: 0 };

  // 1. Process Blog Comments for unreviewed player posts
  for (const post of playerPosts) {
    // Only react to posts from recent cycles (within 3 cycles)
    if (currentCycle - post.cycle > 3) continue;

    // Check which friends have already commented on this post
    const existingCommentAuthors = world.comments.filter(c => c.target === post.id).map(c => c.author);

    // Prioritize friends with keyword matches or in Top 8
    for (const friendId of eligibleFriends) {
      if (existingCommentAuthors.includes(friendId)) continue;
      const persona = NPC_PERSONAS[friendId];
      if (!persona) continue;

      const isTop8 = world.top8.includes(friendId);
      const { comment, matched } = getCommentForPost(persona, post);

      // React if topic matched OR 40% probability for Top 8 friend
      if (matched || (isTop8 && Math.random() < 0.4)) {
        const commentId = `npc-comment:${post.id}:${friendId}:${currentCycle}`;
        world.comments.push({
          id: commentId,
          author: friendId,
          target: post.id,
          text: comment,
          cycle: currentCycle
        });

        // Also add a like if not already liked
        if (!post.likes.includes(friendId)) {
          post.likes.push(friendId);
        }

        // Add a notification
        const noteId = `note:blog-comment:${post.id}:${friendId}`;
        if (!world.notifications.some(n => n.id === noteId)) {
          world.notifications.unshift({
            id: noteId,
            text: `${persona.name} commented on "${post.title.slice(0, 30)}": "${comment.slice(0, 45)}..."`,
            destination: `Blog:${post.id}`,
            read: false
          });
          newNotificationCount++;
        }

        modified = true;
        // Limit to 1 comment per post per cycle tick to keep pace natural
        break;
      }
    }
  }

  // 2. Spontaneous Guestbook note from Top 8 friends (15% chance per cycle if no recent guestbook note)
  const recentGuestbook = world.comments.filter(
    c => c.target === 'profile:you' && c.author !== 'you' && c.cycle === currentCycle
  );

  if (recentGuestbook.length === 0 && world.top8.length > 0) {
    const candidate = world.top8[Math.floor(Math.random() * world.top8.length)];
    const persona = NPC_PERSONAS[candidate];
    if (persona && persona.spontaneousGuestbook.length > 0 && Math.random() < 0.35) {
      const text = persona.spontaneousGuestbook[Math.floor(Math.random() * persona.spontaneousGuestbook.length)];
      const noteId = `npc-guestbook:${candidate}:${currentCycle}`;
      world.comments.push({
        id: noteId,
        author: candidate,
        target: 'profile:you',
        text,
        cycle: currentCycle
      });

      world.notifications.unshift({
        id: `note:guestbook:${candidate}:${currentCycle}`,
        text: `${persona.name} signed your guestbook: "${text.slice(0, 40)}..."`,
        destination: 'My Profile',
        read: false
      });

      newNotificationCount++;
      modified = true;
    }
  }

  return { modified, newNotificationCount };
}

/**
 * Handles immediate NPC reaction when player signs an NPC's guestbook.
 */
export function handleDirectGuestbookSign(
  world: SocialWorld,
  npcId: string,
  playerCommentText: string,
  currentCycle: number
): void {
  const persona = NPC_PERSONAS[npcId];
  if (!persona || persona.guestbookReplies.length === 0) return;

  const replyText = persona.guestbookReplies[Math.floor(Math.random() * persona.guestbookReplies.length)];
  const replyId = `direct-reply:${npcId}:${Date.now()}`;

  // Queue a reply on the NPC's profile or on player's guestbook acknowledging the visit
  world.comments.push({
    id: replyId,
    author: npcId,
    target: `profile:${npcId}`,
    text: replyText,
    cycle: currentCycle
  });

  world.notifications.unshift({
    id: `note:reply:${npcId}:${Date.now()}`,
    text: `${persona.name} replied to your guestbook note: "${replyText.slice(0, 45)}..."`,
    destination: `profile:${npcId}`,
    read: false
  });
}
