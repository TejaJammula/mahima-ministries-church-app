// Testimonies + prayer requests sample data.
// Real app: user submissions go Pending -> admin review -> Approved/Published.
// This file is the mock feed the UI renders until the backend exists.
export type TestimonyStatus = "pending" | "approved" | "published";

export interface Testimony {
  id: string;
  title: string;
  text: string;
  name: string; // or "Anonymous"
  category: string;
  verse?: string;
  prayerCount: number;
  status: TestimonyStatus;
  date: string;
}

export const TESTIMONY_CATEGORIES = [
  "All",
  "Answered Prayer",
  "Healing",
  "Family",
  "Salvation",
  "Work",
  "Other",
];

export const FEATURED_TESTIMONY: Testimony = {
  id: "t-featured",
  title: "Healed after years of pain",
  text: "For seven years I suffered with back pain and could barely walk to church. During the fasting prayers in January, our pastor prayed for the sick, and I felt warmth spread through my back. The next morning I woke up without pain for the first time in years. The doctors confirmed it. To God be the glory!",
  name: "Anonymous",
  category: "Healing",
  verse: "Jeremiah 30:17",
  prayerCount: 214,
  status: "published",
  date: "This week",
};

export const TESTIMONIES: Testimony[] = [
  FEATURED_TESTIMONY,
  {
    id: "t-2",
    title: "A job after months of waiting",
    text: "I lost my job last year and prayed every night with my family. In March I received an offer letter for a better position than before. God opened a door no man could shut.",
    name: "Ramesh",
    category: "Work",
    prayerCount: 96,
    status: "published",
    date: "2 weeks ago",
  },
  {
    id: "t-3",
    title: "My son returned home",
    text: "My son had left home and we had no contact for two years. The church prayed with us every Sunday. Last month he walked through our door. Our family is whole again.",
    name: "Lakshmi",
    category: "Family",
    verse: "Luke 15:20",
    prayerCount: 158,
    status: "published",
    date: "1 month ago",
  },
  {
    id: "t-4",
    title: "Baptized on Easter",
    text: "I grew up far from God, but through this church I found faith. I was baptized this Easter and my life has never been the same.",
    name: "Anonymous",
    category: "Salvation",
    prayerCount: 73,
    status: "published",
    date: "2 months ago",
  },
];

export interface PrayerRequest {
  id: string;
  text: string;
  name: string;
  prayerCount: number;
  answered: boolean;
  date: string;
}

export const PRAYER_REQUESTS: PrayerRequest[] = [
  {
    id: "p-1",
    text: "Please pray for my mother's surgery next week. We trust God for a safe operation and quick recovery.",
    name: "Anonymous",
    prayerCount: 45,
    answered: false,
    date: "2 days ago",
  },
  {
    id: "p-2",
    text: "Praying for my daughter's exams and for peace in our home during this season.",
    name: "Prathiba",
    prayerCount: 32,
    answered: false,
    date: "4 days ago",
  },
  {
    id: "p-3",
    text: "My father's health was failing, but after your prayers he is home from the hospital. Praise God — marking this answered!",
    name: "Suresh",
    prayerCount: 121,
    answered: true,
    date: "1 week ago",
  },
];
