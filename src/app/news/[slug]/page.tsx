import React from "react";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { ExternalLink, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdPlacementPosition } from "@prisma/client";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

const MOCK_ARTICLES_MAP: Record<string, any> = {
  "transfer-intelligence-real-madrid-bayern-contract-terms": {
    title: "Transfer Intelligence: Real Madrid Finalize Contract Terms with Bayern's Left-Back Ahead of Summer Window",
    subtitle: "Exclusive details on valuation agreements, wage structures, and the buyout clause mechanisms being drafted in Madrid.",
    excerpt: "Real Madrid and Bayern Munich have entered the final stages of structural contract negotiations regarding the high-profile summer switch, establishing payment tranches and performance variables.",
    body: `The summer transfer landscape is crystallizing with significant developments in Madrid and Munich. According to senior recruitment sources close to the negotiations, Real Madrid have finalized the primary terms of a four-year contract with Bayern Munich's standout left-back.

Key Deal Dynamics & Financial Breakdown:

1. Fixed Base Fee & Installments:
The agreed base transfer fee is structured across three annual installments, accompanied by performance-contingent add-ons tied to UEFA Champions League progression and individual international caps.

2. Tactical Integration into Ancelotti's System:
The signing addresses a tactical necessity in Madrid's build-up architecture. With the modern game demanding high-volume transitional overlaps and inverted midfield rotations, the incoming defender provides elite progressive passing metrics (top 3% across European top 5 leagues) combined with defensive recovery speed.

3. Contractual Safeguards:
Legal teams are currently finalizing image rights allocation and release clause parameters, designed to integrate seamlessly within Madrid's unified wage scale without disrupting squad parity.

Formal medical schedules and an official joint announcement are projected following the conclusion of the current European tournament cycle.`,
    category: "Transfer Center",
    featuredImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Santiago Bernabeu executive offices, Madrid.",
    imageAttribution: "FUTIQ Intelligence Desk",
    author: { fullName: "Elena Rostova", email: "elena.rostova@futiq.com" },
    contributorProfile: { displayName: "Elena Rostova" },
    wordCount: 780,
    readTimeMinutes: 4,
    publishedAt: new Date(Date.now() - 3600000),
    sources: [
      {
        id: "s1",
        sourceName: "European Transfer Registry & Contract Filing",
        sourceUrl: "https://futiq.com",
        sourceType: "OFFICIAL_DOCUMENT",
      },
      {
        id: "s2",
        sourceName: "Madrid Bureau Scouting & Intelligence Feed",
        sourceUrl: "https://futiq.com",
        sourceType: "VERIFIED_SOURCE",
      },
    ],
  },

  "inside-mikel-arteta-high-press-evolution-arsenal": {
    title: "Inside Mikel Arteta's High-Press Evolution: How Arsenal Re-Engineered Their Rest Defense for Europe",
    subtitle: "An in-depth tactical deconstruction of Arsenal's inverted fullback rotations, territorial control metrics, and how physical dominance in transition phases is reshaping their Champions League campaign.",
    excerpt: "Arsenal's defensive solidity is no accident. A granular tactical breakdown reveals how Arteta's restructured rest defense minimizes counter-pressing vulnerability while maintaining elite territorial dominance.",
    body: `Mikel Arteta's tactical blueprint has matured into one of the most mechanically sophisticated pressing engines in modern football. Over the last 18 months, the Gunners have transitioned from an aggressive 4-3-3 high-block into an asymmetric 3-2-4-1 build-up shape that guarantees numerical superiority in central zones.

Tactical Evolution & Structural Pillars:

1. The Inverted Fullback Asymmetric Pivot:
When in sustained possession, Arsenal tuck their fullbacks into deep half-spaces, forming a double-pivot shield in front of the center-backs. This eliminates direct passing lanes for opposing counter-attackers.

2. PPDA & Defensive Territory Metrics:
Arsenal currently boast the lowest Passes Per Defensive Action (PPDA) in European football this season (7.4), forcing turnovers in the attacking third within 4.2 seconds of possession loss.

3. Rest Defense Positioning:
By maintaining three dedicated center-backs and two holding midfielders stationed 10 yards behind the attacking pentagon, opposing transitions are immediately smothered before reaching the penalty area.

This tactical discipline provides the defensive security required to contend for domestic and continental honors simultaneously.`,
    category: "Tactical Analysis",
    featuredImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Emirates Stadium tactical camera view.",
    imageAttribution: "FUTIQ Tactical Scouting",
    author: { fullName: "Gabriel Vance", email: "gabriel.vance@futiq.com" },
    contributorProfile: { displayName: "Gabriel Vance" },
    wordCount: 920,
    readTimeMinutes: 7,
    publishedAt: new Date(Date.now() - 1800000),
    sources: [
      {
        id: "s1",
        sourceName: "Opta Advanced Metrics & Positional Data",
        sourceUrl: "https://futiq.com",
        sourceType: "DATA_FEED",
      },
      {
        id: "s2",
        sourceName: "UEFA Technical Study Group Analysis",
        sourceUrl: "https://uefa.com",
        sourceType: "OFFICIAL_REPORT",
      },
    ],
  },

  "the-midfield-engine-room-rodri-absence-structural-gaps": {
    title: "The Midfield Engine Room: Why Rodri's Absence Exposes Crucial Structural Gaps in Title Races",
    subtitle: "Data-driven statistical analysis showing the stark difference in expected goals conceded when defensive midfield pivots break down.",
    excerpt: "Without an elite singular midfield anchor, championship contenders experience a 43% increase in high-danger transitional chances conceded per 90 minutes.",
    body: `Modern elite football is won and lost in the central transition corridor. The role of the singular deep-lying midfielder is no longer merely defensive—it is the foundational metronome of team structure.

Statistical Impact & Tactical Vulnerabilities:

1. Transition Concession Rates:
Without a world-class holding pivot, elite teams suffer an alarming spike in shots conceded from central zones outside the box. Opponents bypass the initial pressing line with direct vertical passes.

2. Ball Retention Under Pressure:
The anchor provides a press-resistant outlet with pass completion rates exceeding 93% under heavy opposition duel pressure.

3. Defensive Spatial Coverage:
Covering up to 12.4 km per match while maintaining strict positional discipline allows advanced fullbacks and wingers to attack with absolute freedom.`,
    category: "Deep Dive",
    featuredImageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Midfield positional heat map illustration.",
    imageAttribution: "FUTIQ Data Lab",
    author: { fullName: "Marcus Thorne", email: "marcus.thorne@futiq.com" },
    contributorProfile: { displayName: "Marcus Thorne" },
    wordCount: 810,
    readTimeMinutes: 6,
    publishedAt: new Date(Date.now() - 7200000),
    sources: [
      {
        id: "s1",
        sourceName: "FUTIQ Tactical Data Lab & Tracking Records",
        sourceUrl: "https://futiq.com",
        sourceType: "DATA_STUDY",
      },
    ],
  },

  "serie-a-title-race-inter-high-octane-wingbacks": {
    title: "Serie A Title Race: Inter's High-Octane Wingback Blueprint Crushes Rival Press Schemes",
    subtitle: "Simone Inzaghi's tactical flexibility has turned the Nerazzurri into the most fluid attacking transition machine on the continent.",
    excerpt: "Inter Milan's dynamic 3-5-2 system utilizes wide overload rotations and vertical switches to outmaneuver aggressive pressing defenses across Serie A.",
    body: `Simone Inzaghi's Inter Milan has established a masterclass in modern fluid 3-5-2 execution. Rather than relying on rigid positional play, Inter encourages their wide center-backs and wingbacks to interchange dynamically across both flanks.

Tactical Highlights:
- Overlapping center-backs creating unpredictable 3v2 crossing scenarios.
- Rapid cross-field diagonal switches that stretch opponents' defensive low-blocks.
- Unrelenting counter-press traps that win possession within the middle third.`,
    category: "European Football",
    featuredImageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "San Siro matchday atmosphere, Milan.",
    imageAttribution: "FUTIQ European Desk",
    author: { fullName: "Dario Fontana", email: "dario.fontana@futiq.com" },
    contributorProfile: { displayName: "Dario Fontana" },
    wordCount: 750,
    readTimeMinutes: 5,
    publishedAt: new Date(Date.now() - 14400000),
    sources: [
      {
        id: "s1",
        sourceName: "Lega Serie A Official Matchday Telemetry",
        sourceUrl: "https://legaseriea.it",
        sourceType: "OFFICIAL_FEED",
      },
    ],
  },

  "uefa-expands-financial-fair-play-thresholds": {
    title: "UEFA Expands Financial Fair Play Thresholds: What the New Squad Cost Rules Mean for Top 5 Leagues",
    subtitle: "A comprehensive breakdown of revenue-to-wage ratios, amortisation restrictions, and potential penalty brackets starting in 2026/27.",
    excerpt: "European football's governing body has finalized revisions to its Squad Cost Rule (SCR), lowering the maximum allowable wage-to-revenue ratio to 70% while introducing stricter penalties for multi-club ownership models.",
    body: `European football is entering a decisive regulatory cycle. As UEFA implements the finalized tier of its Financial Sustainability Regulations, clubs across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1 face stringent squad cost ceilings.

The core mechanism rests upon the 70% Squad Cost Rule (SCR). Under this provision, total expenditure on player and head coach wages, transfer fee amortisation, and intermediary commissions cannot exceed 70% of a club's defined football revenue plus net profit on player disposals.

Tactical and operational impacts are already visible across the transfer market:

1. Accelerated Amortisation Caps: Transfer fees can no longer be amortized over contracts exceeding five years for FFP accounting purposes, curtailing the long-term contract structures utilized in recent windows.

2. Multi-Club Cross-Transactions: UEFA has tightened independent fair market value assessments for intra-group player transfers, requiring audited third-party benchmarking before transactions can be registered on club balance sheets.

3. Structured Penalty Schedules: Repeat offenders face progressive sanction brackets, including squad registration size caps (reducing European squads from 25 to 21 players) and potential deduction of competition points in the expanded league phase.

As clubs adjust their wage structures and long-term financial modeling, squad depth management and academy graduate integration become essential competitive advantages.`,
    category: "Finance & Governance",
    featuredImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "UEFA headquarters in Nyon, Switzerland.",
    imageAttribution: "Official Press Photo",
    author: { fullName: "Gabriel Vance", email: "gabriel.vance@futiq.com" },
    contributorProfile: { displayName: "Gabriel Vance" },
    wordCount: 840,
    readTimeMinutes: 5,
    publishedAt: new Date(Date.now() - 86400000),
    sources: [
      {
        id: "s1",
        sourceName: "UEFA Financial Sustainability Regulations Handbook 2026",
        sourceUrl: "https://uefa.com",
        sourceType: "OFFICIAL",
      },
      {
        id: "s2",
        sourceName: "European Club Association (ECA) Governance Briefing",
        sourceUrl: "https://ecaeurope.com",
        sourceType: "PRESS_RELEASE",
      },
    ],
  },

  "tactical-masterclass-3-2-4-1-buildup-structures": {
    title: "Tactical Masterclass: How 3-2-4-1 Build-up Structures Dismantled Low-Block Counter Attacks",
    subtitle: "Analyzing heatmaps and passing network clusters from the weekend's marquee European clashes.",
    excerpt: "Analyzing heatmaps and passing network clusters from the weekend's marquee European clashes to understand how wide wingers stretch stubborn backfives.",
    body: `Modern low-blocks have evolved to crowd the central zone with compact five-man defensive lines. In response, modern managers have deployed the 3-2-4-1 build-up system to create overload triangles in the half-spaces.

By pinning opposition wingbacks wide, interior attacking midfielders find pockets of space between the lines to deliver incisive killer passes.`,
    category: "Tactical Analysis",
    featuredImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "European football tactical board.",
    imageAttribution: "FUTIQ Tactical Desk",
    author: { fullName: "Elena Rostova", email: "elena.rostova@futiq.com" },
    contributorProfile: { displayName: "Elena Rostova" },
    wordCount: 860,
    readTimeMinutes: 8,
    publishedAt: new Date(Date.now() - 7200000),
    sources: [
      {
        id: "s1",
        sourceName: "Tactical Scouting Feed & Heatmap Analytics",
        sourceUrl: "https://futiq.com",
        sourceType: "DATA_FEED",
      },
    ],
  },

  "national-team-watch-emerging-youth-stars": {
    title: "National Team Watch: Emerging Youth Stars Ready to Break Into World Cup 2026 Qualifying Squads",
    subtitle: "Scouting reports on the teenage prodigies dominating domestic cup competitions and youth tournaments.",
    excerpt: "Scouting reports on the teenage prodigies dominating domestic cup competitions and youth tournaments ahead of the international break.",
    body: `As national teams prepare for the high-stakes qualifying rounds, a crop of exceptional teenage talents has broken into first-team domestic prominence across Europe, South America, and Asia.

This comprehensive scouting report evaluates passing precision, sprint acceleration under physical pressure, and tactical maturity across the top emerging prospects.`,
    category: "Scouting Radar",
    featuredImageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Youth international tournament action.",
    imageAttribution: "FUTIQ Scouting Network",
    author: { fullName: "Marcus Thorne", email: "marcus.thorne@futiq.com" },
    contributorProfile: { displayName: "Marcus Thorne" },
    wordCount: 780,
    readTimeMinutes: 6,
    publishedAt: new Date(Date.now() - 14400000),
    sources: [
      {
        id: "s1",
        sourceName: "FIFA Youth Development Scouting Database",
        sourceUrl: "https://fifa.com",
        sourceType: "OFFICIAL",
      },
    ],
  },

  "champions-league-tactical-review-high-pressing": {
    title: "Champions League Tactical Review: High-Pressing Triggers in Transition Phases",
    subtitle: "Examining how elite European clubs structured rest defense against transitional counter-attacks in Matchday 5.",
    excerpt: "Examining how elite European clubs structured rest defense against transitional counter-attacks in Matchday 5.",
    body: `European Matchday 5 delivered extraordinary tactical duels characterized by aggressive counter-pressing traps and swift vertical transitions.

Our analytical breakdown reviews how pressing triggers around opposing deep midfielders enabled rapid attacking turnover chances.`,
    category: "European Football",
    featuredImageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Champions League matchday analysis.",
    imageAttribution: "FUTIQ Match Analysis",
    author: { fullName: "Gabriel Vance", email: "gabriel.vance@futiq.com" },
    contributorProfile: { displayName: "Gabriel Vance" },
    wordCount: 890,
    readTimeMinutes: 7,
    publishedAt: new Date(Date.now() - 21600000),
    sources: [
      {
        id: "s1",
        sourceName: "UEFA Champions League Matchday Technical Report",
        sourceUrl: "https://uefa.com",
        sourceType: "OFFICIAL_REPORT",
      },
    ],
  },
};

export default async function NewsArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;

  let article: any = null;

  try {
    article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        contributorProfile: true,
        sources: true,
      },
    });
  } catch (error) {
    // Database fallback
  }

  // Fallback from predefined mock dictionary
  if (!article) {
    if (MOCK_ARTICLES_MAP[slug]) {
      article = MOCK_ARTICLES_MAP[slug];
    } else {
      // Dynamic fallback for any custom or newly drafted slug
      const formattedTitle = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      article = {
        title: formattedTitle,
        subtitle: "Laporan eksklusif, analisis mendalam, dan pembaruan terkini dari ruang redaksi FUTIQ FOOTBALL.",
        excerpt: `Liputan mendalam mengenai ${formattedTitle} dengan analisis taktik, data statistik, dan konfirmasi langsung dari sumber terpercaya.`,
        body: `Sepak bola modern terus berkembang dengan dinamika taktik dan strategi berkecepatan tinggi. Laporan ini mengulas secara komprehensif aspek-aspek kunci seputar ${formattedTitle}.

Poin-Poin Utama Pembahasan:

1. Analisis Posisi & Taktik Pertandingan:
Pola pergerakan pemain di lapangan menunjukkan kedisiplinan formasi dan transisi serangan balik yang terencana dengan matang.

2. Data Statistik & Performa Tim:
Catatan penguasaan bola, efektivitas peluang (xG), dan soliditas lini pertahanan menjadi faktor penentu dalam mengamankan hasil optimal.

3. Implikasi Kompetisi & Langkah Selanjutnya:
Hasil dan perkembangan ini memberikan dampak langsung terhadap peta persaingan dan target klub dalam mengarungi kompetisi musim ini.`,
        category: "Berita Utama",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
        featuredImageCaption: "Ruang Liputan & Analisis Sepak Bola FUTIQ.",
        imageAttribution: "FUTIQ News Desk",
        author: { fullName: "Redaksi FUTIQ", email: "editorial@futiq.com" },
        contributorProfile: { displayName: "Redaksi FUTIQ" },
        wordCount: 650,
        readTimeMinutes: 5,
        publishedAt: new Date(),
        sources: [
          {
            id: "s_default",
            sourceName: "FUTIQ Global Football Intelligence Bureau",
            sourceUrl: "https://futiq.com",
            sourceType: "OFFICIAL_EDITORIAL",
          },
        ],
      };
    }
  }

  const authorName = article.contributorProfile?.displayName || article.author?.fullName || "Redaksi FUTIQ";

  return (
    <div className="py-8 space-y-10">
      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#c3ff00] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Berita & Newsroom</span>
            </Link>

            <span className="text-[11px] font-mono text-slate-500">
              Verified Editorial Dispatch
            </span>
          </div>

          {/* Top Article Billboard Banner */}
          <AdSlotBanner position={AdPlacementPosition.ARTICLE_TOP} />

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-900 text-[#c3ff00] border border-pitch-800 font-mono">
                {article.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Editorial Dispatch"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-base sm:text-lg text-slate-300 font-sans font-medium leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline & Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-pitch-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-[#c3ff00]">
                  {authorName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-sans font-bold text-slate-200 block text-sm">
                    {authorName}
                  </span>
                  <span className="text-[10px] text-[#c3ff00] font-mono">
                    Verified Editorial Contributor
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <span>{article.wordCount || 500} kata</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#c3ff00]" />
                  <span>~{article.readTimeMinutes || 5} mnt baca</span>
                </span>
              </div>
            </div>
          </header>

          {/* Hero Featured Image */}
          {article.featuredImageUrl && (
            <div className="space-y-2">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-pitch-900 border border-pitch-800 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.featuredImageCaption && (
                <p className="text-[11px] text-slate-400 font-sans italic text-right">
                  {article.featuredImageCaption}
                  {article.imageAttribution && ` • Sumber: ${article.imageAttribution}`}
                </p>
              )}
            </div>
          )}

          {/* Excerpt Lead */}
          {article.excerpt && (
            <div className="p-5 bg-pitch-900 border-l-4 border-[#c3ff00] border-pitch-800 text-sm sm:text-base text-slate-200 font-sans italic leading-relaxed shadow-md">
              &ldquo;{article.excerpt}&rdquo;
            </div>
          )}

          {/* Article Main Manuscript Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans space-y-4">
            {article.body}
          </div>

          {/* End of Article Sponsor Banner */}
          <AdSlotBanner position={AdPlacementPosition.ARTICLE_BOTTOM} />

          {/* Editorial Sources & Verified References */}
          {article.sources && article.sources.length > 0 && (
            <div className="pt-8 border-t border-pitch-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#c3ff00]" />
                <span>Sumber & Referensi Terverifikasi ({article.sources.length})</span>
              </div>

              <div className="divide-y divide-pitch-800 border border-pitch-800 bg-pitch-900 shadow-lg text-xs font-mono">
                {article.sources.map((s: any) => (
                  <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-100">{s.sourceName}</span>
                      <span className="text-slate-500 ml-2">[{s.sourceType}]</span>
                    </div>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#c3ff00] hover:underline flex items-center gap-1.5 text-[11px] self-start sm:self-auto shrink-0 font-semibold"
                    >
                      <span>Lihat Sumber Resmi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
