import { useVersionContent } from '@site/src/utils/contentLoader';

export const bookMetadata = {
  id: 'god-is-real',
  title: "God is Real: Here's the Proof",
  description: "A logical proof of God's existence.",
  author: "Zakery Kline",
  coverImage: "/img/GodIsRealCover.png",
  versions: [
    {
      version: "1.0.1",
      date: "2024-11-22",
      path: "/docs/god-is-real/v1.0.1",
      changes: [
        "Title Update",
        "Removed unused links"
      ],
      async getContent() {
        return await useVersionContent("1.0.1", "god-is-real");
      }
    },
    {
      version: "1.0.0",
      date: "2024-11-21",
      path: "/docs/god-is-real/v1.0.0",
      changes: [
        "Initial release"
      ],
      async getContent() {
        return await useVersionContent("1.0.0", "god-is-real");
      }
    }
  ]
}; 