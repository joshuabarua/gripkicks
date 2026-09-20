function resolveConvexSiteUrl() {
  const deploymentUrl = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!deploymentUrl) throw new Error("Missing Convex URL");
  return deploymentUrl.replace(".convex.cloud", ".convex.site");
}

export async function bulkUpsertShoesByBrand(brand, shoes) {
  const serviceToken = process.env.CONVEX_SERVICE_TOKEN;
  if (!serviceToken) throw new Error("Missing CONVEX_SERVICE_TOKEN");

  const response = await fetch(`${resolveConvexSiteUrl()}/api/shoes/bulkUpsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceToken}`,
    },
    body: JSON.stringify({ brand, shoes }),
  });
  const responseText = await response.text();
  let result = null;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(`Bulk upsert failed with status ${response.status}: ${responseText.slice(0, 160)}`);
  }
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || `Bulk upsert failed with status ${response.status}`);
  }

  const data = result.data;
  console.log(`Updated: ${data.updatedCount}`);
  console.log(`Created: ${data.createdCount}`);
  if (data.created.length > 0) {
    console.log(`Created: ${data.created.join(", ")}`);
  }
  return data;
}
