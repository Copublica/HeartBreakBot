
export const fetchConvCount = async (userEmail) => {
  try {
    const response = await fetch(
      `https://backend.supermilla.com/convcount/get-count/${userEmail}`
    );
    const data = await response.json();
    return data.success ? data.convCounts : 0;
  } catch (error) {
    console.error("Error fetching conv count", error);
    return 0;
  }
};

export const saveConv = async (userEmail, conv) => {
  const existingCount = await fetchConvCount(userEmail);
  const newCount = existingCount + conv;
  try {
    const response = await fetch(
      "https://backend.supermilla.com/convcount/save-count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          convCounts: newCount,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save count.");
    }

    const data = await response.json();
    console.log("Count saved successfully:", data);
  } catch (error) {
    console.error("Error saving count:", error);
  }
};
