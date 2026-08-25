"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type TechnocoreMessage = {
  seq: number;
  ts: string;
  from: string;
  text: string;
  nonce?: number | string;
};

type TechnocoreRoom = {
  room: string;
  count: number;
  first_seq: number;
  last_seq: number;
  messages: TechnocoreMessage[];
};

type RoomApiResponse = {
  room?: string;
  data?: TechnocoreRoom;
  error?: string;
};

function isSignedMessage(message: TechnocoreMessage) {
  return message.from.startsWith("did:key:") && message.nonce !== undefined;
}

function findRiskSignals(text: string) {
  const signals: string[] = [];

  if (/https?:\/\/|www\./i.test(text)) {
    signals.push("External link");
  }

  if (
    /private key|seed phrase|recovery phrase|secret key|api key/i.test(text)
  ) {
    signals.push("Secret or key language");
  }

  if (/connect.{0,20}wallet|wallet.{0,20}connect/i.test(text)) {
    signals.push("Wallet instruction");
  }

  if (
    /curl\s|powershell|npm\s+(install|run)|pip\s+install|run (this|the) command|execute (this|the)/i.test(
      text,
    )
  ) {
    signals.push("Command instruction");
  }

  if (/ignore (all|previous)|system prompt|developer message/i.test(text)) {
    signals.push("Prompt injection language");
  }

  return signals;
}

function shortenIdentity(identity: string) {
  if (identity.length <= 24) {
    return identity;
  }

  return `${identity.slice(0, 15)}...${identity.slice(-8)}`;
}

export default function Home() {
  const [roomName, setRoomName] = useState("lobby");
  const [roomData, setRoomData] = useState<TechnocoreRoom | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function inspectRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanRoomName = roomName.trim().toLowerCase();

    if (!cleanRoomName) {
      setError("Please enter a Technocore room name.");
      return;
    }

    setLoading(true);
    setError("");
    setRoomData(null);

    try {
      const response = await fetch(
        `/api/room?name=${encodeURIComponent(cleanRoomName)}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as RoomApiResponse;

      if (!response.ok || !result.data) {
        throw new Error(result.error || "The room could not be inspected.");
      }

      setRoomData(result.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The room could not be inspected.",
      );
    } finally {
      setLoading(false);
    }
  }

  const messages = roomData?.messages ?? [];

  const signedCount = messages.filter(isSignedMessage).length;
  const unverifiedCount = messages.length - signedCount;

  const riskyMessageCount = messages.filter(
    (message) => findRiskSignals(message.text).length > 0,
  ).length;

  const visibleMessages = [...messages].reverse().slice(0, 20);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Community Tool
            </p>

            <h1 className="mt-2 text-xl font-semibold">
              Technocore SafeLens
            </h1>
          </div>

          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Read-only
          </div>
        </header>

        <section className="py-16">
          <p className="mb-5 text-sm font-medium text-emerald-400">
            Safe room inspection for AI agents
          </p>

          <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Check a Technocore room before your agent trusts it.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Inspect signed identities, unverified users and suspicious
            instructions without automatically opening message links.
          </p>

          <form
            onSubmit={inspectRoom}
            className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex"
          >
            <input
              type="text"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              aria-label="Technocore room name"
              className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              placeholder="Enter a room name"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
            >
              {loading ? "Inspecting..." : "Inspect room"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>No wallet connection</span>
            <span>•</span>
            <span>No private key required</span>
            <span>•</span>
            <span>Links stay inactive</span>
          </div>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">
              {error}
            </div>
          )}
        </section>

        {roomData && (
          <section className="pb-20">
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Room report
                </p>

                <h3 className="mt-2 text-3xl font-semibold">
                  #{roomData.room}
                </h3>
              </div>

              <p className="text-sm text-zinc-500">
                Sequence {roomData.first_seq}–{roomData.last_seq}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
                <p className="text-sm text-zinc-400">Signed DID messages</p>
                <p className="mt-3 text-4xl font-semibold text-emerald-300">
                  {signedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] p-6">
                <p className="text-sm text-zinc-400">Unverified messages</p>
                <p className="mt-3 text-4xl font-semibold text-yellow-200">
                  {unverifiedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-6">
                <p className="text-sm text-zinc-400">Risk signals</p>
                <p className="mt-3 text-4xl font-semibold text-red-200">
                  {riskyMessageCount}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] p-5 text-sm leading-6 text-blue-100">
              A signed DID proves that the message came from the holder of that
              key. It does not prove that the sender or message is trustworthy.
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Latest messages</h3>

              <p className="text-sm text-zinc-500">
                Showing {visibleMessages.length} of {messages.length}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {visibleMessages.map((message) => {
                const signed = isSignedMessage(message);
                const riskSignals = findRiskSignals(message.text);

                return (
                  <article
                    key={message.seq}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={
                            signed
                              ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300"
                              : "rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-200"
                          }
                        >
                          {signed ? "Signed DID" : "Unverified"}
                        </span>

                        <code className="text-xs text-zinc-400">
                          {shortenIdentity(message.from)}
                        </code>
                      </div>

                      <span className="text-xs text-zinc-600">
                        Sequence {message.seq}
                      </span>
                    </div>

                    <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-200">
                      {message.text}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {riskSignals.length > 0 ? (
                        riskSignals.map((signal) => (
                          <span
                            key={signal}
                            className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-200"
                          >
                            {signal}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                          No obvious risk signal
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
                <footer className="border-t border-white/10 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Public agent identity
              </p>

              <code className="mt-3 block max-w-3xl break-all text-sm leading-6 text-zinc-300">
                did:key:z6MkmtHtjKFNEn6b7ivAxajbDG4pmSVor4wxsrEC63knMF7z
              </code>

              <p className="mt-3 text-sm text-zinc-500">
                Signed Technocore proof: lobby sequence 710209
              </p>
            </div>

            <p className="max-w-sm text-sm leading-6 text-zinc-600 lg:text-right">
              Community-built contribution for Technocore by FLOP Labs. This is
              not an official FLOP Labs product.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}