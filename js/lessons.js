/* ============================================================
 * 课程数据 v0.1 —— 封闭课程域（合规设计：AI 不开放生成，全部人工教研）
 * band: 3-6 启蒙 / 6-9 基础 / 9-12 提升
 * turn.type: repeat 跟读 | answer 回答（关键词命中即可）
 * ============================================================ */
window.LESSONS = [
  /* ---------- 3-6 岁 启蒙 ---------- */
  {
    id: 'greet1', band: '3-6', icon: '👋', title: '打招呼', titleEn: 'Say Hello',
    intro: '小狐狸 Pip 想认识你！跟着它大声说英语吧。',
    turns: [
      { pet: 'Hello!', zh: '你好！', expect: 'Hello', keywords: ['hello', 'hi'], type: 'repeat' },
      { pet: 'I am Pip.', zh: '我是 Pip。', expect: 'I am Pip', keywords: ['i', 'am', 'pip'], type: 'repeat' },
      { pet: 'What is your name?', zh: '你叫什么名字？试着说：My name is …', expect: 'My name is …', keywords: ['my', 'name'], type: 'answer' },
      { pet: 'Nice to meet you!', zh: '很高兴认识你！', expect: 'Nice to meet you', keywords: ['nice', 'meet', 'you'], type: 'repeat' },
      { pet: 'Goodbye! See you!', zh: '再见！回头见！', expect: 'Goodbye', keywords: ['goodbye', 'bye', 'see'], type: 'repeat' }
    ],
    vocab: [
      { w: 'hello', zh: '你好', s: 'Hello!' },
      { w: 'name', zh: '名字', s: 'My name is Pip.' },
      { w: 'goodbye', zh: '再见', s: 'Goodbye!' }
    ]
  },
  {
    id: 'color1', band: '3-6', icon: '🎨', title: '认识颜色', titleEn: 'Colors',
    intro: 'Pip 的魔法画笔能变出好多颜色，一起念出它们！',
    turns: [
      { pet: 'Red! I like red apples.', zh: '红色！我喜欢红苹果。', expect: 'Red', keywords: ['red'], type: 'repeat' },
      { pet: 'Yellow! The sun is yellow.', zh: '黄色！太阳是黄色的。', expect: 'Yellow', keywords: ['yellow'], type: 'repeat' },
      { pet: 'Blue! The sky is blue.', zh: '蓝色！天空是蓝色的。', expect: 'Blue', keywords: ['blue'], type: 'repeat' },
      { pet: 'What color do you like?', zh: '你喜欢什么颜色？试着说：I like …', expect: 'I like …', keywords: ['i', 'like'], type: 'answer' },
      { pet: 'Green! Grass is green.', zh: '绿色！小草是绿色的。', expect: 'Green', keywords: ['green'], type: 'repeat' }
    ],
    vocab: [
      { w: 'red', zh: '红色', s: 'I like red apples.' },
      { w: 'yellow', zh: '黄色', s: 'The sun is yellow.' },
      { w: 'blue', zh: '蓝色', s: 'The sky is blue.' },
      { w: 'green', zh: '绿色', s: 'Grass is green.' }
    ]
  },
  {
    id: 'animal1', band: '3-6', icon: '🐾', title: '动物朋友', titleEn: 'Animals',
    intro: '森林里开派对啦！学一学动物们的名字。',
    turns: [
      { pet: 'A cat! Meow, meow.', zh: '一只猫！喵喵。', expect: 'Cat', keywords: ['cat'], type: 'repeat' },
      { pet: 'A dog! Woof, woof.', zh: '一只狗！汪汪。', expect: 'Dog', keywords: ['dog'], type: 'repeat' },
      { pet: 'A bird! Tweet, tweet.', zh: '一只小鸟！叽叽喳喳。', expect: 'Bird', keywords: ['bird'], type: 'repeat' },
      { pet: 'I like cats. What about you?', zh: '我喜欢猫，你呢？试着说：I like …', expect: 'I like …', keywords: ['i', 'like'], type: 'answer' },
      { pet: 'A fish! It can swim.', zh: '一条鱼！它会游泳。', expect: 'Fish', keywords: ['fish'], type: 'repeat' }
    ],
    vocab: [
      { w: 'cat', zh: '猫', s: 'A cat! Meow!' },
      { w: 'dog', zh: '狗', s: 'A dog! Woof!' },
      { w: 'bird', zh: '鸟', s: 'A bird can fly.' },
      { w: 'fish', zh: '鱼', s: 'A fish can swim.' }
    ]
  },
  /* ---------- 6-9 岁 基础 ---------- */
  {
    id: 'family1', band: '6-9', icon: '👨‍👩‍👧', title: '我的家人', titleEn: 'My Family',
    intro: 'Pip 想看你的全家福！用英语介绍你的家人吧。',
    turns: [
      { pet: 'This is my mom. She is kind.', zh: '这是我妈妈，她很温柔。', expect: 'This is my mom', keywords: ['this', 'my', 'mom'], type: 'repeat' },
      { pet: 'This is my dad. He is tall.', zh: '这是我爸爸，他很高。', expect: 'This is my dad', keywords: ['this', 'my', 'dad'], type: 'repeat' },
      { pet: 'I have a sister.', zh: '我有一个姐姐/妹妹。', expect: 'I have a sister', keywords: ['i', 'have', 'sister'], type: 'repeat' },
      { pet: 'Who is in your family?', zh: '你家里都有谁？试着说：I have …', expect: 'I have …', keywords: ['i', 'have'], type: 'answer' },
      { pet: 'I love my family!', zh: '我爱我的家！', expect: 'I love my family', keywords: ['i', 'love', 'family'], type: 'repeat' }
    ],
    vocab: [
      { w: 'mom', zh: '妈妈', s: 'This is my mom.' },
      { w: 'dad', zh: '爸爸', s: 'This is my dad.' },
      { w: 'sister', zh: '姐妹', s: 'I have a sister.' },
      { w: 'family', zh: '家庭', s: 'I love my family.' }
    ]
  },
  {
    id: 'food1', band: '6-9', icon: '🍔', title: '点餐小达人', titleEn: 'Order Food',
    intro: 'Pip 餐厅开张啦！你是小顾客，学会用英语点餐。',
    turns: [
      { pet: 'Welcome! What would you like?', zh: '欢迎光临！你想要点什么？', expect: 'I would like …', keywords: ['would', 'like'], type: 'answer' },
      { pet: 'I would like some noodles.', zh: '我想要一些面条。', expect: 'I would like some noodles', keywords: ['would', 'like', 'noodles'], type: 'repeat' },
      { pet: 'Can I have some juice, please?', zh: '请给我一些果汁好吗？', expect: 'Can I have some juice please', keywords: ['can', 'have', 'juice'], type: 'repeat' },
      { pet: 'Here you are! Anything else?', zh: '给你！还要别的吗？试着说：No, thank you.', expect: 'No, thank you', keywords: ['no', 'thank'], type: 'answer' },
      { pet: 'Thank you! Enjoy your meal!', zh: '谢谢！祝你用餐愉快！', expect: 'Thank you', keywords: ['thank', 'you'], type: 'repeat' }
    ],
    vocab: [
      { w: 'noodles', zh: '面条', s: 'I would like some noodles.' },
      { w: 'juice', zh: '果汁', s: 'Can I have some juice?' },
      { w: 'please', zh: '请', s: 'Some juice, please.' },
      { w: 'thank you', zh: '谢谢', s: 'Thank you!' }
    ]
  },
  {
    id: 'school1', band: '6-9', icon: '🎒', title: '我的书包', titleEn: 'My Schoolbag',
    intro: '开学啦！看看书包里都有什么文具。',
    turns: [
      { pet: 'I have a pencil.', zh: '我有一支铅笔。', expect: 'I have a pencil', keywords: ['i', 'have', 'pencil'], type: 'repeat' },
      { pet: 'This is my ruler. It is long.', zh: '这是我的尺子，它很长。', expect: 'This is my ruler', keywords: ['this', 'my', 'ruler'], type: 'repeat' },
      { pet: 'May I borrow your eraser?', zh: '我可以借你的橡皮吗？', expect: 'May I borrow your eraser', keywords: ['may', 'borrow', 'eraser'], type: 'repeat' },
      { pet: 'What is in your schoolbag?', zh: '你的书包里有什么？试着说：I have …', expect: 'I have …', keywords: ['i', 'have'], type: 'answer' },
      { pet: 'Sure! Here you are.', zh: '当然可以！给你。', expect: 'Here you are', keywords: ['here', 'you', 'are'], type: 'repeat' }
    ],
    vocab: [
      { w: 'pencil', zh: '铅笔', s: 'I have a pencil.' },
      { w: 'ruler', zh: '尺子', s: 'This is my ruler.' },
      { w: 'eraser', zh: '橡皮', s: 'May I borrow your eraser?' },
      { w: 'schoolbag', zh: '书包', s: 'My schoolbag is big.' }
    ]
  },
  /* ---------- 9-12 岁 提升 ---------- */
  {
    id: 'hobby1', band: '9-12', icon: '⚽', title: '聊聊爱好', titleEn: 'Hobbies',
    intro: 'Pip 想知道你课后都喜欢做什么，聊得越具体越棒！',
    turns: [
      { pet: 'I like playing basketball after school.', zh: '我喜欢放学后打篮球。', expect: 'I like playing basketball', keywords: ['like', 'playing', 'basketball'], type: 'repeat' },
      { pet: 'What do you like to do?', zh: '你喜欢做什么？试着说：I like …', expect: 'I like …', keywords: ['i', 'like'], type: 'answer' },
      { pet: 'Reading books is fun.', zh: '读书很有趣。', expect: 'Reading books is fun', keywords: ['reading', 'books', 'fun'], type: 'repeat' },
      { pet: 'How often do you play sports?', zh: '你多久运动一次？试着说：I play … every day / twice a week.', expect: 'I play … every day', keywords: ['play', 'every', 'week', 'day'], type: 'answer' },
      { pet: 'Let us play together this weekend!', zh: '这个周末我们一起玩吧！', expect: 'Let us play together', keywords: ['let', 'play', 'together'], type: 'repeat' }
    ],
    vocab: [
      { w: 'basketball', zh: '篮球', s: 'I like playing basketball.' },
      { w: 'reading', zh: '阅读', s: 'Reading books is fun.' },
      { w: 'often', zh: '经常', s: 'How often do you play?' },
      { w: 'weekend', zh: '周末', s: 'See you this weekend!' }
    ]
  },
  {
    id: 'weather1', band: '9-12', icon: '🌦️', title: '今天天气', titleEn: 'Weather',
    intro: '出门前先看天气！学会描述天气和给建议。',
    turns: [
      { pet: 'It is sunny today. Let us go outside!', zh: '今天是晴天，我们出去玩吧！', expect: 'It is sunny today', keywords: ['sunny', 'today'], type: 'repeat' },
      { pet: 'What is the weather like today?', zh: '今天天气怎么样？试着说：It is …', expect: 'It is …', keywords: ['it', 'is'], type: 'answer' },
      { pet: 'It is raining. Take an umbrella.', zh: '下雨了，带把伞吧。', expect: 'Take an umbrella', keywords: ['take', 'umbrella'], type: 'repeat' },
      { pet: 'It is cold. Put on your coat.', zh: '天冷了，穿上外套。', expect: 'Put on your coat', keywords: ['put', 'coat'], type: 'repeat' },
      { pet: 'I hope it will be sunny tomorrow.', zh: '我希望明天是晴天。', expect: 'I hope it will be sunny', keywords: ['hope', 'sunny', 'tomorrow'], type: 'repeat' }
    ],
    vocab: [
      { w: 'sunny', zh: '晴朗的', s: 'It is sunny today.' },
      { w: 'rain', zh: '下雨', s: 'It is raining.' },
      { w: 'umbrella', zh: '雨伞', s: 'Take an umbrella.' },
      { w: 'coat', zh: '外套', s: 'Put on your coat.' }
    ]
  },
  {
    id: 'direction1', band: '9-12', icon: '🗺️', title: '问路指路', titleEn: 'Directions',
    intro: 'Pip 在城里迷路了！学会问路和指路，帮帮它。',
    turns: [
      { pet: 'Excuse me, where is the library?', zh: '打扰一下，图书馆在哪里？', expect: 'Where is the library', keywords: ['where', 'library'], type: 'repeat' },
      { pet: 'Go straight and turn left.', zh: '直走然后左转。', expect: 'Go straight and turn left', keywords: ['straight', 'turn', 'left'], type: 'repeat' },
      { pet: 'It is next to the park.', zh: '它在公园旁边。', expect: 'It is next to the park', keywords: ['next', 'park'], type: 'repeat' },
      { pet: 'How can I get to the museum?', zh: '我怎么去博物馆？试着指路：Go straight / Turn right …', expect: 'Go straight …', keywords: ['go', 'turn', 'straight', 'right', 'left'], type: 'answer' },
      { pet: 'Thank you for your help!', zh: '谢谢你的帮助！', expect: 'You are welcome', keywords: ['welcome', 'you'], type: 'answer' }
    ],
    vocab: [
      { w: 'library', zh: '图书馆', s: 'Where is the library?' },
      { w: 'straight', zh: '直走', s: 'Go straight.' },
      { w: 'turn left', zh: '左转', s: 'Turn left.' },
      { w: 'next to', zh: '在…旁边', s: 'It is next to the park.' }
    ]
  }
];

window.PET_LINES = {
  praise3: ['Wow! Perfect!', 'Amazing! You are a star!', 'Super! I love it!'],
  praise2: ['Good job! Almost perfect!', 'Nice try! Well done!', 'Great! Keep going!'],
  praise1: ['Good try! Listen and try again!', 'You can do it! One more time!'],
  practice: ['Great! You said it loudly!', 'Well done! Keep speaking!'],
  hello: ['Hi! Ready to play?', 'Hello! Let us learn together!'],
  levelup: ['Look! I grew up! Thank you!', 'I am bigger now! You did it!']
};
