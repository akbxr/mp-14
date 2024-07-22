export interface Event {
  id: number;
  title: string;
  organizer: string;
  date: string;
  category: string;
  price: string;
  image: string;
}

export const events: Event[] = [
  {
    id: 1,
    title: 'NextJs',
    organizer: 'Yusuf Chatab',
    date: 'Tue, Dec 19, 6:48 PM',
    category: 'Next.js',
    price: 'FREE',
    image: '/images/js-mastery.jpg',
  },
  {
    id: 2,
    title: 'GitHub 2024',
    organizer: 'Yusuf Chatab',
    date: 'Thu, Dec 19, 11:25 AM',
    category: 'Next.js',
    price: '$999',
    image: '/images/github-universe.jpg',
  },
  {
    id: 3,
    title: 'React Conference 2024',
    organizer: 'React Team',
    date: 'Sat, Jan 15, 9:00 AM',
    category: 'React',
    price: '$599',
    image: '/images/react-conf.jpg',
  },
  {
    id: 4,
    title: 'Vue.js Workshop',
    organizer: 'Vue Masters',
    date: 'Wed, Feb 1, 2:00 PM',
    category: 'Vue.js',
    price: '$299',
    image: '/images/vue-workshop.jpg',
  },
  {
    id: 5,
    title: 'Angular Deep Dive',
    organizer: 'ng-conf',
    date: 'Mon, Mar 10, 10:00 AM',
    category: 'Angular',
    price: '$499',
    image: '/images/angular-dive.jpg',
  },
  {
    id: 6,
    title: 'TypeScript Mastery',
    organizer: 'TS Guru',
    date: 'Fri, Apr 5, 1:00 PM',
    category: 'TypeScript',
    price: '$399',
    image: '/images/ts-mastery.jpg',
  },
  {
    id: 7,
    title: 'NextJs',
    organizer: 'Yusuf Chatab',
    date: 'Tue, Dec 19, 6:48 PM',
    category: 'Next.js',
    price: 'FREE',
    image: '/images/js-mastery.jpg',
  },
  {
    id: 8,
    title: 'NextJs',
    organizer: 'Yusuf Chatab',
    date: 'Tue, Dec 19, 6:48 PM',
    category: 'Next.js',
    price: 'FREE',
    image: '/images/js-mastery.jpg',
  },
];
