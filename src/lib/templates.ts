export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide name
  iconBg: string; // tailwind class
  iconColor: string;
  color: string; // note color id
  title: string;
  content: string;
  tag: string;
}

export const TEMPLATES: NoteTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Capture agenda, decisions and action items',
    icon: 'Users',
    iconBg: 'bg-note-sky',
    iconColor: 'text-tag-ideas',
    color: 'sky',
    title: 'Meeting Notes',
    content: 'Date:\nAttendees:\n\nAgenda:\n• \n• \n\nDecisions:\n• \n\nAction Items:\n• ',
    tag: 'work',
  },
  {
    id: 'grocery',
    name: 'Grocery List',
    description: 'Plan your weekly shopping',
    icon: 'ShoppingCart',
    iconBg: 'bg-note-mint',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    color: 'mint',
    title: 'Grocery List',
    content: '🥦 Vegetables:\n• \n\n🍎 Fruits:\n• \n\n🥩 Protein:\n• \n\n🥛 Dairy:\n• ',
    tag: 'personal',
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    description: 'Reflect on your day',
    icon: 'BookOpen',
    iconBg: 'bg-note-lavender',
    iconColor: 'text-primary',
    color: 'lavender',
    title: 'Daily Journal',
    content: `Date: ${new Date().toLocaleDateString()}\n\n😊 Today I felt:\n\n✨ Highlight of the day:\n\n📚 What I learned:\n\n🎯 Tomorrow's focus:`,
    tag: 'personal',
  },
  {
    id: 'project',
    name: 'Project Plan',
    description: 'Outline goals and milestones',
    icon: 'Rocket',
    iconBg: 'bg-note-peach',
    iconColor: 'text-orange-600 dark:text-orange-300',
    color: 'peach',
    title: 'Project Plan',
    content: 'Project:\nOwner:\nDeadline:\n\n🎯 Goal:\n\n📋 Milestones:\n1. \n2. \n3. \n\n⚠️ Risks:\n• ',
    tag: 'work',
  },
  {
    id: 'study',
    name: 'Study Notes',
    description: 'Organize what you learn',
    icon: 'GraduationCap',
    iconBg: 'bg-note-coral',
    iconColor: 'text-rose-600 dark:text-rose-300',
    color: 'coral',
    title: 'Study Notes',
    content: 'Topic:\nSource:\n\n🔑 Key Concepts:\n• \n\n📝 Summary:\n\n❓ Questions:\n• ',
    tag: 'ideas',
  },
  {
    id: 'ideas',
    name: 'Idea Dump',
    description: 'Capture your brilliance',
    icon: 'Lightbulb',
    iconBg: 'bg-note-yellow',
    iconColor: 'text-amber-600 dark:text-amber-300',
    color: 'yellow',
    title: 'New Idea',
    content: '💡 Idea:\n\nWhy it matters:\n\nNext steps:\n• ',
    tag: 'ideas',
  },
];
