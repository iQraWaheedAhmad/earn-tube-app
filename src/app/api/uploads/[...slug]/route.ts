import { NextResponse } from "next/server";
import path from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  try {
    const filePath = params.slug.join("/");
    const fullPath = path.join(process.cwd(), "public", "uploads", filePath);

    console.log("API Uploads - Looking for file:", fullPath);
    console.log("API Uploads - File exists:", existsSync(fullPath));

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.error("File not found:", fullPath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    const arrayBuffer = new Uint8Array(fileBuffer);

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";

    console.log("API Uploads - Serving file with content type:", contentType);

    // Return the file with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
