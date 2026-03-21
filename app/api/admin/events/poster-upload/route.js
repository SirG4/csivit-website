import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { uploadEventPosterFromFile } from "@/lib/azureBlob";

const MAX_POSTER_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("poster");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Poster file is required" },
        { status: 400 },
      );
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_POSTER_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Poster image must be 5MB or smaller" },
        { status: 400 },
      );
    }

    const posterUrl = await uploadEventPosterFromFile(file);

    return NextResponse.json(
      {
        success: true,
        posterUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to upload poster" },
      { status: 500 },
    );
  }
}
