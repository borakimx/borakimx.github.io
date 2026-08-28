console.log("Itinerary JS loaded");

const channelSlug = "travel-x1wz8qjaqwa";

const apiUrls = [
  `https://api.are.na/v3/channels/${channelSlug}/contents?per=100`,
  `https://api.are.na/v2/channels/${channelSlug}/contents?per=100`
];

const tbody = document.querySelector("#itinerary") || document.querySelector("tbody");

function cleanHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBlockText(block) {
  return cleanHTML(
    block.content_html ||
    block.content ||
    block.title ||
    block.description ||
    ""
  );
}

function parseBlock(block) {
  const rawText = getBlockText(block);

  const data = {
    in: "",
    out: "",
    location: "",
    purpose: ""
  };

  rawText.split(/\n|<br>/).forEach(line => {
    const [keyPart, ...valueParts] = line.split(":");

    if (!keyPart || valueParts.length === 0) return;

    const key = keyPart.trim().toLowerCase();
    const value = valueParts.join(":").trim();

    if (key === "in") data.in = value;
    if (key === "out") data.out = value;
    if (key === "location") data.location = value;

    if (
      key === "purpose" ||
      key === "purpose of visit"
    ) {
      data.purpose = value;
    }
  });

  return data;
}

function addRow(data) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${escapeHTML(data.in)}</td>
    <td>${escapeHTML(data.out)}</td>
    <td>${escapeHTML(data.location)}</td>
    <td>${escapeHTML(data.purpose)}</td>
  `;

  tbody.appendChild(tr);
}

function isValidRow(data) {
  return data.in || data.out || data.location || data.purpose;
}

async function loadItinerary() {
  if (!tbody) {
    console.error("Table body not found");
    return;
  }

  tbody.innerHTML = "";

  for (const url of apiUrls) {
    try {
      const res = await fetch(url);
      const json = await res.json();

      console.log("Are.na response:", json);

      let blocks = json.data || json.contents || [];

      // 최근 추가된 블록이 위로 오도록 순서 뒤집기
      blocks = [...blocks].reverse();

      blocks.forEach(block => {
        const data = parseBlock(block);

        if (isValidRow(data)) {
          addRow(data);
        }
      });

      if (tbody.children.length > 0) return;

    } catch (error) {
      console.error("Failed to load:", url, error);
    }
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="4">No itinerary blocks found.</td>`;
  tbody.appendChild(tr);
}

loadItinerary();