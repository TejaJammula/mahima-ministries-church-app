// Gallery data: year -> events -> photos.
// Bundled sample photos demonstrate the structure. In production this is
// server-driven: the app fetches the year/event/photo manifest from the
// Telegram CDN feed and caches it — new albums appear without a rebuild.
import { ImageSourcePropType } from "react-native";

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  cover: ImageSourcePropType;
  photos: ImageSourcePropType[];
}

export interface GalleryYear {
  year: string;
  events: GalleryEvent[];
}

const p = (n: string) => {
  switch (n) {
    case "photo_01.jpg": return require("../../assets/photos/photo_01.jpg");
    case "photo_02.jpg": return require("../../assets/photos/photo_02.jpg");
    case "photo_03.jpg": return require("../../assets/photos/photo_03.jpg");
    case "photo_04.jpg": return require("../../assets/photos/photo_04.jpg");
    case "photo_05.jpg": return require("../../assets/photos/photo_05.jpg");
    case "photo_06.jpg": return require("../../assets/photos/photo_06.jpg");
    case "photo_07.jpg": return require("../../assets/photos/photo_07.jpg");
    case "photo_08.jpg": return require("../../assets/photos/photo_08.jpg");
    case "photo_09.jpg": return require("../../assets/photos/photo_09.jpg");
    case "photo_10.jpg": return require("../../assets/photos/photo_10.jpg");
    case "photo_11.jpg": return require("../../assets/photos/photo_11.jpg");
    case "photo_12.jpg": return require("../../assets/photos/photo_12.jpg");
    case "photo_13.jpg": return require("../../assets/photos/photo_13.jpg");
    default: return require("../../assets/photos/photo_14.jpg");
  }
};

export const GALLERY_YEARS: GalleryYear[] = [
  {
    year: "2023",
    events: [
      {
        id: "2023-anniversary",
        title: "Church Anniversary",
        date: "Sep 2023",
        cover: p("photo_01.jpg"),
        photos: [p("photo_01.jpg"), p("photo_02.jpg"), p("photo_03.jpg"), p("photo_04.jpg"), p("photo_05.jpg")],
      },
      {
        id: "2023-christmas",
        title: "Christmas Service",
        date: "Dec 2023",
        cover: p("photo_06.jpg"),
        photos: [p("photo_06.jpg"), p("photo_07.jpg"), p("photo_08.jpg")],
      },
    ],
  },
  {
    year: "2022",
    events: [
      {
        id: "2022-baptism",
        title: "Baptism Service",
        date: "Apr 2022",
        cover: p("photo_09.jpg"),
        photos: [p("photo_09.jpg"), p("photo_10.jpg"), p("photo_11.jpg")],
      },
    ],
  },
  {
    year: "2021",
    events: [
      {
        id: "2021-gathering",
        title: "Church Gathering",
        date: "Jun 2021",
        cover: p("photo_12.jpg"),
        photos: [p("photo_12.jpg"), p("photo_13.jpg"), p("photo_14.jpg")],
      },
    ],
  },
];

export const MEMORIES_STRIP = [
  p("photo_01.jpg"),
  p("photo_06.jpg"),
  p("photo_09.jpg"),
  p("photo_12.jpg"),
];
