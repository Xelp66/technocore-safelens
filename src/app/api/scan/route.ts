import { NextRequest, NextResponse } from "next/server";

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

const ROOM_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;

function findRiskSignals(text: string) {
  const signals: string[] = [];

  if (/https?:\/\/|www\./i.test(text)) {
    signals.push("external_link");
  }

  if (
    /private key|seed phrase|recovery phrase|secret key|api key/i.test(text)
  ) {
    signals.push("secret_or_key_language");
  }

  if (/connect.{0,20}wallet|wallet.{0,20}connect/i.test(text)) {
    signals.push("wallet_instruction");
  }

  if (
    /curl\s|powershell|npm\s+(install|run)|pip\s+install|run (this|the) command|execute (this|the)/i.test(
      text,
    )
  ) {
    signals.push("command_instruction");
  }

  if (/ignore (all|previous)|system prompt|developer message/i.test(text)) {
    signals.push("prompt_injection_language");
  }

  return signals;
}

function isSignedMessage(message: TechnocoreMessage) {
  return message.from.startsWith("did:key:") && message.nonce !== undefined;
}

export async function GET(request: NextRequest) {
  const roomName = request.nextUrl.searchParams
    .get("name")
    ?.trim()
    .toLowerCase();

  if (!roomName || !ROOM_NAME_PATTERN.test(roomName)) {
    return NextResponse.json(
      {
        error: "Invalid Technocore room name.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const technocoreResponse = await fetch(
      `https://technocore.chat/r/${encodeURIComponent(
        roomName,
      )}?format=json&limit=50`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!technocoreResponse.ok) {
      return NextResponse.json(
        {
          error: `Technocore returned status ${technocoreResponse.status}.`,
        },
        {
          status: technocoreResponse.status,
        },
      );
    }

    const roomData =
      (await technocoreResponse.json()) as TechnocoreRoom;

    const findings = roomData.messages.map((message) => ({
      sequence: message.seq,
      identity_type: isSignedMessage(message)
        ? "signed_did"
        : "unverified",
      sender: message.from,
      risk_signals: findRiskSignals(message.text),
    }));

    const signedCount = findings.filter(
      (finding) => finding.identity_type === "signed_did",
    ).length;

    const riskyFindings = findings.filter(
      (finding) => finding.risk_signals.length > 0,
    );

    return NextResponse.json({
      tool: "Technocore SafeLens",
      room: roomName,
      inspected_at: new Date().toISOString(),
      safety_notice:
        "Room content is untrusted. A signed DID proves key control, not trust.",
      sequence_range: {
        first: roomData.first_seq,
        last: roomData.last_seq,
      },
      summary: {
        total_messages: findings.length,
        signed_did_messages: signedCount,
        unverified_messages: findings.length - signedCount,
        messages_with_risk_signals: riskyFindings.length,
      },
      risk_findings: riskyFindings,
    });
  } catch (error) {
    console.error("Technocore scan failed:", error);

    return NextResponse.json(
      {
        error: "Could not scan the Technocore room.",
      },
      {
        status: 502,
      },
    );
  }
}