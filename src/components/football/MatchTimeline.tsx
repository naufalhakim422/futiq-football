"use client";

import React from "react";
import { ProviderMatchEvent, EventType, MatchStatus } from "@/lib/football/types";
import {
  Activity,
  ArrowRightLeft,
  Tv,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "./PlayerAvatar";

interface MatchTimelineProps {
  events: ProviderMatchEvent[];
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: string;
  awayTeamId: string;
  status: MatchStatus;
  minute?: number;
  htHomeScore?: number;
  htAwayScore?: number;
  homeScore: number;
  awayScore: number;
  etHomeScore?: number;
  etAwayScore?: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
}

export function MatchTimeline({
  events,
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  status,
  minute,
  htHomeScore,
  htAwayScore,
  homeScore,
  awayScore,
  etHomeScore,
  etAwayScore,
  penaltyHomeScore,
  penaltyAwayScore,
}: MatchTimelineProps) {
  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const minA = a.minute + (a.extraMinute ? a.extraMinute * 0.1 : 0);
    const minB = b.minute + (b.extraMinute ? b.extraMinute * 0.1 : 0);
    return minA - minB;
  });

  const isLive = status === "LIVE_1H" || status === "LIVE_2H" || status === "HT" || status === "ET" || status === "PENALTY";

  // Generate factual event description
  const getEventDescription = (ev: ProviderMatchEvent) => {
    if (ev.description) return ev.description;
    const isHome = ev.teamId === homeTeamId;
    const teamName = isHome ? homeTeamName : awayTeamName;

    switch (ev.type) {
      case EventType.GOAL:
        return ev.assistPlayerName
          ? `GOAL! ${ev.playerName || "Player"} scores for ${teamName} (Assist: ${ev.assistPlayerName}).`
          : `GOAL! ${ev.playerName || "Player"} scores for ${teamName}.`;
      case EventType.OWN_GOAL:
        return `OWN GOAL! ${ev.playerName || "Player"} deflects into own net.`;
      case EventType.YELLOW_CARD:
        return `Yellow Card shown to ${ev.playerName || "Player"} (${teamName}) for foul.`;
      case EventType.RED_CARD:
        return `RED CARD! ${ev.playerName || "Player"} (${teamName}) is sent off.`;
      case EventType.SUBSTITUTION:
        return ev.inPlayerName && ev.outPlayerName
          ? `Substitution (${teamName}): ${ev.inPlayerName} replaces ${ev.outPlayerName}.`
          : `Substitution for ${teamName}.`;
      case EventType.VAR:
        return `VAR Review (${teamName}): ${ev.detail || "Incident review by Video Assistant Referee"}.`;
      case EventType.PENALTY_MISSED:
        return `Penalty Missed! Spot kick from ${ev.playerName || "Player"} (${teamName}) is saved or off-target.`;
      default:
        return ev.detail || `${ev.playerName || "Match event"} (${teamName})`;
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.GOAL:
        return <span className="text-sm select-none">⚽</span>;
      case EventType.OWN_GOAL:
        return <span className="text-sm select-none">🥅</span>;
      case EventType.YELLOW_CARD:
        return <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm inline-block shadow-sm" />;
      case EventType.RED_CARD:
        return <span className="w-2.5 h-3.5 bg-brand-red rounded-sm inline-block shadow-sm" />;
      case EventType.SUBSTITUTION:
        return <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />;
      case EventType.VAR:
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      case EventType.PENALTY_MISSED:
        return <MinusCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Group events by match segments: First Half, Second Half, Extra Time, Penalty
  const firstHalfEvents = sortedEvents.filter((e) => e.minute <= 45);
  const secondHalfEvents = sortedEvents.filter((e) => e.minute > 45 && e.minute <= 90);
  const extraTimeEvents = sortedEvents.filter((e) => e.minute > 90 && e.minute <= 120);
  const penaltyEvents = sortedEvents.filter((e) => e.minute > 120);

  const renderEventItem = (ev: ProviderMatchEvent) => {
    const isHome = ev.teamId === homeTeamId;

    return (
      <div
        key={ev.id}
        className={cn(
          "flex items-start gap-3.5 group transition-colors p-2.5 rounded-2xl hover:bg-pitch-950/70 border border-transparent hover:border-pitch-800",
          isHome ? "flex-row" : "flex-row-reverse sm:flex-row"
        )}
      >
        {/* Minute Tag */}
        <div className="shrink-0 w-12 text-center">
          <span className="font-mono font-bold text-xs text-[#c3ff00] bg-pitch-950 px-2 py-1 rounded-md border border-pitch-800 shadow-sm block">
            {ev.minute}&apos;{ev.extraMinute ? `+${ev.extraMinute}` : ""}
          </span>
        </div>

        {/* Icon & Player Avatar */}
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-pitch-950 border border-pitch-800 flex items-center justify-center shadow-inner">
            {getEventIcon(ev.type)}
          </div>
          {ev.playerName && (
            <PlayerAvatar
              playerId={ev.playerId}
              playerName={ev.playerName}
              size="sm"
              team={isHome ? "home" : "away"}
            />
          )}
        </div>

        {/* Content */}
        <div className={cn("flex-1 text-xs", isHome ? "text-left" : "text-right sm:text-left")}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-slate-100">
              {ev.playerName || ev.detail || "Event"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({isHome ? homeTeamName : awayTeamName})
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
            {getEventDescription(ev)}
          </p>

          {ev.assistPlayerName && (
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              👟 Assist: <strong className="text-slate-200">{ev.assistPlayerName}</strong>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#c3ff00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Official Match Timeline & Key Events
          </h3>
        </div>
        {isLive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-red/20 text-brand-red border border-brand-red/30">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
            <span>LIVE {minute}&apos;</span>
          </span>
        )}
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            No match incidents recorded yet.
          </p>
          <span className="text-[11px] text-slate-500 block">
            Goals, bookings, and substitutions will update in real time.
          </span>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-pitch-800">
          {/* Kickoff */}
          <div className="relative pl-11 flex items-center gap-2 text-xs font-mono text-slate-400">
            <div className="absolute left-4.5 w-3 h-3 rounded-full bg-[#c3ff00] border-2 border-pitch-900 -translate-x-1/2" />
            <span className="font-bold text-slate-300">First Half Kickoff</span>
            <span>(0&apos;)</span>
          </div>

          {/* First Half Events */}
          <div className="space-y-2">
            {firstHalfEvents.map(renderEventItem)}
          </div>

          {/* Halftime Divider */}
          <div className="relative pl-11 py-2 flex items-center justify-between text-xs font-mono text-slate-300 bg-pitch-950/80 rounded-xl px-4 border border-pitch-800">
            <div className="absolute left-4.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-pitch-900 -translate-x-1/2" />
            <span className="font-bold">HALF TIME (HT)</span>
            <span className="font-black text-[#c3ff00]">
              {htHomeScore !== undefined && htAwayScore !== undefined ? `${htHomeScore} - ${htAwayScore}` : "HT"}
            </span>
          </div>

          {/* Second Half Events */}
          <div className="space-y-2">
            {secondHalfEvents.map(renderEventItem)}
          </div>

          {/* Extra Time Segment (if applicable) */}
          {extraTimeEvents.length > 0 && (
            <>
              <div className="relative pl-11 py-2 flex items-center justify-between text-xs font-mono text-amber-300 bg-pitch-950/80 rounded-xl px-4 border border-pitch-800">
                <div className="absolute left-4.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-pitch-900 -translate-x-1/2" />
                <span className="font-bold">EXTRA TIME (ET)</span>
                <span className="font-black">
                  {etHomeScore !== undefined && etAwayScore !== undefined ? `${etHomeScore} - ${etAwayScore}` : "ET"}
                </span>
              </div>
              <div className="space-y-2">
                {extraTimeEvents.map(renderEventItem)}
              </div>
            </>
          )}

          {/* Penalty Shootout Segment (if applicable) */}
          {penaltyEvents.length > 0 && (
            <>
              <div className="relative pl-11 py-2 flex items-center justify-between text-xs font-mono text-purple-300 bg-pitch-950/80 rounded-xl px-4 border border-pitch-800">
                <div className="absolute left-4.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-pitch-900 -translate-x-1/2" />
                <span className="font-bold">PENALTY SHOOTOUT</span>
                <span className="font-black">
                  {penaltyHomeScore !== undefined && penaltyAwayScore !== undefined ? `${penaltyHomeScore} - ${penaltyAwayScore}` : "PEN"}
                </span>
              </div>
              <div className="space-y-2">
                {penaltyEvents.map(renderEventItem)}
              </div>
            </>
          )}

          {/* Match Conclusion (if finished) */}
          {status === "FINISHED" && (
            <div className="relative pl-11 flex items-center gap-2 text-xs font-mono text-slate-400">
              <div className="absolute left-4.5 w-3 h-3 rounded-full bg-slate-500 border-2 border-pitch-900 -translate-x-1/2" />
              <span className="font-bold text-slate-300">Full Time / Match Concluded</span>
              <span className="text-[#c3ff00] font-black">({homeScore} - {awayScore})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
