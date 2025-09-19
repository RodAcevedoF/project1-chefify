export const mediaEntityConfig = {
  user: {
    folder: "user-profiles",
    type: "user",
  },
  recipe: {
    folder: "recipe-images",
    type: "recipe",
  },
} as const;

export type MediaEntityType = keyof typeof mediaEntityConfig;
