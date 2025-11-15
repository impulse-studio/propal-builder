const triggerWebhook = async () => {
  const url = "http://localhost:3000/api/webhooks/create-propal";
  const payload = {
    qdrantCollectionId: "plateforme-web-refurb",
    dealSlug: "plateforme-web-refurb",
  };

  try {
    console.log("Triggering webhook...");
    console.log("URL:", url);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log("✅ Success:", responseData);
    } else {
      console.error("❌ Error:", responseData);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to trigger webhook:", error);
    process.exit(1);
  }
};

triggerWebhook();
