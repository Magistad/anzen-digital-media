"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* -----------------------------------------------------------------
   generateBlogs.ts
   • Runs at every Netlify build (prebuild script)
   • Mirrors each Affiliate Card into /content/blog as a GPT-generated post
   ----------------------------------------------------------------- */
const fs_1 = require("fs");
const path_1 = require("path");
const gray_matter_1 = require("gray-matter");
const openai_1 = require("openai");
const openai = new openai_1.default(); // uses process.env.OPENAI_API_KEY
const AFFIL_DIR = path_1.default.join(process.cwd(), 'content', 'affiliates');
const BLOG_DIR = path_1.default.join(process.cwd(), 'content', 'blog');
if (!fs_1.default.existsSync(BLOG_DIR))
    fs_1.default.mkdirSync(BLOG_DIR, { recursive: true });
async function createPost(slug, data) {
    // 1. Build the prompt
    const prompt = `
Write a concise, engaging 300-word blog post introducing the AI tool **${data.title}**.
Include:
• An introductory paragraph
• 3–4 bullet-point features
• A concluding call-to-action linking to ${data.url}
Use a friendly, helpful tone.
`;
    // 2. Ask GPT (use a reasonably priced model)
    const chat = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
    });
    const body = chat.choices[0].message.content || '';
    // 3. Build and save the Markdown
    const md = `---
title: "${data.title}"
date: "${new Date().toISOString()}"
tags: ["${data.category}"]
affiliate: "${data.url}"
logo: "${data.logo}"
---

![${data.title}](${data.logo})

${body}
`;
    fs_1.default.writeFileSync(path_1.default.join(BLOG_DIR, `${slug}.md`), md);
    console.log(`✓ Auto-generated blog for ${slug}`);
}
async function main() {
    const files = fs_1.default.readdirSync(AFFIL_DIR).filter((f) => f.endsWith('.md'));
    for (const file of files) {
        const slug = file.replace(/\.md$/, '');
        const blogPath = path_1.default.join(BLOG_DIR, `${slug}.md`);
        if (fs_1.default.existsSync(blogPath))
            continue; // already has a post
        const { data } = gray_matter_1.default.read(path_1.default.join(AFFIL_DIR, file));
        await createPost(slug, data);
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
