import { NextRequest, NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("upload-image: file =", file.name, file.type, file.size);

    // Step 1: Get a Convex upload URL via direct HTTP API (no SDK needed)
    const mutationRes = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "media:generateUploadUrl", args: {} }),
    });

    if (!mutationRes.ok) {
      const text = await mutationRes.text().catch(() => "");
      console.error("upload-image: generateUploadUrl failed", mutationRes.status, text);
      return NextResponse.json({ error: "Could not get upload URL" }, { status: 500 });
    }

    const mutationData = await mutationRes.json();
    console.log("upload-image: mutation response status =", mutationData.status);

    if (mutationData.status !== "success" || !mutationData.value) {
      console.error("upload-image: unexpected mutation response", mutationData);
      return NextResponse.json({ error: "Could not get upload URL" }, { status: 500 });
    }

    const uploadUrl: string = mutationData.value;

    // Step 2: Upload the file bytes directly to the Convex storage URL
    const bytes = await file.arrayBuffer();
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: bytes,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text().catch(() => "");
      console.error("upload-image: storage upload failed", uploadRes.status, text);
      return NextResponse.json({ error: `Storage upload failed: ${uploadRes.status}` }, { status: 500 });
    }

    const { storageId } = await uploadRes.json();
    console.log("upload-image: success, storageId =", storageId);

    return NextResponse.json({ storageId });
  } catch (err: any) {
    console.error("upload-image: unexpected error", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
