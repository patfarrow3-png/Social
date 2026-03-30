/**
 * Deterministic mock news articles for the social media / digital marketing niche.
 *
 * Used when RSS feeds cannot be fetched (no network, no credentials, or dev mode).
 * Articles are seeded so the list appears stable across page reloads.
 */

import { subHours, subDays, formatISO } from "date-fns";
import type { NewsArticle, NewsFeedSource } from "@/types/news";

// ─── Feed catalogue ───────────────────────────────────────────────────────────
// These are the real RSS endpoints the production fetcher will call.
// Add ENABLE_RSS=true to .env.local to activate live fetching.

export const RSS_SOURCES: NewsFeedSource[] = [
  { name: "Social Media Today",   url: "https://www.socialmediatoday.com/rss.xml",           siteUrl: "https://www.socialmediatoday.com",  topic: "platforms" },
  { name: "Marketing Land",       url: "https://martech.org/feed/",                          siteUrl: "https://martech.org",               topic: "tools"     },
  { name: "Buffer Blog",          url: "https://buffer.com/resources/rss/",                  siteUrl: "https://buffer.com/resources",       topic: "tools"     },
  { name: "Sprout Social",        url: "https://sproutsocial.com/insights/feed/",             siteUrl: "https://sproutsocial.com/insights",  topic: "research"  },
  { name: "Later Blog",           url: "https://later.com/blog/feed/",                       siteUrl: "https://later.com/blog",             topic: "tools"     },
  { name: "HubSpot Blog",         url: "https://blog.hubspot.com/marketing/rss.xml",          siteUrl: "https://blog.hubspot.com/marketing", topic: "business"  },
  { name: "Content Marketing Inst.", url: "https://contentmarketinginstitute.com/feed/",      siteUrl: "https://contentmarketinginstitute.com", topic: "research" },
  { name: "Hootsuite Blog",       url: "https://blog.hootsuite.com/feed/",                   siteUrl: "https://blog.hootsuite.com",         topic: "platforms" },
  { name: "Digiday",              url: "https://digiday.com/feed/",                          siteUrl: "https://digiday.com",                topic: "business"  },
  { name: "TechCrunch Social",    url: "https://techcrunch.com/tag/social-media/feed/",       siteUrl: "https://techcrunch.com",             topic: "business"  },
];

// ─── Mock articles ─────────────────────────────────────────────────────────────

const REF = new Date("2026-03-30T09:00:00Z");

const RAW: Omit<NewsArticle, "id">[] = [
  // Tools
  {
    title:       "Meta Rolls Out AI-Powered Caption Generator for Business Accounts",
    summary:     "Meta's latest update introduces an on-platform AI tool that drafts captions, suggests hashtags, and recommends posting times based on historical performance data — available to Pages with over 1,000 followers.",
    url:         "https://www.socialmediatoday.com/news/meta-ai-caption-generator",
    source:      "Social Media Today",
    sourceUrl:   "https://www.socialmediatoday.com",
    publishedAt: formatISO(subHours(REF, 1)),
    topic:       "tools",
  },
  {
    title:       "Buffer Launches 'Ideas Hub': A Brainstorming Space Inside Your Content Calendar",
    summary:     "Buffer has shipped a new Ideas Hub feature that lets teams capture post concepts, attach reference images, and convert ideas directly into scheduled drafts — aimed at reducing the gap between inspiration and publishing.",
    url:         "https://buffer.com/resources/ideas-hub-launch",
    source:      "Buffer Blog",
    sourceUrl:   "https://buffer.com/resources",
    publishedAt: formatISO(subHours(REF, 3)),
    topic:       "tools",
  },
  {
    title:       "Hootsuite vs. Sprout Social 2026: Which Scheduler Wins for Agencies?",
    summary:     "An independent head-to-head comparing pricing, workflow automation, analytics depth, and team collaboration features across both platforms — with a scoring matrix for agencies managing 10+ client accounts.",
    url:         "https://blog.hootsuite.com/hootsuite-vs-sprout-2026",
    source:      "Hootsuite Blog",
    sourceUrl:   "https://blog.hootsuite.com",
    publishedAt: formatISO(subHours(REF, 6)),
    topic:       "tools",
  },
  {
    title:       "Canva Introduces Brand Voice in Magic Write — AI That Speaks Your Tone",
    summary:     "Canva's Magic Write now ingests a sample of your existing copy and outputs captions, ad text, and blog excerpts in your brand's voice. The feature is rolling out to Teams subscribers throughout April.",
    url:         "https://martech.org/canva-brand-voice-magic-write",
    source:      "Marketing Land",
    sourceUrl:   "https://martech.org",
    publishedAt: formatISO(subHours(REF, 9)),
    topic:       "tools",
  },
  {
    title:       "Later Adds TikTok Auto-Publishing — No More Manual Reminders",
    summary:     "Later became one of the first third-party tools to support true TikTok auto-publishing via the new Content Posting API, eliminating the push-notification workaround that has frustrated creators for years.",
    url:         "https://later.com/blog/tiktok-auto-publishing",
    source:      "Later Blog",
    sourceUrl:   "https://later.com/blog",
    publishedAt: formatISO(subHours(REF, 14)),
    topic:       "tools",
  },
  // Research
  {
    title:       "2026 Social Media Engagement Report: Carousels Still Outperform Reels on Instagram",
    summary:     "Sprout Social analyzed 1.2M posts across 50,000 accounts and found carousel posts generate 2.4× more saves and 18% higher reach than Reels, contradicting the widely-held belief that short-form video dominates all metrics.",
    url:         "https://sproutsocial.com/insights/social-media-engagement-report-2026",
    source:      "Sprout Social",
    sourceUrl:   "https://sproutsocial.com/insights",
    publishedAt: formatISO(subHours(REF, 2)),
    topic:       "research",
  },
  {
    title:       "The State of Creator Economy 2026: 200M+ Professionals Now Call Themselves Creators",
    summary:     "A joint study by SignalFire and Adobe found that the global creator economy has crossed 200 million participants, with full-time creators reporting median annual income of $67K — up 34% versus 2024.",
    url:         "https://contentmarketinginstitute.com/research/creator-economy-2026",
    source:      "Content Marketing Inst.",
    sourceUrl:   "https://contentmarketinginstitute.com",
    publishedAt: formatISO(subHours(REF, 5)),
    topic:       "research",
  },
  {
    title:       "B2B LinkedIn Benchmark Report: Video Posts Drive 5× More Comments Than Text",
    summary:     "LinkedIn's own data science team released benchmarks showing native video on company pages averages 5× the comment rate of text posts, with thought-leadership pieces peaking on Tuesday and Wednesday mornings.",
    url:         "https://blog.hubspot.com/marketing/linkedin-video-benchmark-2026",
    source:      "HubSpot Blog",
    sourceUrl:   "https://blog.hubspot.com/marketing",
    publishedAt: formatISO(subHours(REF, 11)),
    topic:       "research",
  },
  {
    title:       "Audience Trust Index 2026: UGC Still Outranks Brand Content 3-to-1",
    summary:     "Nielsen's annual Audience Trust survey shows user-generated content remains the most credible form of brand endorsement, with 82% of 18-34 year-olds saying peer reviews influence purchase decisions more than official ads.",
    url:         "https://contentmarketinginstitute.com/research/ugc-trust-index-2026",
    source:      "Content Marketing Inst.",
    sourceUrl:   "https://contentmarketinginstitute.com",
    publishedAt: formatISO(subDays(REF, 1)),
    topic:       "research",
  },
  // Business
  {
    title:       "TikTok's US Ad Revenue Hit $14B in 2025, Defying Regulatory Headwinds",
    summary:     "Despite ongoing legislative scrutiny, TikTok's US advertising business grew 41% YoY to reach $14 billion in 2025 according to eMarketer — surpassing Snapchat and Pinterest combined and closing in on YouTube.",
    url:         "https://digiday.com/media/tiktok-us-ad-revenue-2025",
    source:      "Digiday",
    sourceUrl:   "https://digiday.com",
    publishedAt: formatISO(subHours(REF, 4)),
    topic:       "business",
  },
  {
    title:       "Publicis Acquires Influencer Platform IZEA for $340M",
    summary:     "Holding group Publicis Groupe announced the acquisition of creator marketing platform IZEA Worldwide, signaling further consolidation in the influencer industry as agencies race to own creator-economy infrastructure.",
    url:         "https://digiday.com/agency/publicis-acquires-izea",
    source:      "Digiday",
    sourceUrl:   "https://digiday.com",
    publishedAt: formatISO(subHours(REF, 7)),
    topic:       "business",
  },
  {
    title:       "How Duolingo Grew to 50M TikTok Followers Without Paying for Ads",
    summary:     "A case study breakdown of Duolingo's organic TikTok strategy: how a small in-house team built the most-followed brand account through absurdist humor, trend-jacking, and a mascot persona that resonates with Gen Z.",
    url:         "https://blog.hubspot.com/marketing/duolingo-tiktok-strategy",
    source:      "HubSpot Blog",
    sourceUrl:   "https://blog.hubspot.com/marketing",
    publishedAt: formatISO(subHours(REF, 10)),
    topic:       "business",
  },
  {
    title:       "Instagram's Creator Marketplace Expands to 45 New Countries",
    summary:     "Meta confirmed that Instagram's Creator Marketplace — which connects brands with influencers for paid collaborations — is expanding to 45 additional countries, giving brands access to 8M+ eligible creator profiles.",
    url:         "https://techcrunch.com/2026/03/instagram-creator-marketplace-expansion",
    source:      "TechCrunch Social",
    sourceUrl:   "https://techcrunch.com",
    publishedAt: formatISO(subDays(REF, 1)),
    topic:       "business",
  },
  // Platforms
  {
    title:       "YouTube Tests 'Hype' Button — A New Way to Boost Videos Beyond Your Subscribers",
    summary:     "YouTube is expanding its Hype feature globally after a successful pilot in select markets. The feature lets viewers spend earned 'hype credits' to boost non-subscribed creators, giving smaller channels a path to viral discovery.",
    url:         "https://www.socialmediatoday.com/news/youtube-hype-global-expansion",
    source:      "Social Media Today",
    sourceUrl:   "https://www.socialmediatoday.com",
    publishedAt: formatISO(subHours(REF, 2)),
    topic:       "platforms",
  },
  {
    title:       "Instagram Changes Algorithm: Reach Now Weighted by 'Send Rate', Not Just Saves",
    summary:     "Instagram chief Adam Mosseri confirmed the ranking signal update in a Threads post, saying shares to DMs (send rate) are now the top factor for Explore and Reels reach — overtaking saves and comments for the first time.",
    url:         "https://www.socialmediatoday.com/news/instagram-algorithm-send-rate",
    source:      "Social Media Today",
    sourceUrl:   "https://www.socialmediatoday.com",
    publishedAt: formatISO(subHours(REF, 8)),
    topic:       "platforms",
  },
  {
    title:       "LinkedIn Launches 'Thought Leader Ads' — Boosted Posts From Employee Profiles",
    summary:     "LinkedIn's new ad format lets companies amplify individual employee posts rather than company page posts, capitalizing on the higher engagement rates personal accounts typically achieve for B2B content.",
    url:         "https://www.socialmediatoday.com/news/linkedin-thought-leader-ads",
    source:      "Social Media Today",
    sourceUrl:   "https://www.socialmediatoday.com",
    publishedAt: formatISO(subDays(REF, 1)),
    topic:       "platforms",
  },
  {
    title:       "X (Twitter) Launches 'Articles' Feature — Long-Form Publishing for Premium Users",
    summary:     "X has begun rolling out a native long-form publishing tool for Premium subscribers, letting users write full articles with rich text formatting, images, and headers — positioning the platform as a direct Substack competitor.",
    url:         "https://techcrunch.com/2026/03/x-articles-launch",
    source:      "TechCrunch Social",
    sourceUrl:   "https://techcrunch.com",
    publishedAt: formatISO(subDays(REF, 1)),
    topic:       "platforms",
  },
  // Trends
  {
    title:       "The Rise of 'De-influencing': Why Authenticity Is Reshaping Creator Content",
    summary:     "A growing wave of creators is building audiences by actively discouraging purchases and calling out overhyped products. Brands that understand the de-influencing trend are rewriting their influencer briefs to emphasize honest reviews.",
    url:         "https://blog.hootsuite.com/de-influencing-trend",
    source:      "Hootsuite Blog",
    sourceUrl:   "https://blog.hootsuite.com",
    publishedAt: formatISO(subHours(REF, 3)),
    topic:       "trends",
  },
  {
    title:       "Silent Reels Are Here: Why More Creators Are Posting Without Music or Voiceover",
    summary:     "A counterintuitive content trend is emerging on Instagram and TikTok: 'silent content' that relies on on-screen text and visual storytelling alone. Engagement data suggests these posts perform well in noisy feed environments.",
    url:         "https://buffer.com/resources/silent-reels-trend",
    source:      "Buffer Blog",
    sourceUrl:   "https://buffer.com/resources",
    publishedAt: formatISO(subHours(REF, 6)),
    topic:       "trends",
  },
  {
    title:       "How 'Micro-Niche' Communities Are Outperforming Mass-Market Accounts in 2026",
    summary:     "Accounts with fewer than 10,000 followers in hyper-specific niches (sourdough fermentation, 1970s road cycling, brutalist architecture) are achieving engagement rates of 8-15% — far above the 1-3% average for large accounts.",
    url:         "https://contentmarketinginstitute.com/trends/micro-niche-communities",
    source:      "Content Marketing Inst.",
    sourceUrl:   "https://contentmarketinginstitute.com",
    publishedAt: formatISO(subDays(REF, 1)),
    topic:       "trends",
  },
];

export const MOCK_ARTICLES: NewsArticle[] = RAW.map((a, i) => ({
  ...a,
  id: `mock-${i}`,
}));
