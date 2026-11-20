/**
 * Approved community posts only. Add a row by editing this file after a person
 * reviews a submission. Never seed this list with example questions or tips.
 */

export type CommunityPost = {
  id: string;
  kind: "question" | "tip";
  title: string;
  body: string;
  area?: string;
  attribution?: string;
  published: string;
};

export const COMMUNITY_CHECKED = "2026-11-19";

export const COMMUNITY_POSTS: readonly CommunityPost[] = [];

export function hasCommunityPosts(posts: readonly CommunityPost[] = COMMUNITY_POSTS): boolean {
  return posts.length > 0;
}
