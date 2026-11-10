// RYMEC AI & Intelligent Routing Service
// Features: Keyword/NLP triage, sentiment & priority detection, duplicate detection,
// trend/pattern detection, and predictive resolution calculation.

const CATEGORY_KEYWORDS = {
  hostel: [
    'hostel', 'room', 'mess', 'food', 'water', 'cooler', 'geyser', 'hygiene', 'warden',
    'bed', 'washroom', 'toilet', 'bathroom', 'electricity', 'power cut', 'wifi', 'wi-fi',
    'fan', 'cleaning', 'ro water', 'hot water', 'drainage', 'cot', 'almirah', 'block a', 'block b'
  ],
  academic: [
    'exam', 'examination', 'marks', 'internals', 'professor', 'lecturer', 'faculty',
    'attendance', 'syllabus', 'class', 'lecture', 'lab', 'experiment', 'assignment',
    'evaluation', 'viva', 'credits', 'revaluation', 'timetable', 'hall ticket', 'vtu'
  ],
  harassment: [
    'ragging', 'harass', 'harassment', 'bully', 'bullying', 'threat', 'threaten', 'abuse',
    'stalking', 'unsafe', 'touch', 'molestation', 'discrimination', 'caste', 'gender',
    'mental agony', 'misbehavior', 'verbal abuse', 'physical', 'assault', 'eve teasing'
  ],
  admin: [
    'fee', 'fees', 'challan', 'receipt', 'scholarship', 'ssp', 'nsp', 'id card', 'bus',
    'transport', 'route', 'bonafide', 'certificate', 'transcript', 'admission', 'refund',
    'counter', 'office delay', 'clerk', 'documents', 'study certificate'
  ],
  other: [
    'sports', 'gym', 'ground', 'library', 'books', 'canteen', 'parking', 'cycle', 'bike',
    'medical', 'first aid', 'ambulance', 'mentor', 'personal', 'counseling', 'drinking water', 'green campus'
  ]
};

const URGENT_KEYWORDS = [
  'ragging', 'harass', 'harassment', 'assault', 'abuse', 'emergency', 'threat',
  'safety', 'suicide', 'police', 'hospital', 'poisoning', 'food poisoning', 'fire',
  'live wire', 'electric shock', 'bleeding', 'stalking', 'violence'
];

const HIGH_PRIORITY_KEYWORDS = [
  'exam tomorrow', 'hall ticket missing', 'marks error', 'attendance short', 'medical emergency',
  'contaminated water', 'power outage', 'no water for days', 'wifi down during submission',
  'urgent fee deadline', 'scholarship deadline'
];

// 1. Auto-categorization using weighted TF scoring
function autoCategorize(text = '') {
  const content = text.toLowerCase();
  const scores = { hostel: 0, academic: 0, harassment: 0, admin: 0, other: 0 };

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (content.includes(kw)) {
        // High severity categories receive slight weighting for student protection
        const weight = (cat === 'harassment') ? 3 : 1;
        scores[cat] += weight;
      }
    }
  }

  let topCategory = 'other';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topCategory = cat;
    }
  }

  return {
    category: topCategory,
    confidence: maxScore > 0 ? Math.min(0.95, 0.4 + maxScore * 0.15) : 0.5,
    scores
  };
}

// 2. Priority & Sentiment Detection
function detectPriority(text = '') {
  const content = text.toLowerCase();

  for (const kw of URGENT_KEYWORDS) {
    if (content.includes(kw)) {
      return {
        priority: 'urgent',
        reason: `Urgent trigger keyword detected: "${kw}" - escalated for immediate intervention.`,
        slaHours: 24
      };
    }
  }

  for (const kw of HIGH_PRIORITY_KEYWORDS) {
    if (content.includes(kw)) {
      return {
        priority: 'high',
        reason: `High priority deadline/condition detected: "${kw}".`,
        slaHours: 72
      };
    }
  }

  return {
    priority: 'normal',
    reason: 'Standard institutional grievance workflow (7-day resolution window).',
    slaHours: 168
  };
}

// 3. Compute SLA Deadline Date
function calculateSlaDeadline(priority = 'normal') {
  const now = new Date();
  if (priority === 'urgent') {
    now.setHours(now.getHours() + 24); // 1 day
  } else if (priority === 'high') {
    now.setHours(now.getHours() + 72); // 3 days
  } else {
    now.setHours(now.getHours() + 168); // 7 days
  }
  return now;
}

// 4. Duplicate Detection (Jaccard similarity on keyword tokens)
function detectDuplicates(newText, category, existingComplaints = []) {
  if (!existingComplaints || existingComplaints.length === 0) return null;

  const tokenize = str => new Set(
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const newWords = tokenize(newText);
  if (newWords.size === 0) return null;

  const matches = [];

  for (const item of existingComplaints) {
    // Only compare complaints filed within last 14 days in same category
    if (item.category !== category) continue;
    const diffDays = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 3600 * 24);
    if (diffDays > 14) continue;

    const existingWords = tokenize(item.title + ' ' + item.description);
    if (existingWords.size === 0) continue;

    let intersectionCount = 0;
    for (const w of newWords) {
      if (existingWords.has(w)) intersectionCount++;
    }

    const unionCount = new Set([...newWords, ...existingWords]).size;
    const similarity = intersectionCount / (unionCount || 1);

    if (similarity >= 0.35) {
      matches.push({
        complaintNumber: item.complaint_number,
        title: item.title,
        status: item.status,
        similarity: Math.round(similarity * 100),
        id: item.id
      });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches[0];
  }
  return null;
}

// 5. Systemic Trend Detection (5+ complaints in 7 days about the same issue)
function detectTrends(complaints = []) {
  const sevenDaysAgo = Date.now() - (7 * 24 * 3600 * 1000);
  const recent = complaints.filter(c => new Date(c.created_at).getTime() >= sevenDaysAgo);

  const categoryGroups = {};
  for (const c of recent) {
    categoryGroups[c.category] = categoryGroups[c.category] || [];
    categoryGroups[c.category].push(c);
  }

  const trends = [];
  for (const [cat, items] of Object.entries(categoryGroups)) {
    if (items.length >= 3) {
      // Find prominent repeated keywords
      const wordCounts = {};
      items.forEach(it => {
        const words = (it.title + ' ' + it.description).toLowerCase().split(/\W+/).filter(w => w.length > 4);
        words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
      });

      const topKeywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, count]) => `${k} (${count}x)`)
        .join(', ');

      trends.push({
        category: cat,
        count: items.length,
        keywords: topKeywords,
        severity: items.length >= 5 ? 'critical' : 'warning',
        message: `${items.length} complaints recorded under "${cat.toUpperCase()}" this week. Prominent topics: ${topKeywords}. Recommended: Root-cause institutional inspection.`
      });
    }
  }

  return trends;
}

// 6. Predictive Resolution Time Estimate
function predictResolutionTime(category, priority) {
  const baselines = {
    hostel: 3.2,
    academic: 4.1,
    harassment: 1.2,
    admin: 4.8,
    other: 3.5
  };

  let base = baselines[category] || 3.5;
  if (priority === 'urgent') base = Math.min(base, 1.2);
  else if (priority === 'high') base = Math.min(base, 2.5);

  const roundedDays = Math.round(base * 10) / 10;
  return {
    estimatedDays: roundedDays,
    displayText: `~${roundedDays} business days based on historical resolution rate for ${category} grievances`
  };
}

module.exports = {
  autoCategorize,
  detectPriority,
  calculateSlaDeadline,
  detectDuplicates,
  detectTrends,
  predictResolutionTime
};
