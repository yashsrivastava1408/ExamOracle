// ExamPrep AI — API Route for generating exam prep content

import { NextRequest, NextResponse } from "next/server";
import { generateExamPrep } from "@/lib/gemini";
import { GenerateResponse } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { notes } = body;

        if (!notes || typeof notes !== "string") {
            return NextResponse.json<GenerateResponse>(
                { success: false, error: "Notes are required" },
                { status: 400 }
            );
        }

        if (notes.trim().length < 50) {
            return NextResponse.json<GenerateResponse>(
                {
                    success: false,
                    error:
                        "Please provide at least 50 characters of notes for better results",
                },
                { status: 400 }
            );
        }

        if (notes.length > 50000) {
            return NextResponse.json<GenerateResponse>(
                {
                    success: false,
                    error: "Notes are too long. Please keep under 50,000 characters.",
                },
                { status: 400 }
            );
        }

        const data = await generateExamPrep(notes);

        return NextResponse.json<GenerateResponse>({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json<GenerateResponse>(
            {
                success: false,
                error: "The ExamOracle engine experienced an issue processing your request. Please try again with shorter notes.",
            },
            { status: 500 }
        );
    }
}
